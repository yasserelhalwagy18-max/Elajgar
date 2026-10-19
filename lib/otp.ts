import { timingSafeEqual } from 'crypto';

/** How long an OTP stays valid. */
export const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Wrong guesses allowed against a single issued code before it is burned. */
export const OTP_MAX_VERIFY_ATTEMPTS = 5;

/** Codes a single phone number may request inside OTP_SEND_WINDOW_MS. */
export const OTP_MAX_SENDS = 3;

/** Length of the rolling window used by OTP_MAX_SENDS. */
export const OTP_SEND_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export const OTP_CODE_LENGTH = 6;

const CODE_PATTERN = /^[0-9]{6}$/;

export function isValidOtpFormat(code: unknown): code is string {
  return typeof code === 'string' && CODE_PATTERN.test(code);
}

/**
 * Constant-time comparison of two 6-digit codes.
 *
 * The previous implementation used `!==`, which short-circuits on the first
 * differing character and leaks how much of the code was guessed correctly.
 */
export function codesMatch(a: string, b: string): boolean {
  if (!isValidOtpFormat(a) || !isValidOtpFormat(b)) return false;

  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;

  return timingSafeEqual(bufA, bufB);
}
