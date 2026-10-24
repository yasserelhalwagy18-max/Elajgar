import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import {
  adminErrorResponse,
  jsonError,
  readBoolean,
  readNumber,
  readString,
  readStringArray,
  toJson,
  writeAudit,
} from '@/lib/admin-api';

type Context = { params: Promise<{ id: string }> };

/** A single plan. */
export async function GET(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;

    const plan = await prisma.plan.findUnique({
      where: { id },
      include: { _count: { select: { subscriptions: true, payments: true } } },
    });
    if (!plan) return jsonError('پلن یافت نشد', 404);

    return NextResponse.json(plan);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Update a plan. */
export async function PATCH(request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = (await request.json()) as Record<string, unknown>;

    const existing = await prisma.plan.findUnique({ where: { id } });
    if (!existing) return jsonError('پلن یافت نشد', 404);

    const data: Record<string, unknown> = {};

    const title = readString(body, 'title');
    if (title !== undefined) {
      if (!title) return jsonError('عنوان پلن نمی‌تواند خالی باشد', 400);
      data.title = title;
    }

    const price = readNumber(body, 'price');
    if (price !== undefined) {
      if (price !== null && price <= 0) return jsonError('قیمت پلن باید بزرگ‌تر از صفر باشد', 400);
      data.price = price ?? existing.price;
    }

    const durationDays = readNumber(body, 'durationDays');
    if (durationDays !== undefined) {
      if (durationDays !== null && durationDays <= 0) {
        return jsonError('مدت اشتراک باید بزرگ‌تر از صفر باشد', 400);
      }
      data.durationDays = durationDays ?? existing.durationDays;
    }

    const description = readString(body, 'description');
    if (description !== undefined) data.description = description;

    const features = readStringArray(body, 'features');
    if (features !== undefined) data.features = toJson(features ?? []);

    const isActive = readBoolean(body, 'isActive');
    if (isActive !== undefined) data.isActive = isActive;

    const isFeatured = readBoolean(body, 'isFeatured');
    if (isFeatured !== undefined) data.isFeatured = isFeatured;

    const sortOrder = readNumber(body, 'sortOrder');
    if (sortOrder !== undefined) data.sortOrder = sortOrder ?? 0;

    if (Object.keys(data).length === 0) {
      return jsonError('هیچ تغییری ارسال نشده است', 400);
    }

    const plan = await prisma.plan.update({ where: { id }, data });

    await writeAudit({
      actorId: admin.id,
      action: 'update',
      entity: 'plan',
      entityId: id,
      before: existing,
      after: plan,
    });

    return NextResponse.json(plan);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Delete a plan. */
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.plan.findUnique({ where: { id } });
    if (!existing) return jsonError('پلن یافت نشد', 404);

    // A plan that has been bought cannot be deleted: the payments and the
    // subscriptions point at it. It can be deactivated instead.
    const buyers = await prisma.payment.count({ where: { planId: id } });
    if (buyers > 0) {
      return jsonError(
        'این پلن خریده شده است و قابل حذف نیست. آن را غیرفعال کنید.',
        409,
      );
    }

    await prisma.plan.delete({ where: { id } });

    await writeAudit({
      actorId: admin.id,
      action: 'delete',
      entity: 'plan',
      entityId: id,
      before: existing,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
