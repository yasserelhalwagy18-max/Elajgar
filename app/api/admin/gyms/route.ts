import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { GymCategory } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import {
  adminErrorResponse,
  jsonError,
  paginated,
  parsePagination,
  readBoolean,
  readNumber,
  readString,
  readStringArray,
  toJson,
  writeAudit,
} from '@/lib/admin-api';
import { normalizeText } from '@/lib/utils';

/** The list of gyms for the admin panel. */
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams, 20);

    const query = normalizeText(searchParams.get('q') ?? '');
    const category = searchParams.get('category');

    const where: Prisma.GymWhereInput = {};

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { location: { contains: query } },
      ];
    }

    if (category && Object.values(GymCategory).includes(category as GymCategory)) {
      where.category = category as GymCategory;
    }

    const [gyms, total] = await Promise.all([
      prisma.gym.findMany({
        where,
        orderBy: [{ isPlaceholder: 'asc' }, { name: 'asc' }],
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.gym.count({ where }),
    ]);

    return NextResponse.json(paginated(gyms, total, pagination));
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Create a gym. */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = (await request.json()) as Record<string, unknown>;

    const name = readString(body, 'name');
    const location = readString(body, 'location');
    const category = readString(body, 'category');

    if (!name) return jsonError('نام باشگاه الزامی است', 400);
    if (!location) return jsonError('موقعیت باشگاه الزامی است', 400);
    if (!category || !Object.values(GymCategory).includes(category as GymCategory)) {
      return jsonError('دسته‌بندی نامعتبر است', 400);
    }

    const rating = readNumber(body, 'rating');
    const discount = readNumber(body, 'discountPercentage');
    const isPremium = readBoolean(body, 'isPremium');
    const imageUrl = readString(body, 'imageUrl');
    const amenities = readStringArray(body, 'amenities');

    if (rating !== undefined && rating !== null && (rating < 0 || rating > 5)) {
      return jsonError('امتیاز باید بین ۰ و ۵ باشد', 400);
    }

    if (discount !== undefined && discount !== null && (discount < 0 || discount > 100)) {
      return jsonError('درصد تخفیف باید بین ۰ و ۱۰۰ باشد', 400);
    }

    const gym = await prisma.gym.create({
      data: {
        name,
        location,
        category: category as GymCategory,
        rating: rating ?? 0,
        discountPercentage: discount ?? 0,
        isPremium: isPremium ?? false,
        imageUrl,
        amenities: amenities === undefined ? undefined : toJson(amenities ?? []),
      },
    });

    await writeAudit({
      actorId: admin.id,
      action: 'create',
      entity: 'gym',
      entityId: gym.id,
      after: gym,
    });

    return NextResponse.json(gym, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
