import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber || !/^09[0-9]{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'شماره موبایل معتبر نیست' },
        { status: 400 }
      );
    }

    // Generate a 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Invalidate previous unconsumed codes for this phone number
    await prisma.otpCode.updateMany({
      where: {
        phoneNumber,
        consumed: false,
      },
      data: {
        consumed: true,
      },
    });

    // Create a new OTP code with a 5-minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    await prisma.otpCode.create({
      data: {
        phoneNumber,
        code,
        expiresAt,
      },
    });

    // Mock SMS provider call
    console.log(`[MOCK SMS] Sending OTP code ${code} to ${phoneNumber}`);
    // TODO: Add real SMS provider API call here once credentials are available

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send-otp:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
