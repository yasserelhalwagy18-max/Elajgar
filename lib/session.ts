import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { verifyToken, getEncodedSecret } from './auth';
import prisma from './prisma';

/**
 * Reads the signed session cookie and returns the authenticated user id.
 *
 * This is the ONLY supported way to identify the current user. Never trust a
 * user id, phone number or role supplied by the client — always derive it from
 * the session cookie.
 *
 * The token alone is not enough: the account is re-read on every call, so a
 * user an admin has deactivated, or whose sessions were revoked by a password
 * change (`tokenVersion` bump), loses access immediately instead of when the
 * token expires.
 */
export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || typeof payload.userId !== 'string') return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { isActive: true, tokenVersion: true },
  });

  if (!user || !user.isActive) return null;

  const tokenVersion = typeof payload.tokenVersion === 'number' ? payload.tokenVersion : 0;
  if (user.tokenVersion !== tokenVersion) return null;

  return payload.userId;
}

export const SESSION_COOKIE_NAME = 'session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Sign a session token and put it in the cookie.
 *
 * Both ways of signing in - an SMS code and a password - end up here, so
 * they produce exactly the same session. The account's current
 * `tokenVersion` travels inside the token so a later bump can revoke it.
 */
export async function issueSession(
  userId: string,
  phoneNumber: string | null,
  tokenVersion = 0,
): Promise<void> {
  const encodedSecret = getEncodedSecret();

  const token = await new SignJWT({ userId, phoneNumber, tokenVersion })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedSecret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });
}

/** Clear the session cookie. */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
