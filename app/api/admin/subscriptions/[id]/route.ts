import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { adminErrorResponse, jsonError, writeAudit } from '@/lib/admin-api';

type Context = { params: Promise<{ id: string }> };

/** A single subscription. */
export async function GET(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        plan: true,
        user: { select: { id: true, fullName: true, phoneNumber: true } },
        payment: true,
      },
    });

    if (!subscription) return jsonError('اشتراک یافت نشد', 404);

    return NextResponse.json(subscription);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/**
 * Update a subscription.
 *
 * An admin can cancel it, bring it back, or move the expiry date - the
 * things that come up when a payment is wrong.
 */
export async function PATCH(request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = (await request.json()) as Record<string, unknown>;

    const existing = await prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!existing) return jsonError('اشتراک یافت نشد', 404);

    const data: { status?: 'ACTIVE' | 'CANCELED' | 'EXPIRED'; expiresAt?: Date } = {};

    if ('status' in body) {
      const status = body.status;
      if (!['ACTIVE', 'CANCELED', 'EXPIRED'].includes(String(status))) {
        return jsonError('وضعیت اشتراک نامعتبر است', 400);
      }
      data.status = status as 'ACTIVE' | 'CANCELED' | 'EXPIRED';
    }

    if ('expiresAt' in body) {
      const value = body.expiresAt;
      if (typeof value !== 'string' || Number.isNaN(new Date(value).getTime())) {
        return jsonError('تاریخ انقضا نامعتبر است', 400);
      }
      data.expiresAt = new Date(value);
    }

    if (Object.keys(data).length === 0) {
      return jsonError('هیچ تغییری ارسال نشده است', 400);
    }

    const subscription = await prisma.subscription.update({ where: { id }, data });

    await writeAudit({
      actorId: admin.id,
      action: 'update',
      entity: 'subscription',
      entityId: id,
      before: existing,
      after: subscription,
    });

    return NextResponse.json(subscription);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/**
 * Delete a subscription record.
 *
 * The payment is left alone - it is the financial history. Deleting a
 * subscription ends the access; it does not erase the money.
 */
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!existing) return jsonError('اشتراک یافت نشد', 404);

    await prisma.subscription.delete({ where: { id } });

    await writeAudit({
      actorId: admin.id,
      action: 'delete',
      entity: 'subscription',
      entityId: id,
      before: existing,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
