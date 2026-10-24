import 'server-only';

import type { PaymentStatus, Prisma, Subscription } from '@prisma/client';
import prisma from './prisma';

/**
 * The subscription helper.
 *
 * A subscription is *active* when its status says so **and** it has not run
 * out. The expiry is checked at read time rather than by a background job,
 * so a lapsed subscription never grants access even if no job ever ran.
 */
export function isSubscriptionActive(
  subscription: Pick<Subscription, 'status' | 'expiresAt'> | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!subscription) return false;
  if (subscription.status !== 'ACTIVE') return false;
  return subscription.expiresAt.getTime() > now.getTime();
}

/**
 * The user's active subscription, with its plan.
 *
 * Expired rows are reported as expired rather than filtered out, so the
 * profile can show "your plan ended" with a renewal button.
 */
export async function getSubscription(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    include: { plan: true, payment: true },
  });

  if (!subscription) return null;

  const active = isSubscriptionActive(subscription);

  return {
    ...subscription,
    status: active ? ('ACTIVE' as const) : subscription.status === 'ACTIVE'
      ? ('EXPIRED' as const)
      : subscription.status,
    isActive: active,
  };
}

/** The user's active subscription, or null. */
export async function getActiveSubscription(userId: string) {
  const subscription = await getSubscription(userId);
  return subscription && subscription.isActive ? subscription : null;
}

/** The plans that can be bought right now. */
export async function getActivePlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
  });
}

/**
 * A payment problem the caller can act on - the message is safe to show.
 * Anything else that escapes is an internal error and must not be echoed
 * back to the client.
 */
export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutError';
  }
}

/**
 * Mark a payment as paid and start the subscription it paid for.
 *
 * Idempotent: confirming the same payment twice does not create a second
 * subscription, it extends the existing one.
 */
export async function activateSubscription(
  paymentId: string,
): Promise<{ subscription: Subscription; payment: { id: string; amount: number; status: PaymentStatus } }> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { plan: true, subscription: true },
    });

    if (!payment) {
      throw new CheckoutError('پرداخت یافت نشد');
    }

    if (payment.status === 'REFUNDED') {
      throw new CheckoutError('این پرداخت قبلاً بازگشت داده شده است');
    }

    if (payment.status === 'PAID' && payment.subscription) {
      // Already activated - nothing to do.
      return {
        subscription: payment.subscription,
        payment: { id: payment.id, amount: payment.amount, status: payment.status },
      };
    }

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + payment.plan.durationDays * 24 * 60 * 60 * 1000,
    );

    // A user has one subscription at a time: the new one replaces the old.
    await tx.subscription.updateMany({
      where: { userId: payment.userId, status: 'ACTIVE' },
      data: { status: 'CANCELED' },
    });

    const subscription = await tx.subscription.create({
      data: {
        userId: payment.userId,
        planId: payment.planId,
        paymentId: payment.id,
        status: 'ACTIVE',
        startedAt: now,
        expiresAt,
      },
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID', paidAt: now },
    });

    return {
      subscription,
      payment: { id: payment.id, amount: payment.amount, status: 'PAID' as PaymentStatus },
    };
  });
}

/**
 * Refund a payment and cancel the subscription it paid for.
 */
export async function refundPayment(paymentId: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });

    if (!payment) {
      throw new CheckoutError('پرداخت یافت نشد');
    }

    if (payment.status === 'REFUNDED') {
      throw new CheckoutError('این پرداخت قبلاً بازگشت داده شده است');
    }

    await tx.subscription.updateMany({
      where: { paymentId: payment.id },
      data: { status: 'CANCELED' },
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    return tx.payment.findUnique({ where: { id: payment.id } });
  });
}

/** The totals the admin overview shows for the subscription business. */
export async function getSubscriptionTotals() {
  const [paid, active, refunded, revenue] = await Promise.all([
    prisma.payment.count({ where: { status: 'PAID' } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.payment.count({ where: { status: 'REFUNDED' } }),
    prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    }),
  ]);

  return {
    paidPayments: paid,
    activeSubscriptions: active,
    refundedPayments: refunded,
    revenue: revenue._sum.amount ?? 0,
  };
}

/** The type of a payment row that includes its relations. */
export type PaymentWithRelations = Prisma.PaymentGetPayload<{
  include: { plan: true; user: { select: { id: true; fullName: true; phoneNumber: true } } };
}>;
