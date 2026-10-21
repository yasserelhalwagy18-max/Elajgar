import { NextResponse } from 'next/server';
import { DifficultyLevel } from '@prisma/client';
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

/** A single video. */
export async function GET(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;

    const video = await prisma.videoContent.findUnique({
      where: { id },
      include: { exercise: { select: { id: true, title: true } } },
    });
    if (!video) return jsonError('ویدیو یافت نشد', 404);

    return NextResponse.json(video);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Update a video. */
export async function PATCH(request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = (await request.json()) as Record<string, unknown>;

    const existing = await prisma.videoContent.findUnique({ where: { id } });
    if (!existing) return jsonError('ویدیو یافت نشد', 404);

    const data: Record<string, unknown> = {};

    const title = readString(body, 'title');
    if (title !== undefined) {
      if (!title) return jsonError('عنوان ویدیو نمی‌تواند خالی باشد', 400);
      data.title = title;
    }

    const url = readString(body, 'url');
    if (url !== undefined) {
      if (!url) return jsonError('آدرس ویدیو نمی‌تواند خالی باشد', 400);
      data.url = url;
    }

    const level = readString(body, 'level');
    if (level !== undefined) {
      if (!level || !Object.values(DifficultyLevel).includes(level as DifficultyLevel)) {
        return jsonError('سطح سختی نامعتبر است', 400);
      }
      data.level = level;
    }

    const duration = readNumber(body, 'durationInMinutes');
    if (duration !== undefined) {
      if (duration !== null && duration <= 0) {
        return jsonError('مدت زمان باید بزرگ‌تر از صفر باشد', 400);
      }
      data.durationInMinutes = duration ?? existing.durationInMinutes;
    }

    const thumbnailUrl = readString(body, 'thumbnailUrl');
    if (thumbnailUrl !== undefined) data.thumbnailUrl = thumbnailUrl;

    const isPremium = readBoolean(body, 'isPremium');
    if (isPremium !== undefined) data.isPremium = isPremium;

    const isPublished = readBoolean(body, 'isPublished');
    if (isPublished !== undefined) data.isPublished = isPublished;

    const painTags = readStringArray(body, 'associatedPainTags');
    if (painTags !== undefined) data.associatedPainTags = toJson(painTags ?? []);

    if (Object.keys(data).length === 0) {
      return jsonError('هیچ تغییری ارسال نشده است', 400);
    }

    const video = await prisma.videoContent.update({ where: { id }, data });

    await writeAudit({
      actorId: admin.id,
      action: 'update',
      entity: 'video',
      entityId: id,
      before: existing,
      after: video,
    });

    return NextResponse.json(video);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Delete a video. */
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.videoContent.findUnique({ where: { id } });
    if (!existing) return jsonError('ویدیو یافت نشد', 404);

    await prisma.videoContent.delete({ where: { id } });

    await writeAudit({
      actorId: admin.id,
      action: 'delete',
      entity: 'video',
      entityId: id,
      before: existing,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
