import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Validation tests for creating a plan.
 *
 * The API is the trust boundary: the panel validates the form, but anyone
 * can POST here, so the required fields, the price and the duration are
 * checked before anything is written.
 */

const prismaMock = {
  user: {
    findUnique: vi.fn(),
  },
  plan: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
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

const { POST } = await import('./route');
const { PATCH } = await import('./[id]/route');

function request(body: unknown) {
  return new Request('http://x/api/admin/plans', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  key: 'pro',
  title: 'پلن حرفه‌ای',
  price: 199000,
  durationDays: 30,
  isActive: true,
  isFeatured: false,
  sortOrder: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  cookieStore.get.mockReturnValue({ value: 'token' });
  verifyTokenMock.mockResolvedValue({ userId: 'u1' });
  prismaMock.user.findUnique.mockResolvedValue({
    id: 'u1',
    phoneNumber: '09120000000',
    role: 'ADMIN',
    isActive: true,
  });
  prismaMock.plan.create.mockResolvedValue({ id: 'p1' });
});

describe('POST /api/admin/plans validation', () => {
  it('rejects a price that is not greater than zero', async () => {
    for (const price of [0, -10]) {
      const res = await POST(request({ ...VALID_BODY, price }));

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('قیمت');
      expect(prismaMock.plan.create).not.toHaveBeenCalled();
    }
  });

  it('rejects a missing or non-numeric price', async () => {
    for (const price of [undefined, 'free', null]) {
      const res = await POST(request({ ...VALID_BODY, price }));

      expect(res.status).toBe(400);
      expect(prismaMock.plan.create).not.toHaveBeenCalled();
    }
  });

  it('rejects a duration below one day', async () => {
    for (const durationDays of [0, -3]) {
      const res = await POST(request({ ...VALID_BODY, durationDays }));

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('مدت اشتراک');
      expect(prismaMock.plan.create).not.toHaveBeenCalled();
    }
  });

  it('rejects an empty key or title', async () => {
    for (const body of [{ ...VALID_BODY, key: '' }, { ...VALID_BODY, title: '   ' }]) {
      const res = await POST(request(body));

      expect(res.status).toBe(400);
      expect(prismaMock.plan.create).not.toHaveBeenCalled();
    }
  });

  it('creates the plan when the body is valid', async () => {
    const res = await POST(request(VALID_BODY));

    expect(res.status).toBe(201);
    expect(prismaMock.plan.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ key: 'pro', price: 199000, durationDays: 30 }),
      }),
    );
  });
});

describe('PATCH /api/admin/plans/[id] validation', () => {
  const patch = (body: unknown) =>
    PATCH(
      new Request('http://x/api/admin/plans/p1', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ id: 'p1' }) },
    );

  beforeEach(() => {
    prismaMock.plan.findUnique.mockResolvedValue({ id: 'p1', price: 199000, durationDays: 30 });
    prismaMock.plan.update.mockResolvedValue({ id: 'p1' });
    prismaMock.auditLog.create.mockResolvedValue({});
  });

  it('rejects a price that is not greater than zero', async () => {
    for (const price of [0, -10]) {
      const res = await patch({ price });

      expect(res.status).toBe(400);
      expect(prismaMock.plan.update).not.toHaveBeenCalled();
    }
  });

  it('rejects a duration below one day', async () => {
    for (const durationDays of [0, -3]) {
      const res = await patch({ durationDays });

      expect(res.status).toBe(400);
      expect(prismaMock.plan.update).not.toHaveBeenCalled();
    }
  });

  it('updates the plan when the body is valid', async () => {
    const res = await patch({ price: 250000 });

    expect(res.status).toBe(200);
    expect(prismaMock.plan.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ price: 250000 }),
      }),
    );
  });
});
