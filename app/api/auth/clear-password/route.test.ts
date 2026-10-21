import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Removing a password from inside the app.
 *
 * Until now this was only possible from the command line
 * (`npm run admin:clear-password`), so a user who wanted to go back to
 * signing in with an SMS code only had to ask somebody with access to the
 * server. The route has to be as careful as the one that changes the
 * password: the current password is required.
 */

const prismaMock = {
  user: {
    findUnique: vi.fn(),
  },
  hashedPassword: {
    deleteMany: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const sessionUserId = vi.fn(async (): Promise<string | null> => 'user_1');
vi.mock('@/lib/session', () => ({
  getSessionUserId: () => sessionUserId(),
}));

const verifyPassword = vi.fn(async (_password: string, _hash: string) => true);
vi.mock('@/lib/password', () => ({
  verifyPassword: (password: string, hash: string) => verifyPassword(password, hash),
}));

const { DELETE: clearPassword } = await import('./route');

const HASH = 'scrypt$16384$8$1$abcd$efgh';

const makeRequest = (body: unknown) =>
  new Request('http://x/api/auth/clear-password', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  sessionUserId.mockResolvedValue('user_1');
  prismaMock.user.findUnique.mockResolvedValue({
    id: 'user_1',
    password: { hash: HASH },
  });
  prismaMock.hashedPassword.deleteMany.mockResolvedValue({ count: 1 });
  verifyPassword.mockResolvedValue(true);
});

describe('DELETE /api/auth/clear-password', () => {
  it('removes the password when the current one is right', async () => {
    const res = await clearPassword(makeRequest({ currentPassword: 'correct-horse' }));

    expect(res.status).toBe(200);
    expect(prismaMock.hashedPassword.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user_1' },
    });
  });

  it('refuses a caller without a session', async () => {
    sessionUserId.mockResolvedValue(null);

    const res = await clearPassword(makeRequest({ currentPassword: 'correct-horse' }));

    expect(res.status).toBe(401);
    expect(prismaMock.hashedPassword.deleteMany).not.toHaveBeenCalled();
  });

  it('refuses a wrong current password and keeps the password', async () => {
    verifyPassword.mockResolvedValue(false);

    const res = await clearPassword(makeRequest({ currentPassword: 'wrong' }));

    expect(res.status).toBe(403);
    expect(prismaMock.hashedPassword.deleteMany).not.toHaveBeenCalled();
  });

  it('refuses a request without the current password', async () => {
    const res = await clearPassword(makeRequest({}));

    expect(res.status).toBe(400);
    expect(verifyPassword).not.toHaveBeenCalled();
    expect(prismaMock.hashedPassword.deleteMany).not.toHaveBeenCalled();
  });

  it('is happy when the account has no password to begin with', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user_1', password: null });

    const res = await clearPassword(makeRequest({}));

    expect(res.status).toBe(200);
    expect(prismaMock.hashedPassword.deleteMany).not.toHaveBeenCalled();
  });

  it('answers 404 for an account that does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await clearPassword(makeRequest({ currentPassword: 'correct-horse' }));

    expect(res.status).toBe(404);
    expect(prismaMock.hashedPassword.deleteMany).not.toHaveBeenCalled();
  });
});
