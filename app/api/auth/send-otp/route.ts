import { NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import prisma from '@/lib/prisma';
import { sendOtpSms } from '@/lib/sms';

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
    const code = randomInt(100000, 1000000).toString();

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

    const otpRecord = await prisma.otpCode.create({
      data: {
        phoneNumber,
        code,
        expiresAt,
      },
    });

    try {
      await sendOtpSms(phoneNumber, code);
    } catch (smsError) {
      console.error('Error sending OTP SMS:', smsError);
      // Don't leave a usable code behind if the SMS never went out
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { consumed: true },
      });
      return NextResponse.json(
        { error: 'ارسال پیامک با خطا مواجه شد. لطفاً دوباره تلاش کنید' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send-otp:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
