import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';
import { getActiveSubscription } from '@/lib/subscription';
import { jsonError } from '@/lib/admin-api';

/**
 * Start a checkout.
 *
 * Creates a pending payment for the chosen plan and returns the reference
 * the mock gateway would hand back. No card data is collected or stored -
 * the payment row only holds the plan, the amount and a local reference.
 */
export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return jsonError('برای خرید ابتدا وارد شوید', 401);
    }

    const body = (await request.json()) as Record<string, unknown>;
    const planKey = typeof body.planKey === 'string' ? body.planKey.trim() : '';

    if (!planKey) {
      return jsonError('پلن انتخاب نشده است', 400);
    }

    const plan = await prisma.plan.findFirst({ where: { key: planKey, isActive: true } });

    if (!plan) {
      return jsonError('این پلن در حال حاضر قابل خرید نیست', 404);
    }

    // The user already has this plan - sending them to the checkout again
    // would only create a second payment.
    const current = await getActiveSubscription(userId);
    if (current && current.planId === plan.id) {
      return jsonError('شما هم‌اکنون این پلن را دارید', 409);
    }

    // A pending payment for the same plan is reused rather than piling up
    // rows when the user double-clicks.
    const existing = await prisma.payment.findFirst({
      where: { userId, planId: plan.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return NextResponse.json({
        paymentId: existing.id,
        reference: existing.reference,
        plan: { key: plan.key, title: plan.title, price: plan.price },
        amount: existing.amount,
      });
    }

    const reference = `MOCK-${randomBytes(8).toString('hex').toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        userId,
        planId: plan.id,
        amount: plan.price,
        status: 'PENDING',
        provider: 'mock',
        reference,
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      reference: payment.reference,
      plan: { key: plan.key, title: plan.title, price: plan.price },
      amount: payment.amount,
    });
  } catch (error) {
    console.error('Error starting checkout:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}
