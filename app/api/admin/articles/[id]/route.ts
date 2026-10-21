import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import {
  adminErrorResponse,
  jsonError,
  readBoolean,
  readNumber,
  readParagraphs,
  readString,
  toJson,
  writeAudit,
} from '@/lib/admin-api';

type Context = { params: Promise<{ id: string }> };

/** A single article. */
export async function GET(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return jsonError('مطلب یافت نشد', 404);

    return NextResponse.json(article);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Update an article. */
export async function PATCH(request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = (await request.json()) as Record<string, unknown>;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return jsonError('مطلب یافت نشد', 404);

    const data: Record<string, unknown> = {};

    const title = readString(body, 'title');
    if (title !== undefined) {
      if (!title) return jsonError('عنوان نمی‌تواند خالی باشد', 400);
      data.title = title;
    }

    const slug = readString(body, 'slug');
    if (slug !== undefined) {
      if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        return jsonError('نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد', 400);
      }
      data.slug = slug;
    }

    const category = readString(body, 'category');
    if (category !== undefined) {
      if (!category) return jsonError('دسته‌بندی نمی‌تواند خالی باشد', 400);
      data.category = category;
    }

    if ('content' in body) {
      const paragraphs = readParagraphs(body);
      if (paragraphs === null) {
        return jsonError('متن مطلب باید یک آرایه از پاراگراف‌ها باشد', 400);
      }
      data.content = toJson(paragraphs);
    }

    const summary = readString(body, 'summary');
    if (summary !== undefined) data.summary = summary;

    const icon = readString(body, 'icon');
    if (icon !== undefined) data.icon = icon ?? 'book';

    const readTime = readString(body, 'readTime');
    if (readTime !== undefined) data.readTime = readTime;

    const image = readString(body, 'image');
    if (image !== undefined) data.image = image;

    const isPublished = readBoolean(body, 'isPublished');
    if (isPublished !== undefined) data.isPublished = isPublished;

    const sortOrder = readNumber(body, 'sortOrder');
    if (sortOrder !== undefined) data.sortOrder = sortOrder ?? 0;

    if (Object.keys(data).length === 0) {
      return jsonError('هیچ تغییری ارسال نشده است', 400);
    }

    const article = await prisma.article.update({ where: { id }, data });

    await writeAudit({
      actorId: admin.id,
      action: 'update',
      entity: 'article',
      entityId: id,
      before: existing,
      after: article,
    });

    return NextResponse.json(article);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Delete an article. */
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return jsonError('مطلب یافت نشد', 404);

    await prisma.article.delete({ where: { id } });

    await writeAudit({
      actorId: admin.id,
      action: 'delete',
      entity: 'article',
      entityId: id,
      before: existing,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
