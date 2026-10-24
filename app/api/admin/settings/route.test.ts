import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Validation tests for the global settings.
 *
 * The health weights and every macro split are shares of 100: a payload whose
 * shares do not add up would silently distort every user's health score, so
 * the route rejects it before anything is written.
 */

const prismaMock = {
  user: {
    findUnique: vi.fn(),
  },
  appSetting: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const cookieStore = { get: vi.fn() };

vi.mock('next/headers', () => ({
  cookies: async () => cookieStore,
}));

const verifyTokenMock = vi.fn();
vi.mock('@/lib/auth', () => ({ verifyToken: verifyTokenMock }));

const { PATCH } = await import('./route');

function request(body: unknown) {
  return new Request('http://x/api/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

const VALID_WEIGHTS = { bmi: 25, activity: 20, sleep: 15, water: 15, calories: 15, pain: 10 };

const VALID_MACROS = {
  maintain: { protein: 30, carbs: 40, fat: 30 },
  cut: { protein: 40, carbs: 35, fat: 25 },
  bulk: { protein: 25, carbs: 50, fat: 25 },
};

const VALID_NUTRITION = {
  waterPerKgMl: 35,
  defaultWaterMl: 2000,
  calorieAdjust: { maintain: 0, cut: -300, bulk: 300 },
  macros: VALID_MACROS,
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
  prismaMock.appSetting.findUnique.mockResolvedValue(null);
  prismaMock.appSetting.findMany.mockResolvedValue([]);
  prismaMock.$transaction.mockResolvedValue([]);
});

describe('PATCH /api/admin/settings validation', () => {
  it('rejects health weights that do not add up to 100', async () => {
    const res = await PATCH(
      request({ 'health.weights': { ...VALID_WEIGHTS, pain: 5 } }),
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('مجموع وزن‌ها');
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a negative weight', async () => {
    const res = await PATCH(
      request({ 'health.weights': { ...VALID_WEIGHTS, bmi: -25, activity: 45 } }),
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('وزن');
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a macro split that does not add up to 100', async () => {
    // The shared validator tolerates a sum of 99; the route does not.
    const res = await PATCH(
      request({
        'nutrition.config': {
          ...VALID_NUTRITION,
          macros: { ...VALID_MACROS, maintain: { protein: 33, carbs: 33, fat: 33 } },
        },
      }),
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('مجموع سهم');
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('stores settings whose shares add up to exactly 100', async () => {
    const res = await PATCH(
      request({
        'health.weights': VALID_WEIGHTS,
        'nutrition.config': VALID_NUTRITION,
      }),
    );

    expect(res.status).toBe(200);
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(prismaMock.appSetting.upsert).toHaveBeenCalled();
  });
});
