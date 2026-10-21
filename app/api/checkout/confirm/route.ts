import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';
import { activateSubscription } from '@/lib/subscription';
import { jsonError } from '@/lib/admin-api';

/**
 * Confirm a payment and activate the subscription.
 *
 * This is the mock gateway's "the bank approved it" callback. It matches the
 * payment by its reference, so a client cannot confirm somebody else's
 * payment by guessing an id.
 */
export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return jsonError('برای خرید ابتدا وارد شوید', 401);
    }

    const body = (await request.json()) as Record<string, unknown>;
    const reference = typeof body.reference === 'string' ? body.reference.trim() : '';

    if (!reference) {
      return jsonError('شناسه پرداخت ارسال نشده است', 400);
    }

    const payment = await prisma.payment.findUnique({ where: { reference } });

    if (!payment) {
      return jsonError('پرداخت یافت نشد', 404);
    }

    if (payment.userId !== userId) {
      return jsonError('این پرداخت به حساب شما تعلق ندارد', 403);
    }

    const { subscription, payment: paid } = await activateSubscription(payment.id);

    return NextResponse.json({
      success: true,
      payment: { id: paid.id, amount: paid.amount, status: paid.status },
      subscription: {
        id: subscription.id,
        status: subscription.status,
        startedAt: subscription.startedAt,
        expiresAt: subscription.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error confirming checkout:', error);
    const message = error instanceof Error ? error.message : 'خطا در تایید پرداخت';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
