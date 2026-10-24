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

/** Every plan, active or not. */
export async function GET() {
  try {
    await requireAdmin();

    const plans = await prisma.plan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { subscriptions: true, payments: true } } },
    });

    return NextResponse.json(plans);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Create a plan. */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = (await request.json()) as Record<string, unknown>;

    const key = readString(body, 'key');
    const title = readString(body, 'title');

    if (!key) return jsonError('شناسه پلن الزامی است', 400);
    if (!/^[a-z0-9-]+$/.test(key)) {
      return jsonError('شناسه پلن فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد', 400);
    }
    if (!title) return jsonError('عنوان پلن الزامی است', 400);

    const price = readNumber(body, 'price');
    if (price === undefined || price === null || price <= 0) {
      return jsonError('قیمت پلن باید بزرگ‌تر از صفر باشد', 400);
    }

    const durationDays = readNumber(body, 'durationDays');
    if (durationDays === undefined || durationDays === null || durationDays < 1) {
      return jsonError('مدت اشتراک باید حداقل ۱ روز باشد', 400);
    }

    const plan = await prisma.plan.create({
      data: {
        key,
        title,
        price,
        description: readString(body, 'description'),
        features: toJson(readStringArray(body, 'features') ?? []),
        isActive: readBoolean(body, 'isActive') ?? false,
        isFeatured: readBoolean(body, 'isFeatured') ?? false,
        durationDays,
        sortOrder: readNumber(body, 'sortOrder') ?? 0,
      },
    });

    await writeAudit({
      actorId: admin.id,
      action: 'create',
      entity: 'plan',
      entityId: plan.id,
      after: plan,
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
