import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function POST(request: Request) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'شماره موبایل و کد تایید الزامی است' },
        { status: 400 }
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

    if (otpRecord.code !== code) {
      return NextResponse.json(
        { error: 'کد تایید نادرست است' },
        { status: 401 }
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'کد تایید منقضی شده است' },
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
      update: {}, // Don't overwrite existing user data on login
      create: { phoneNumber },
    });

    // Generate JWT token
    const token = await new SignJWT({ userId: user.id, phoneNumber: user.phoneNumber })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Session expires in 7 days
      .sign(encodedSecret);

    // Set JWT in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
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
