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

        const apiKey = process.env.SMS_IR_API_KEY;
    const lineNumber = process.env.SMS_IR_LINE_NUMBER;

    if (apiKey && lineNumber) {
      // Send real SMS
      const messageText = `کد تایید شما: ${code}`;
      const response = await fetch('https://api.sms.ir/v1/send/bulk', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'ACCEPT': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lineNumber: Number(lineNumber),
          MessageText: messageText,
          Mobiles: [phoneNumber],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[SMS.ir Error]:', errorData);
        // We log the error but still return success to the user so they can potentially try again
        // or we could return a 500 error if we strictly require the SMS to succeed.
        // For OTP, usually it's best to fail if the SMS failed, but for fallback/testing
        // we might want to just log it if we aren't completely sure. Let's return error on fail.
        return NextResponse.json(
          { error: 'خطا در ارسال پیامک' },
          { status: 500 }
        );
      }
    } else {
      // Mock SMS provider call
      console.log(`[MOCK SMS] Sending OTP code ${code} to ${phoneNumber}`);
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
