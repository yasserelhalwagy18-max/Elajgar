import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { issueSession } from '@/lib/session';
import { verifyPassword } from '@/lib/password';
import { rateLimit, clientIp } from '@/lib/rate-limit';

/**
 * Sign in with a phone number and a password.
 *
 * A user sets a password after their first SMS sign-in, so they do not have
 * to wait for a code every time.
 *
 * Two things matter here:
 *
 * - The same message is returned whether the number is unknown or the
 *   password is wrong, so the route cannot be used to find out which phone
 *   numbers have an account.
 * - The attempts are rate limited, so a password cannot be guessed by
 *   trying many of them.
 */

/** How many tries are allowed from one source in the window below. */
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const ipKey = `password-login:ip:${clientIp(request.headers)}`;
    const ipLimit = rateLimit(ipKey, MAX_ATTEMPTS, WINDOW_MS);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'تلاش‌های ناموفق زیاد بود. لطفاً کمی بعد دوباره تلاش کنید' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfter) } },
      );
    }

    let body: { phoneNumber?: unknown; password?: unknown };
    try {
      body = (await request.json()) as { phoneNumber?: unknown; password?: unknown };
    } catch {
      return NextResponse.json({ error: 'درخواست نامعتبر است' }, { status: 400 });
    }

    const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!/^09[0-9]{9}$/.test(phoneNumber) || !password) {
      return NextResponse.json(
        { error: 'شماره موبایل یا رمز عبور درست نیست' },
        { status: 401 },
      );
    }

    // A second limit, per phone number, so one attacker cannot spread the
    // guesses over many source addresses.
    const phoneLimit = rateLimit(
      `password-login:phone:${phoneNumber}`,
      MAX_ATTEMPTS,
      WINDOW_MS,
    );
    if (!phoneLimit.allowed) {
      return NextResponse.json(
        { error: 'تلاش‌های ناموفق زیاد بود. لطفاً کمی بعد دوباره تلاش کنید' },
        { status: 429, headers: { 'Retry-After': String(phoneLimit.retryAfter) } },
      );
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      select: {
        id: true,
        phoneNumber: true,
        isActive: true,
        password: { select: { hash: true } },
      },
    });

    // The same answer either way, so the route cannot be used to find out
    // which numbers have an account.
    const wrong = NextResponse.json(
      { error: 'شماره موبایل یا رمز عبور درست نیست' },
      { status: 401 },
    );

    if (!user || !user.password) return wrong;
    if (!user.isActive) return wrong;

    const ok = await verifyPassword(password, user.password.hash);
    if (!ok) return wrong;

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await issueSession(user.id, user.phoneNumber);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in password login:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
