import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  checkPasswordStrength,
  MIN_PASSWORD_LENGTH,
} from './password';

/**
 * Tests for the password hashing.
 *
 * A password is the one thing in the app that cannot be recovered if it is
 * lost, so the hashing has to be right: a salt per password, a memory-hard
 * function, and a comparison that does not leak how much was guessed right.
 */
describe('hashPassword', () => {
  it('produces a hash that is not the password', async () => {
    const hash = await hashPassword('correct horse battery');
    expect(hash).not.toContain('correct horse battery');
  });

  it('produces a different hash every time, because the salt is random', async () => {
    const first = await hashPassword('same password');
    const second = await hashPassword('same password');
    expect(first).not.toBe(second);
  });

  it('keeps the parameters in the hash, so they can be raised later', async () => {
    const hash = await hashPassword('a password');
    expect(hash.startsWith('scrypt$')).toBe(true);
    const parts = hash.split('$');
    expect(parts).toHaveLength(6);
    expect(parts[1]).toBe('16384');
    expect(parts[2]).toBe('8');
    expect(parts[3]).toBe('1');
  });
});

describe('verifyPassword', () => {
  it('accepts the right password', async () => {
    const hash = await hashPassword('correct horse battery');
    await expect(verifyPassword('correct horse battery', hash)).resolves.toBe(true);
  });

  it('rejects the wrong password', async () => {
    const hash = await hashPassword('correct horse battery');
    await expect(verifyPassword('correct horse batteru', hash)).resolves.toBe(false);
  });

  it('rejects a password that is a prefix of the right one', async () => {
    const hash = await hashPassword('correct horse battery');
    await expect(verifyPassword('correct', hash)).resolves.toBe(false);
  });

  it('rejects an empty password', async () => {
    const hash = await hashPassword('correct horse battery');
    await expect(verifyPassword('', hash)).resolves.toBe(false);
  });

  it('rejects a hash that is not in the expected format', async () => {
    await expect(verifyPassword('anything', 'not-a-hash')).resolves.toBe(false);
    await expect(verifyPassword('anything', '')).resolves.toBe(false);
    await expect(verifyPassword('anything', 'scrypt$1$2$3$zz')).resolves.toBe(false);
  });

  it('rejects a hash whose key is the wrong length', async () => {
    const hash = await hashPassword('correct horse battery');
    const parts = hash.split('$');
    parts[5] = 'abcd';
    await expect(verifyPassword('correct horse battery', parts.join('$'))).resolves.toBe(false);
  });
});

describe('checkPasswordStrength', () => {
  it('accepts a long enough password', () => {
    expect(checkPasswordStrength('12345678')).toBeNull();
  });

  it('rejects a password that is too short', () => {
    const problem = checkPasswordStrength('1234567');
    expect(problem).toBeTruthy();
    expect(problem).toContain(String(MIN_PASSWORD_LENGTH));
  });

  it('rejects a password that is far too long', () => {
    expect(checkPasswordStrength('a'.repeat(500))).toBeTruthy();
  });
});
