import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for the subscription logic.
 *
 * The money path is the part of the app that must not be wrong: a payment
 * that does not grant access, or a refund that does not revoke it, is a
 * real bug.
 */

const prismaMock = {
  subscription: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
  },
  payment: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  plan: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(async (fn: (tx: any) => Promise<unknown>) => fn(prismaMock)),
};

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

const { isSubscriptionActive, activateSubscription, refundPayment } = await import('./subscription');

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation(async (fn: (tx: any) => Promise<unknown>) =>
    fn(prismaMock),
  );
});

describe('isSubscriptionActive', () => {
  it('is true for an active subscription that has not run out', () => {
    const now = new Date('2026-01-10');
    const subscription = {
      status: 'ACTIVE' as const,
      expiresAt: new Date('2026-02-10'),
    };

    expect(isSubscriptionActive(subscription, now)).toBe(true);
  });

  it('is false for a cancelled subscription', () => {
    const now = new Date('2026-01-10');
    const subscription = {
      status: 'CANCELED' as const,
      expiresAt: new Date('2026-02-10'),
    };

    expect(isSubscriptionActive(subscription, now)).toBe(false);
  });

  it('is false for a subscription whose end date has passed', () => {
    const now = new Date('2026-03-10');
    const subscription = {
      status: 'ACTIVE' as const,
      expiresAt: new Date('2026-02-10'),
    };

    expect(isSubscriptionActive(subscription, now)).toBe(false);
  });

  it('is false when there is no subscription', () => {
    expect(isSubscriptionActive(null)).toBe(false);
    expect(isSubscriptionActive(undefined)).toBe(false);
  });
});

describe('activateSubscription', () => {
  it('marks the payment paid and starts the subscription', async () => {
    prismaMock.payment.findUnique.mockResolvedValue({
      id: 'pay_1',
      userId: 'user_1',
      planId: 'plan_1',
      amount: 199000,
      status: 'PENDING',
      plan: { id: 'plan_1', durationDays: 30 },
      subscription: null,
    });
    prismaMock.subscription.create.mockResolvedValue({
      id: 'sub_1',
      userId: 'user_1',
      planId: 'plan_1',
      status: 'ACTIVE',
      startedAt: new Date('2026-01-01'),
      expiresAt: new Date('2026-01-31'),
    });
    prismaMock.payment.update.mockResolvedValue({});

    const result = await activateSubscription('pay_1');

    expect(result.payment.status).toBe('PAID');
    expect(prismaMock.payment.update).toHaveBeenCalledWith({
      where: { id: 'pay_1' },
      data: { status: 'PAID', paidAt: expect.any(Date) },
    });
    expect(prismaMock.subscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'user_1', planId: 'plan_1', status: 'ACTIVE' }),
      }),
    );
  });

  it('cancels the previous subscription of the same user', async () => {
    prismaMock.payment.findUnique.mockResolvedValue({
      id: 'pay_2',
      userId: 'user_1',
      planId: 'plan_1',
      amount: 199000,
      status: 'PENDING',
      plan: { id: 'plan_1', durationDays: 30 },
      subscription: null,
    });
    prismaMock.subscription.create.mockResolvedValue({ id: 'sub_2' });
    prismaMock.payment.update.mockResolvedValue({});

    await activateSubscription('pay_2');

    expect(prismaMock.subscription.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user_1', status: 'ACTIVE' },
      data: { status: 'CANCELED' },
    });
  });

  it('does not create a second subscription when the payment is already paid', async () => {
    prismaMock.payment.findUnique.mockResolvedValue({
      id: 'pay_3',
      userId: 'user_1',
      planId: 'plan_1',
      amount: 199000,
      status: 'PAID',
      plan: { id: 'plan_1', durationDays: 30 },
      subscription: { id: 'sub_3', status: 'ACTIVE' },
    });

    const result = await activateSubscription('pay_3');

    expect(result.subscription.id).toBe('sub_3');
    expect(prismaMock.subscription.create).not.toHaveBeenCalled();
  });

  it('refuses a refunded payment', async () => {
    prismaMock.payment.findUnique.mockResolvedValue({
      id: 'pay_4',
      status: 'REFUNDED',
      plan: { id: 'plan_1', durationDays: 30 },
      subscription: null,
    });

    await expect(activateSubscription('pay_4')).rejects.toThrow(/بازگشت/);
  });
});

describe('refundPayment', () => {
  it('marks the payment refunded and cancels the subscription', async () => {
    prismaMock.payment.findUnique.mockResolvedValue({
      id: 'pay_5',
      userId: 'user_1',
      status: 'PAID',
    });
    prismaMock.subscription.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.payment.update.mockResolvedValue({});
    prismaMock.payment.findUnique
      .mockResolvedValueOnce({
        id: 'pay_5',
        userId: 'user_1',
        status: 'PAID',
      })
      .mockResolvedValueOnce({ id: 'pay_5', status: 'REFUNDED' });

    await refundPayment('pay_5');

    expect(prismaMock.subscription.updateMany).toHaveBeenCalledWith({
      where: { paymentId: 'pay_5' },
      data: { status: 'CANCELED' },
    });
    expect(prismaMock.payment.update).toHaveBeenCalledWith({
      where: { id: 'pay_5' },
      data: { status: 'REFUNDED' },
    });
  });

  it('refuses to refund twice', async () => {
    prismaMock.payment.findUnique.mockResolvedValue({
      id: 'pay_6',
      status: 'REFUNDED',
    });

    await expect(refundPayment('pay_6')).rejects.toThrow(/قبلاً/);
  });
});
