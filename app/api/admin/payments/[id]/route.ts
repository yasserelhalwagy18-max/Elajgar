import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { adminErrorResponse, jsonError, writeAudit } from '@/lib/admin-api';
import { refundPayment } from '@/lib/subscription';

type Context = { params: Promise<{ id: string }> };

/** A single payment. */
export async function GET(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        plan: true,
        user: { select: { id: true, fullName: true, phoneNumber: true } },
        subscription: true,
      },
    });

    if (!payment) return jsonError('پرداخت یافت نشد', 404);

    return NextResponse.json(payment);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/**
 * Update a payment.
 *
 * The only meaningful action is a refund: it marks the payment as refunded
 * and cancels the subscription it paid for, so the access is taken away with
 * the money.
 */
export async function PATCH(request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = (await request.json()) as Record<string, unknown>;

    const existing = await prisma.payment.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!existing) return jsonError('پرداخت یافت نشد', 404);

    if (body.status !== 'REFUNDED') {
      return jsonError('تنها وضعیت قابل تغییر، بازگشت وجه است', 400);
    }

    let payment;
    try {
      payment = await refundPayment(id);
    } catch (error) {
      return jsonError(
        error instanceof Error ? error.message : 'بازگشت وجه انجام نشد',
        400,
      );
    }

    await writeAudit({
      actorId: admin.id,
      action: 'update',
      entity: 'payment',
      entityId: id,
      before: existing,
      after: payment,
    });

    return NextResponse.json(payment);
  } catch (error) {
    return adminErrorResponse(error);
  }
}
