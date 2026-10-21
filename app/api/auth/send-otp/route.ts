import { NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import prisma from '@/lib/prisma';
import { sendOtpSms, smsFailureMessage } from '@/lib/sms';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import {
  OTP_MAX_SENDS,
  OTP_SEND_WINDOW_MS,
  OTP_TTL_MS,
  OTP_CODE_LENGTH,
} from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber || !/^09[0-9]{9}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'شماره موبایل معتبر نیست' },
        { status: 400 }
      );
    }

    // --- Rate limiting ---------------------------------------------------
    // Layer 1: per source IP, to blunt SMS bombing across many numbers.
    // The counter is only incremented for a message that actually went out
    // (see below): a server that cannot send at all would otherwise burn
    // the user's whole budget with every click.
    const ipKey = `otp-send:ip:${clientIp(request.headers)}`;
    const ipLimit = rateLimit(ipKey, 10, OTP_SEND_WINDOW_MS, { consume: false });
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'تعداد درخواست‌ها زیاد است. لطفاً بعداً تلاش کنید' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfter) } }
      );
    }

    // Layer 2: per phone number, authoritative (survives restarts/instances).
    const recentSends = await prisma.otpCode.count({
      where: {
        phoneNumber,
        createdAt: { gte: new Date(Date.now() - OTP_SEND_WINDOW_MS) },
      },
    });

    if (recentSends >= OTP_MAX_SENDS) {
      return NextResponse.json(
        { error: 'تعداد کدهای ارسال‌شده بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید' },
        { status: 429 }
      );
    }

    // Generate a 6-digit random code
    const code = randomInt(0, 10 ** OTP_CODE_LENGTH).toString().padStart(OTP_CODE_LENGTH, '0');

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
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

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
        { error: smsFailureMessage(smsError) },
        { status: 502 }
      );
    }

    // The message went out, so this request counts against the IP budget.
    rateLimit(ipKey, 10, OTP_SEND_WINDOW_MS, { consume: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send-otp:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
