import 'server-only';

import { hashPassword, verifyPassword } from './scrypt.mjs';

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
 *
 * The hashing itself lives in `lib/scrypt.mjs`, because the command line
 * scripts under `scripts/` need it too and they cannot import a module
 * that carries the `server-only` marker.
 */

export { hashPassword, verifyPassword };

/** The shortest password that is accepted. */
export const MIN_PASSWORD_LENGTH = 8;

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
