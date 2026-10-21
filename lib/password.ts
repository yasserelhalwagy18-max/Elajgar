import 'server-only';

import { randomBytes, scrypt, timingSafeEqual } from 'crypto';

/**
 * Password hashing.
 *
 * `scrypt` from Node's own crypto module is used rather than a dependency:
 * it is a memory-hard function, which is what makes it worth using for
 * passwords, and it is already there.
 *
 * The stored format is `scrypt$N$r$p$salt$hash`, so the parameters travel
 * with the hash and can be raised later without invalidating the passwords
 * that are already stored.
 */

/** The cost parameters. N=16384, r=8, p=1 - about 16 MB per hash. */
const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/** The shortest password that is accepted. */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * The scrypt parameters the stored hash was made with.
 *
 * Node needs the memory limit raised explicitly, because the default of
 * 32 MB is just under what these parameters need.
 */
const MAX_MEMORY = 64 * 1024 * 1024;

/** Hash a password with a fresh random salt. */
export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(SALT_LENGTH);

    scrypt(password, salt, KEY_LENGTH, { N, r: R, p: P, maxmem: MAX_MEMORY }, (error, derived) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(
        ['scrypt', N, R, P, salt.toString('hex'), derived.toString('hex')].join('$'),
      );
    });
  });
}

/**
 * Check a password against a stored hash.
 *
 * The comparison is in constant time, so the time it takes does not depend
 * on how much of the hash was guessed correctly.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[4]!, 'hex');
    expected = Buffer.from(parts[5]!, 'hex');
  } catch {
    return false;
  }
  if (expected.length !== KEY_LENGTH) return false;

  const derived = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, expected.length, { N: n, r, p, maxmem: MAX_MEMORY }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });

  return timingSafeEqual(derived, expected);
}

/**
 * Whether a password is acceptable.
 *
 * Returns the reason it is not, so the caller can show it to the user.
 */
export function checkPasswordStrength(password: string): string | null {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `رمز عبور باید حداقل ${MIN_PASSWORD_LENGTH} کاراکتر باشد`;
  }
  if (password.length > 200) {
    return 'رمز عبور خیلی طولانی است';
  }
  return null;
}
