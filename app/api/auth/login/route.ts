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

/**
 * A well-formed hash of a value nobody knows, verified on the "no such
 * account" path. Without it the route answers noticeably faster for unknown
 * numbers than for a wrong password, which tells an attacker which phone
 * numbers have a password set.
 */
const DUMMY_HASH =
  'scrypt$16384$8$1$ca59810a982adcee682dfcf736ece953$a841c91deea800bc583817c6ea3417d033d81b9164c063b7755776d4fecfcd3b0246953800a8d69a7de943764be6a7b780188a49deb10ed162e0467e29202b8c';

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
        tokenVersion: true,
        password: { select: { hash: true } },
      },
    });

    // The same answer either way, so the route cannot be used to find out
    // which numbers have an account.
    const wrong = NextResponse.json(
      { error: 'شماره موبایل یا رمز عبور درست نیست' },
      { status: 401 },
    );

    // Exactly one scrypt verification runs on every path, so the response
    // time does not distinguish an unknown number from a wrong password.
    const ok = await verifyPassword(password, user?.password?.hash ?? DUMMY_HASH);
    if (!ok || !user?.isActive) return wrong;

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await issueSession(user.id, user.phoneNumber, user.tokenVersion);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in password login:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
