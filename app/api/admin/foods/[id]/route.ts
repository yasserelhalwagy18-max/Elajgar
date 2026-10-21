import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import {
  adminErrorResponse,
  jsonError,
  readNumber,
  readString,
  writeAudit,
} from '@/lib/admin-api';

type Context = { params: Promise<{ id: string }> };

/** A single food entry. */
export async function GET(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;

    const food = await prisma.food.findUnique({
      where: { id },
      include: { _count: { select: { foodLogs: true } } },
    });
    if (!food) return jsonError('غذا یافت نشد', 404);

    return NextResponse.json(food);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Update a food entry. */
export async function PATCH(request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = (await request.json()) as Record<string, unknown>;

    const existing = await prisma.food.findUnique({ where: { id } });
    if (!existing) return jsonError('غذا یافت نشد', 404);

    const data: Record<string, unknown> = {};

    const name = readString(body, 'name');
    if (name !== undefined) {
      if (!name) return jsonError('نام غذا نمی‌تواند خالی باشد', 400);
      data.name = name;
    }

    for (const field of ['calories', 'protein', 'carbs', 'fat'] as const) {
      const value = readNumber(body, field);
      if (value !== undefined) {
        if (value !== null && value < 0) {
          return jsonError('مقادیر تغذیه‌ای نمی‌توانند منفی باشند', 400);
        }
        data[field] = value ?? 0;
      }
    }

    const source = readString(body, 'source');
    if (source !== undefined) data.source = source;

    if (Object.keys(data).length === 0) {
      return jsonError('هیچ تغییری ارسال نشده است', 400);
    }

    const food = await prisma.food.update({ where: { id }, data });

    await writeAudit({
      actorId: admin.id,
      action: 'update',
      entity: 'food',
      entityId: id,
      before: existing,
      after: food,
    });

    return NextResponse.json(food);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/**
 * Delete a food entry.
 *
 * The food logs that referenced it keep their own snapshot of the values and
 * lose the link, so the history of what a user ate stays intact.
 */
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.food.findUnique({ where: { id } });
    if (!existing) return jsonError('غذا یافت نشد', 404);

    await prisma.food.delete({ where: { id } });

    await writeAudit({
      actorId: admin.id,
      action: 'delete',
      entity: 'food',
      entityId: id,
      before: existing,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
