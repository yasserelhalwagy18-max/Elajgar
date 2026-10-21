import { randomBytes, scrypt, timingSafeEqual } from 'crypto';

/**
 * The scrypt hashing itself.
 *
 * This is a plain `.mjs` module on purpose. The app imports it through
 * `lib/password.ts`, which carries the `server-only` marker, but the command
 * line scripts under `scripts/` need it as well - and they run in plain
 * node, where that marker throws.
 *
 * Keeping the primitive here means the hash format has exactly one home:
 * the app and the scripts cannot drift apart, so a hash written by
 * `npm run admin:set-password` is one the app can read.
 */

/** The cost parameters. N=16384, r=8, p=1 - about 16 MB per hash. */
const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Node needs the memory limit raised explicitly, because the default of
 * 32 MB is just under what these parameters need.
 */
const MAX_MEMORY = 64 * 1024 * 1024;

/**
 * Hash a password with a fresh random salt.
 *
 * @param {string} password
 * @returns {Promise<string>} the hash, in the format `scrypt$N$r$p$salt$hash`
 */
export function hashPassword(password) {
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
 *
 * @param {string} password
 * @param {string} stored
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, stored) {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return false;

  let salt;
  let expected;
  try {
    salt = Buffer.from(parts[4], 'hex');
    expected = Buffer.from(parts[5], 'hex');
  } catch {
    return false;
  }
  if (expected.length !== KEY_LENGTH) return false;

  const derived = await new Promise((resolve, reject) => {
    scrypt(password, salt, expected.length, { N: n, r, p, maxmem: MAX_MEMORY }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });

  return timingSafeEqual(derived, expected);
}
