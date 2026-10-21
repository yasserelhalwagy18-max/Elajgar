import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { getEncodedSecret } from '@/lib/auth';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/session';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { codesMatch, isValidOtpFormat, OTP_MAX_VERIFY_ATTEMPTS } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'شماره موبایل و کد تایید الزامی است' },
        { status: 400 }
      );
    }

    // Validate the request before touching the signing secret or the database.
    if (!isValidOtpFormat(code)) {
      return NextResponse.json(
        { error: 'کد تایید نادرست است' },
        { status: 401 }
      );
    }

    // Per-source-IP limit on verification attempts. The authoritative per-code
    // attempt counter lives on the OtpCode row below.
    const ipLimit = rateLimit(`otp-verify:ip:${clientIp(request.headers)}`, 30, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'تعداد تلاش‌ها زیاد است. لطفاً کمی بعد دوباره تلاش کنید' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfter) } }
      );
    }

    // Find the most recent unconsumed code for this phone number
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phoneNumber,
        consumed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'کد تایید یافت نشد' },
        { status: 401 }
      );
    }

    // Too many wrong guesses against this code: burn it so the remaining
    // lifetime of the code cannot be used for a brute-force sweep.
    if (otpRecord.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { consumed: true },
      });
      return NextResponse.json(
        { error: 'تعداد تلاش‌های ناموفق بیش از حد مجاز است. کد جدید دریافت کنید' },
        { status: 429 }
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'کد تایید منقضی شده است' },
        { status: 401 }
      );
    }

    if (!codesMatch(otpRecord.code, code)) {
      // Count the failed guess and burn the code once the budget is spent.
      const attempts = otpRecord.attempts + 1;
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: {
          attempts,
          consumed: attempts >= OTP_MAX_VERIFY_ATTEMPTS ? true : otpRecord.consumed,
        },
      });
      return NextResponse.json(
        { error: 'کد تایید نادرست است' },
        { status: 401 }
      );
    }

    // Mark code as consumed
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { consumed: true },
    });

    // Upsert user
    const user = await prisma.user.upsert({
      where: { phoneNumber },
      // Record the sign-in so the admin panel can show when a user was last
      // active. The profile itself is never overwritten by a sign-in.
      update: { lastLoginAt: new Date() },
      create: { phoneNumber, lastLoginAt: new Date() },
    });

    // Generate JWT token
    const encodedSecret = getEncodedSecret();
    const token = await new SignJWT({ userId: user.id, phoneNumber: user.phoneNumber })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Session expires in 7 days
      .sign(encodedSecret);

    // Set JWT in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
