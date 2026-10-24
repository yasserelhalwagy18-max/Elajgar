import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * The money path.
 *
 * The gateway is a mock (documented in the checkout page), but the rules
 * that must hold even with a real gateway live here: the amount is set by
 * the server, a payment can only be confirmed by its owner, and internal
 * errors are never echoed back to the client.
 */

const prismaMock = {
  plan: { findFirst: vi.fn() },
  payment: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const getSessionUserIdMock = vi.fn(async (): Promise<string | null> => 'user_1');
vi.mock('@/lib/session', () => ({
  getSessionUserId: () => getSessionUserIdMock(),
}));

const getActiveSubscriptionMock = vi.fn(async (_userId: string): Promise<unknown> => null);
const activateSubscriptionMock = vi.fn(async (_paymentId: string): Promise<unknown> => ({}));
vi.mock('@/lib/subscription', () => {
  class CheckoutError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'CheckoutError';
    }
  }
  return {
    CheckoutError,
    getActiveSubscription: (userId: string) => getActiveSubscriptionMock(userId),
    activateSubscription: (paymentId: string) => activateSubscriptionMock(paymentId),
  };
});

const { POST: checkout } = await import('./route');
const { POST: confirm } = await import('./confirm/route');
const { CheckoutError } = await import('@/lib/subscription');

const PLAN = {
  id: 'plan_1',
  key: 'pro',
  title: 'Pro',
  price: 500000,
  durationDays: 30,
  isActive: true,
};

const makeRequest = (body: unknown) =>
  new Request('http://x', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  getSessionUserIdMock.mockResolvedValue('user_1');
  getActiveSubscriptionMock.mockResolvedValue(null);
  activateSubscriptionMock.mockResolvedValue({
    subscription: { id: 'sub_1', status: 'ACTIVE', startedAt: new Date(), expiresAt: new Date() },
    payment: { id: 'pay_1', amount: PLAN.price, status: 'PAID' },
  });
  prismaMock.plan.findFirst.mockResolvedValue(PLAN);
  prismaMock.payment.findFirst.mockResolvedValue(null);
  prismaMock.payment.findUnique.mockResolvedValue({
    id: 'pay_1',
    userId: 'user_1',
    reference: 'MOCK-ABC',
    amount: PLAN.price,
    status: 'PENDING',
  });
  prismaMock.payment.create.mockResolvedValue({
    id: 'pay_1',
    reference: 'MOCK-ABC',
    amount: PLAN.price,
  });
});

describe('POST /api/checkout', () => {
  it('creates a pending payment with the server-side amount', async () => {
    const res = await checkout(makeRequest({ planKey: 'pro' }));

    expect(res.status).toBe(200);
    expect(prismaMock.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user_1',
          amount: PLAN.price,
          status: 'PENDING',
        }),
      }),
    );
  });

  it('reuses the pending payment instead of piling up rows on a double click', async () => {
    prismaMock.payment.findFirst.mockResolvedValue({
      id: 'pay_old',
      reference: 'MOCK-OLD',
      amount: PLAN.price,
    });

    const res = await checkout(makeRequest({ planKey: 'pro' }));
    const body = await res.json();

    expect(body.reference).toBe('MOCK-OLD');
    expect(prismaMock.payment.create).not.toHaveBeenCalled();
  });

  it('refuses to start a checkout without a session', async () => {
    getSessionUserIdMock.mockResolvedValue(null);

    const res = await checkout(makeRequest({ planKey: 'pro' }));

    expect(res.status).toBe(401);
    expect(prismaMock.payment.create).not.toHaveBeenCalled();
  });
});

describe('POST /api/checkout/confirm', () => {
  it('confirms the caller own payment and returns the subscription', async () => {
    const res = await confirm(makeRequest({ reference: 'MOCK-ABC' }));

    expect(res.status).toBe(200);
    expect(activateSubscriptionMock).toHaveBeenCalledWith('pay_1');
  });

  it('refuses to confirm a payment that belongs to somebody else', async () => {
    prismaMock.payment.findUnique.mockResolvedValue({
      id: 'pay_1',
      userId: 'someone_else',
      reference: 'MOCK-ABC',
    });

    const res = await confirm(makeRequest({ reference: 'MOCK-ABC' }));

    expect(res.status).toBe(403);
    expect(activateSubscriptionMock).not.toHaveBeenCalled();
  });

  it('answers 400 with the friendly message for a deliberate payment problem', async () => {
    activateSubscriptionMock.mockRejectedValue(new CheckoutError('پرداخت یافت نشد'));

    const res = await confirm(makeRequest({ reference: 'MOCK-ABC' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('پرداخت یافت نشد');
  });

  it('never echoes an internal error back to the client', async () => {
    activateSubscriptionMock.mockRejectedValue(new Error('prisma boom: SELECT `payment` ...'));

    const res = await confirm(makeRequest({ reference: 'MOCK-ABC' }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).not.toContain('prisma boom');
    expect(typeof body.error).toBe('string');
  });

  it('rejects an empty reference before touching the database', async () => {
    const res = await confirm(makeRequest({ reference: '' }));

    expect(res.status).toBe(400);
    expect(prismaMock.payment.findUnique).not.toHaveBeenCalled();
  });
});
