import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Setting or changing the password.
 *
 * A credential change must revoke every outstanding session (a stolen cookie
 * must not survive it) while keeping the user who made the change signed in.
 */

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  hashedPassword: {
    upsert: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const sessionUserId = vi.fn(async (): Promise<string | null> => 'user_1');
const issueSessionMock = vi.fn(async (_userId: string, _phoneNumber: string | null, _tokenVersion: number) => {});
vi.mock('@/lib/session', () => ({
  getSessionUserId: () => sessionUserId(),
  issueSession: (userId: string, phoneNumber: string | null, tokenVersion: number) =>
    issueSessionMock(userId, phoneNumber, tokenVersion),
}));

const verifyPasswordMock = vi.fn(async (_password: string, _hash: string): Promise<boolean> => true);
const hashPasswordMock = vi.fn(async (_password: string): Promise<string> => 'scrypt$new$hash');
const checkPasswordStrengthMock = vi.fn((_password: string): string | null => null);
vi.mock('@/lib/password', () => ({
  verifyPassword: (password: string, hash: string) => verifyPasswordMock(password, hash),
  hashPassword: (password: string) => hashPasswordMock(password),
  checkPasswordStrength: (password: string) => checkPasswordStrengthMock(password),
}));

const { POST: setPassword } = await import('./route');

const HASH = 'scrypt$16384$8$1$abcd$efgh';

const makeRequest = (body: unknown) =>
  new Request('http://x/api/auth/set-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  sessionUserId.mockResolvedValue('user_1');
  prismaMock.user.findUnique.mockResolvedValue({
    id: 'user_1',
    phoneNumber: '09123456789',
    password: { hash: HASH },
  });
  prismaMock.user.update.mockResolvedValue({ tokenVersion: 4 });
  prismaMock.hashedPassword.upsert.mockResolvedValue({});
  verifyPasswordMock.mockResolvedValue(true);
  hashPasswordMock.mockResolvedValue('scrypt$new$hash');
  checkPasswordStrengthMock.mockReturnValue(null);
});

describe('POST /api/auth/set-password', () => {
  it('revokes every outstanding session and re-issues this one', async () => {
    const res = await setPassword(makeRequest({ password: 'new-password-1', currentPassword: 'old-password' }));

    expect(res.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: { tokenVersion: { increment: 1 } },
      select: { tokenVersion: true },
    });
    expect(issueSessionMock).toHaveBeenCalledWith('user_1', '09123456789', 4);
  });

  it('refuses a wrong current password and stores nothing', async () => {
    verifyPasswordMock.mockResolvedValue(false);

    const res = await setPassword(makeRequest({ password: 'new-password-1', currentPassword: 'wrong' }));

    expect(res.status).toBe(403);
    expect(prismaMock.hashedPassword.upsert).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('refuses a weak password before touching anything', async () => {
    checkPasswordStrengthMock.mockReturnValue('password too weak');

    const res = await setPassword(makeRequest({ password: 'short' }));

    expect(res.status).toBe(400);
    expect(prismaMock.hashedPassword.upsert).not.toHaveBeenCalled();
    expect(issueSessionMock).not.toHaveBeenCalled();
  });

  it('requires the current password when one is already set', async () => {
    const res = await setPassword(makeRequest({ password: 'new-password-1' }));

    expect(res.status).toBe(400);
    expect(prismaMock.hashedPassword.upsert).not.toHaveBeenCalled();
  });
});
