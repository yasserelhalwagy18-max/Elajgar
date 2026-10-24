import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { issueSession } from '@/lib/session';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { verifyPassword } from '@/lib/password';
import { isValidOtpFormat, OTP_MAX_VERIFY_ATTEMPTS } from '@/lib/otp';

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

    // The stored code is a scrypt hash; verification is constant-time inside
    // `verifyPassword`.
    if (!(await verifyPassword(code, otpRecord.code))) {
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

    // A deactivated account must not sign in, and must not even get its
    // lastLoginAt bumped. Checked before the upsert so the sign-in leaves no
    // trace of success.
    const existing = await prisma.user.findUnique({
      where: { phoneNumber },
      select: { isActive: true },
    });

    if (existing && !existing.isActive) {
      return NextResponse.json(
        { error: 'حساب کاربری شما غیرفعال شده است. برای فعال‌سازی با پشتیبانی تماس بگیرید.' },
        { status: 403 }
      );
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { phoneNumber },
      // Record the sign-in so the admin panel can show when a user was last
      // active. The profile itself is never overwritten by a sign-in.
      update: { lastLoginAt: new Date() },
      create: { phoneNumber, lastLoginAt: new Date() },
    });

    // Sign the user in. The same session is issued by the password login, so
    // the two ways of signing in are interchangeable from here on.
    await issueSession(user.id, user.phoneNumber, user.tokenVersion);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
