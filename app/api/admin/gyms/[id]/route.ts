import { NextResponse } from 'next/server';
import { GymCategory } from '@prisma/client';
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

/** A single gym. */
export async function GET(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;

    const gym = await prisma.gym.findUnique({ where: { id } });
    if (!gym) return jsonError('باشگاه یافت نشد', 404);

    return NextResponse.json(gym);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Update a gym. */
export async function PATCH(request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = (await request.json()) as Record<string, unknown>;

    const existing = await prisma.gym.findUnique({ where: { id } });
    if (!existing) return jsonError('باشگاه یافت نشد', 404);

    const data: Record<string, unknown> = {};

    const name = readString(body, 'name');
    if (name !== undefined) {
      if (!name) return jsonError('نام باشگاه نمی‌تواند خالی باشد', 400);
      data.name = name;
    }

    const location = readString(body, 'location');
    if (location !== undefined) {
      if (!location) return jsonError('موقعیت باشگاه نمی‌تواند خالی باشد', 400);
      data.location = location;
    }

    const category = readString(body, 'category');
    if (category !== undefined) {
      if (!category || !Object.values(GymCategory).includes(category as GymCategory)) {
        return jsonError('دسته‌بندی نامعتبر است', 400);
      }
      data.category = category;
    }

    const rating = readNumber(body, 'rating');
    if (rating !== undefined) {
      if (rating !== null && (rating < 0 || rating > 5)) {
        return jsonError('امتیاز باید بین ۰ و ۵ باشد', 400);
      }
      data.rating = rating ?? 0;
    }

    const discount = readNumber(body, 'discountPercentage');
    if (discount !== undefined) {
      if (discount !== null && (discount < 0 || discount > 100)) {
        return jsonError('درصد تخفیف باید بین ۰ و ۱۰۰ باشد', 400);
      }
      data.discountPercentage = discount ?? 0;
    }

    const isPremium = readBoolean(body, 'isPremium');
    if (isPremium !== undefined) data.isPremium = isPremium;

    const imageUrl = readString(body, 'imageUrl');
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    const amenities = readStringArray(body, 'amenities');
    if (amenities !== undefined) data.amenities = toJson(amenities ?? []);

    if (Object.keys(data).length === 0) {
      return jsonError('هیچ تغییری ارسال نشده است', 400);
    }

    const gym = await prisma.gym.update({ where: { id }, data });

    await writeAudit({
      actorId: admin.id,
      action: 'update',
      entity: 'gym',
      entityId: id,
      before: existing,
      after: gym,
    });

    return NextResponse.json(gym);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Delete a gym. */
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.gym.findUnique({ where: { id } });
    if (!existing) return jsonError('باشگاه یافت نشد', 404);

    await prisma.gym.delete({ where: { id } });

    await writeAudit({
      actorId: admin.id,
      action: 'delete',
      entity: 'gym',
      entityId: id,
      before: existing,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
