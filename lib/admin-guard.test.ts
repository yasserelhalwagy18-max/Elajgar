import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for the admin authorisation guard.
 *
 * The guard is the only thing standing between a normal user and the admin
 * API, so it is worth pinning down: a signed-in user who is not an admin
 * must be refused, and the refusal must not depend on the client.
 */

const prismaMock = {
  user: {
    findUnique: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const cookieStore = { get: vi.fn() };

vi.mock('next/headers', () => ({
  cookies: async () => cookieStore,
}));

const verifyTokenMock = vi.fn();
vi.mock('@/lib/auth', () => ({ verifyToken: verifyTokenMock }));

const { requireAdmin, AdminAuthError } = await import('./admin-guard');

beforeEach(() => {
  vi.clearAllMocks();
  cookieStore.get.mockReturnValue(undefined);
  verifyTokenMock.mockResolvedValue(null);
  prismaMock.user.findUnique.mockResolvedValue(null);
});

describe('requireAdmin', () => {
  it('refuses a request without a session cookie', async () => {
    await expect(requireAdmin()).rejects.toBeInstanceOf(AdminAuthError);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('refuses a request with an invalid token', async () => {
    cookieStore.get.mockReturnValue({ value: 'not-a-real-token' });
    verifyTokenMock.mockResolvedValue(null);

    await expect(requireAdmin()).rejects.toThrow();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('refuses a token that carries no user id', async () => {
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ somethingElse: true });

    await expect(requireAdmin()).rejects.toThrow();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('refuses a signed-in user whose role is USER', async () => {
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ userId: 'u1' });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      phoneNumber: '09120000000',
      role: 'USER',
      isActive: true,
    });

    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });

  it('refuses a deactivated admin', async () => {
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ userId: 'u1' });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      phoneNumber: '09120000000',
      role: 'ADMIN',
      isActive: false,
    });

    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });

  it('refuses a token whose user no longer exists', async () => {
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ userId: 'gone' });
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
  });

  it('lets an active admin through', async () => {
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ userId: 'u1' });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      phoneNumber: '09120000000',
      role: 'ADMIN',
      isActive: true,
    });

    await expect(requireAdmin()).resolves.toEqual({ id: 'u1', phoneNumber: '09120000000' });
  });

  it('reads the role from the database instead of trusting the token', async () => {
    // A token that claims to be an admin is not enough: the role is always
    // re-read, so revoking it takes effect immediately.
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ userId: 'u1', role: 'ADMIN' });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      phoneNumber: '09120000000',
      role: 'USER',
      isActive: true,
    });

    await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
  });
});
