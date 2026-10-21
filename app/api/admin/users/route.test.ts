import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Access control tests for the admin API.
 *
 * Every admin route has to refuse a caller who is not an admin, and it has
 * to do so before it touches the database. A panel that renders real user
 * data is exactly the kind of endpoint where a missing check leaks.
 */

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const cookieStore = { get: vi.fn() };

vi.mock('next/headers', () => ({
  cookies: async () => cookieStore,
}));

const verifyTokenMock = vi.fn();
vi.mock('@/lib/auth', () => ({ verifyToken: verifyTokenMock }));

const { GET } = await import('./route');

beforeEach(() => {
  vi.clearAllMocks();
  cookieStore.get.mockReturnValue(undefined);
  verifyTokenMock.mockResolvedValue(null);
  prismaMock.user.findUnique.mockResolvedValue(null);
});

describe('/api/admin/users access control', () => {
  it('refuses a request without a session cookie', async () => {
    const res = await GET(new Request('http://x/api/admin/users'));

    expect(res.status).toBe(401);
    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  });

  it('refuses a signed-in user who is not an admin', async () => {
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ userId: 'u1' });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      phoneNumber: '09120000000',
      role: 'USER',
      isActive: true,
    });

    const res = await GET(new Request('http://x/api/admin/users'));

    expect(res.status).toBe(403);
    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  });

  it('serves the list to an admin', async () => {
    cookieStore.get.mockReturnValue({ value: 'token' });
    verifyTokenMock.mockResolvedValue({ userId: 'u1' });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      phoneNumber: '09120000000',
      role: 'ADMIN',
      isActive: true,
    });
    prismaMock.user.findMany.mockResolvedValue([]);
    prismaMock.user.count.mockResolvedValue(0);

    const res = await GET(new Request('http://x/api/admin/users'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ items: [], total: 0 });
    expect(prismaMock.user.findMany).toHaveBeenCalled();
  });
});
