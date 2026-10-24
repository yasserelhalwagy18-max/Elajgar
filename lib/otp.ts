/**
 * OTP policy constants and format validation.
 *
 * Codes are stored as salted scrypt hashes (`hashPassword` from
 * `lib/password`), the same way passwords are: a database read must not hand
 * out live login codes.
 */

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
