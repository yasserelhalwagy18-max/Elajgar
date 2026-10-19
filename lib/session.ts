import 'server-only';
import { cookies } from 'next/headers';
import { verifyToken } from './auth';

/**
 * Reads the signed session cookie and returns the authenticated user id.
 *
 * This is the ONLY supported way to identify the current user. Never trust a
 * user id, phone number or role supplied by the client — always derive it from
 * the session cookie.
 */
export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || typeof payload.userId !== 'string') return null;

  return payload.userId;
}

export const SESSION_COOKIE_NAME = 'session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days
