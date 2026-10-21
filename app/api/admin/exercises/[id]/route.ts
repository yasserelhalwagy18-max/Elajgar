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

/** A single exercise. */
export async function GET(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: { videoContent: true },
    });
    if (!exercise) return jsonError('تمرین یافت نشد', 404);

    return NextResponse.json(exercise);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Update an exercise. */
export async function PATCH(request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = (await request.json()) as Record<string, unknown>;

    const existing = await prisma.exercise.findUnique({ where: { id } });
    if (!existing) return jsonError('تمرین یافت نشد', 404);

    const data: Record<string, unknown> = {};

    const title = readString(body, 'title');
    if (title !== undefined) {
      if (!title) return jsonError('عنوان تمرین نمی‌تواند خالی باشد', 400);
      data.title = title;
    }

    const description = readString(body, 'description');
    if (description !== undefined) data.description = description;

    const category = readString(body, 'category');
    if (category !== undefined) data.category = category;

    const level = readString(body, 'level');
    if (level !== undefined) data.level = level;

    for (const field of ['durationMinutes', 'sets', 'reps', 'sortOrder'] as const) {
      const value = readNumber(body, field);
      if (value !== undefined) {
        if (value !== null && value < 0) {
          return jsonError('مقادیر عددی نمی‌توانند منفی باشند', 400);
        }
        data[field] = value ?? 0;
      }
    }

    const emoji = readString(body, 'emoji');
    if (emoji !== undefined) data.emoji = emoji;

    const accent = readString(body, 'accent');
    if (accent !== undefined) data.accent = accent;

    const targetTags = readStringArray(body, 'targetTags');
    if (targetTags !== undefined) data.targetTags = toJson(targetTags ?? []);

    const isPublished = readBoolean(body, 'isPublished');
    if (isPublished !== undefined) data.isPublished = isPublished;

    if (Object.keys(data).length === 0) {
      return jsonError('هیچ تغییری ارسال نشده است', 400);
    }

    const exercise = await prisma.exercise.update({
      where: { id },
      data,
      include: { videoContent: true },
    });

    await writeAudit({
      actorId: admin.id,
      action: 'update',
      entity: 'exercise',
      entityId: id,
      before: existing,
      after: exercise,
    });

    return NextResponse.json(exercise);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Delete an exercise. */
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.exercise.findUnique({ where: { id } });
    if (!existing) return jsonError('تمرین یافت نشد', 404);

    await prisma.exercise.delete({ where: { id } });

    await writeAudit({
      actorId: admin.id,
      action: 'delete',
      entity: 'exercise',
      entityId: id,
      before: existing,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
