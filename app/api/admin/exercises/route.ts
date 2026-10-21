import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
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

/** The list of exercises for the admin panel. */
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams, 20);

    const query = normalizeText(searchParams.get('q') ?? '');
    const category = searchParams.get('category');

    const where: Prisma.ExerciseWhereInput = {};

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
      ];
    }

    if (category) where.category = category;

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        include: { videoContent: true },
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.exercise.count({ where }),
    ]);

    return NextResponse.json(paginated(exercises, total, pagination));
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Create an exercise. */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = (await request.json()) as Record<string, unknown>;

    const title = readString(body, 'title');
    if (!title) return jsonError('عنوان تمرین الزامی است', 400);

    const duration = readNumber(body, 'durationMinutes');
    const sets = readNumber(body, 'sets');
    const reps = readNumber(body, 'reps');

    for (const [label, value] of [
      ['مدت زمان', duration],
      ['تعداد ست', sets],
      ['تعداد تکرار', reps],
    ] as const) {
      if (value !== undefined && value !== null && value < 0) {
        return jsonError(`${label} نمی‌تواند منفی باشد`, 400);
      }
    }

    const exercise = await prisma.exercise.create({
      data: {
        title,
        description: readString(body, 'description'),
        category: readString(body, 'category') ?? 'کششی',
        level: readString(body, 'level') ?? 'مبتدی',
        durationMinutes: duration ?? 5,
        sets: sets ?? 1,
        reps: reps ?? 1,
        emoji: readString(body, 'emoji') ?? '🧘',
        accent: readString(body, 'accent') ?? 'from-primary/70 to-secondary/70',
        targetTags: toJson(readStringArray(body, 'targetTags') ?? []),
        isPublished: readBoolean(body, 'isPublished') ?? true,
        sortOrder: readNumber(body, 'sortOrder') ?? 0,
      },
    });

    await writeAudit({
      actorId: admin.id,
      action: 'create',
      entity: 'exercise',
      entityId: exercise.id,
      after: exercise,
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
