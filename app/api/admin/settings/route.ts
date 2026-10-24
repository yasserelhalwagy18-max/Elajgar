import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { adminErrorResponse, jsonError, toJson, writeAudit } from '@/lib/admin-api';
import { getSettings, SETTING_KEYS, validateSetting } from '@/lib/settings';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The sums `validateSetting` does not enforce: the health weights and every
 * macro split are shares of 100 and must add up to exactly that. Tolerance
 * only covers float sums like 33.3 + 33.3 + 33.4.
 */
function validateHundredSum(key: string, value: unknown): string | null {
  if (key === 'health.weights' && isRecord(value)) {
    const total = Object.values(value).reduce<number>((sum, entry) => sum + Number(entry), 0);
    if (Math.abs(total - 100) >= 0.001) {
      return 'مجموع وزن‌های امتیاز سلامت باید ۱۰۰ باشد';
    }
  }

  if (key === 'nutrition.config' && isRecord(value)) {
    const macros = isRecord(value.macros) ? value.macros : {};
    for (const bucket of ['maintain', 'cut', 'bulk'] as const) {
      const split = isRecord(macros[bucket]) ? macros[bucket] : {};
      const total = ['protein', 'carbs', 'fat'].reduce<number>(
        (sum, field) => sum + Number(split[field] ?? 0),
        0,
      );
      if (Math.abs(total - 100) >= 0.001) {
        return `مجموع سهم پروتئین، کربوهیدرات و چربی در «${bucket}» باید ۱۰۰ درصد باشد`;
      }
    }
  }

  return null;
}

/** Every global setting, with the label the panel shows next to it. */
export async function GET() {
  try {
    await requireAdmin();

    const settings = await getSettings();

    return NextResponse.json({
      settings,
      definitions: Object.entries(SETTING_KEYS).map(([key, label]) => ({
        key,
        label,
      })),
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/**
 * Update the global settings.
 *
 * The body is a map of setting key to value. Every key is validated before
 * anything is written, so a bad value in one setting cannot leave the others
 * half-applied.
 */
export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();

    const body = (await request.json()) as Record<string, unknown>;

    const entries = Object.entries(body).filter(([key]) => key in SETTING_KEYS);
    if (entries.length === 0) {
      return jsonError('هیچ تنظیم معتبری ارسال نشده است', 400);
    }

    const validated: Array<{ key: string; value: Prisma.InputJsonValue }> = [];
    for (const [key, value] of entries) {
      const result = validateSetting(key, value);
      if (!result.ok) {
        return jsonError(result.error, 400);
      }
      const sumError = validateHundredSum(key, result.value);
      if (sumError) {
        return jsonError(sumError, 400);
      }
      validated.push({ key, value: result.value });
    }

    const before: Record<string, unknown> = {};
    for (const { key } of validated) {
      const existing = await prisma.appSetting.findUnique({ where: { key } });
      before[key] = existing?.value ?? null;
    }

  await prisma.$transaction(
    validated.map(({ key, value }) =>
      prisma.appSetting.upsert({
        where: { key },
        update: { value: toJson(value) },
        create: { key, value: toJson(value) },
      }),
    ),
  );

    const after: Record<string, unknown> = {};
    for (const { key, value } of validated) {
      after[key] = value;
    }

    await writeAudit({
      actorId: admin.id,
      action: 'update',
      entity: 'setting',
      entityId: validated.map(({ key }) => key).join(','),
      before,
      after,
    });

    const settings = await getSettings();

    return NextResponse.json({
      settings,
      definitions: Object.entries(SETTING_KEYS).map(([key, label]) => ({ key, label })),
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
