import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Password login.
 *
 * The route must not reveal which phone numbers have an account - same
 * answer, and the same amount of work, on every failure path - and a
 * deactivated account must not get a session.
 */

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const cookieSet = vi.fn();
vi.mock('next/headers', () => ({
  cookies: async () => ({ set: cookieSet, delete: vi.fn() }),
}));

const signMock = vi.fn(async () => 'signed-token');
const signPayloads: unknown[] = [];
vi.mock('jose', () => ({
  SignJWT: class {
    constructor(payload: unknown) {
      signPayloads.push(payload);
    }
    setProtectedHeader() { return this; }
    setIssuedAt() { return this; }
    setExpirationTime() { return this; }
    async sign() { return signMock(); }
  },
  jwtVerify: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => ({ allowed: true, retryAfter: 0 })),
  clientIp: vi.fn(() => '127.0.0.1'),
}));

const verifyPasswordMock = vi.fn(async (_password: string, _hash: string): Promise<boolean> => false);
vi.mock('@/lib/password', () => ({
  verifyPassword: (password: string, hash: string) => verifyPasswordMock(password, hash),
}));

const { POST: login } = await import('./route');

const PHONE = '09123456789';

const makeRequest = (body: unknown) =>
  new Request('http://x/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const userWithPassword = {
  id: 'user_1',
  phoneNumber: PHONE,
  isActive: true,
  tokenVersion: 7,
  password: { hash: 'scrypt$16384$8$1$real$real' },
};

beforeEach(() => {
  vi.clearAllMocks();
  signPayloads.length = 0;
  prismaMock.user.findUnique.mockResolvedValue(null);
  prismaMock.user.update.mockResolvedValue({});
  verifyPasswordMock.mockResolvedValue(false);
});

describe('POST /api/auth/login', () => {
  it('answers the same 401 for an unknown number and for a wrong password', async () => {
    const unknown = await login(makeRequest({ phoneNumber: '09120000000', password: 'whatever1' }));
    const unknownBody = await unknown.json();

    prismaMock.user.findUnique.mockResolvedValue(userWithPassword);
    const wrongPassword = await login(makeRequest({ phoneNumber: PHONE, password: 'whatever1' }));
    const wrongBody = await wrongPassword.json();

    expect(unknown.status).toBe(401);
    expect(wrongPassword.status).toBe(401);
    expect(wrongBody.error).toBe(unknownBody.error);
  });

  it('verifies a password even for an unknown number, so timing does not tell', async () => {
    await login(makeRequest({ phoneNumber: '09120000000', password: 'whatever1' }));

    // One scrypt run against the dummy hash - the same work as the real path.
    expect(verifyPasswordMock).toHaveBeenCalledTimes(1);
    expect(verifyPasswordMock).toHaveBeenCalledWith('whatever1', expect.stringContaining('scrypt$'));
  });

  it('refuses a deactivated account even with the right password', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...userWithPassword, isActive: false });
    verifyPasswordMock.mockResolvedValue(true);

    const res = await login(makeRequest({ phoneNumber: PHONE, password: 'correct-horse' }));

    expect(res.status).toBe(401);
    expect(cookieSet).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('issues a session that carries the account token version', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userWithPassword);
    verifyPasswordMock.mockResolvedValue(true);

    const res = await login(makeRequest({ phoneNumber: PHONE, password: 'correct-horse' }));

    expect(res.status).toBe(200);
    expect(cookieSet).toHaveBeenCalledWith(
      'session',
      'signed-token',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
    // The version inside the token is what a later revocation compares against.
    expect(signPayloads[0]).toMatchObject({ userId: 'user_1', tokenVersion: 7 });
  });
});
