import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import {
  adminErrorResponse,
  jsonError,
  paginated,
  parsePagination,
  readNumber,
  readString,
  writeAudit,
} from '@/lib/admin-api';
import { normalizeText } from '@/lib/utils';

/**
 * The food database for the admin panel.
 *
 * The public search endpoint returns at most 20 rows, so this endpoint is
 * the only way to see the whole table.
 */
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams, 25);

    const query = normalizeText(searchParams.get('q') ?? '');
    const source = searchParams.get('source');

    const where: Prisma.FoodWhereInput = {};

    if (query) {
      where.name = { contains: query };
    }

    if (source) {
      where.source = source;
    }

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.food.count({ where }),
    ]);

    return NextResponse.json(paginated(foods, total, pagination));
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Add a food to the database. */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = (await request.json()) as Record<string, unknown>;

    const name = readString(body, 'name');
    if (!name) return jsonError('نام غذا الزامی است', 400);

    const calories = readNumber(body, 'calories');
    const protein = readNumber(body, 'protein');
    const carbs = readNumber(body, 'carbs');
    const fat = readNumber(body, 'fat');

    for (const [label, value] of [
      ['کالری', calories],
      ['پروتئین', protein],
      ['کربوهیدرات', carbs],
      ['چربی', fat],
    ] as const) {
      if (value !== undefined && value !== null && value < 0) {
        return jsonError(`مقدار ${label} نمی‌تواند منفی باشد`, 400);
      }
    }

    const food = await prisma.food.create({
      data: {
        name,
        calories: calories ?? 0,
        protein: protein ?? 0,
        carbs: carbs ?? 0,
        fat: fat ?? 0,
        source: readString(body, 'source') ?? 'manual',
      },
    });

    await writeAudit({
      actorId: admin.id,
      action: 'create',
      entity: 'food',
      entityId: food.id,
      after: food,
    });

    return NextResponse.json(food, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
