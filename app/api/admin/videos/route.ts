import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { DifficultyLevel } from '@prisma/client';
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

/** The list of videos for the admin panel. */
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams, 20);

    const query = normalizeText(searchParams.get('q') ?? '');
    const premium = searchParams.get('isPremium');

    const where: Prisma.VideoContentWhereInput = {};

    if (query) {
      where.OR = [{ title: { contains: query } }, { url: { contains: query } }];
    }

    if (premium === 'true' || premium === 'false') {
      where.isPremium = premium === 'true';
    }

    const [videos, total] = await Promise.all([
      prisma.videoContent.findMany({
        where,
        include: { exercise: { select: { id: true, title: true } } },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.videoContent.count({ where }),
    ]);

    return NextResponse.json(paginated(videos, total, pagination));
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Create a video. */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = (await request.json()) as Record<string, unknown>;

    const title = readString(body, 'title');
    const url = readString(body, 'url');
    const level = readString(body, 'level');

    if (!title) return jsonError('عنوان ویدیو الزامی است', 400);
    if (!url) return jsonError('آدرس ویدیو الزامی است', 400);
    if (!level || !Object.values(DifficultyLevel).includes(level as DifficultyLevel)) {
      return jsonError('سطح سختی نامعتبر است', 400);
    }

    const duration = readNumber(body, 'durationInMinutes');
    if (duration !== undefined && duration !== null && duration <= 0) {
      return jsonError('مدت زمان باید بزرگ‌تر از صفر باشد', 400);
    }

    const video = await prisma.videoContent.create({
      data: {
        title,
        url,
        level: level as DifficultyLevel,
        durationInMinutes: duration ?? 1,
        thumbnailUrl: readString(body, 'thumbnailUrl'),
        isPremium: readBoolean(body, 'isPremium') ?? false,
        isPublished: readBoolean(body, 'isPublished') ?? true,
        associatedPainTags: toJson(readStringArray(body, 'associatedPainTags') ?? []),
      },
    });

    await writeAudit({
      actorId: admin.id,
      action: 'create',
      entity: 'video',
      entityId: video.id,
      after: video,
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
