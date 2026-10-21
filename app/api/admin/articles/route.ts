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
  readParagraphs,
  readString,
  toJson,
  writeAudit,
} from '@/lib/admin-api';
import { normalizeText } from '@/lib/utils';

/** The list of articles for the admin panel. */
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams, 20);

    const query = normalizeText(searchParams.get('q') ?? '');
    const category = searchParams.get('category');
    const published = searchParams.get('isPublished');

    const where: Prisma.ArticleWhereInput = {};

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { slug: { contains: query } },
        { summary: { contains: query } },
      ];
    }

    if (category) where.category = category;

    if (published === 'true' || published === 'false') {
      where.isPublished = published === 'true';
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json(paginated(articles, total, pagination));
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Create an article. */
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = (await request.json()) as Record<string, unknown>;

    const title = readString(body, 'title');
    const slug = readString(body, 'slug');
    const category = readString(body, 'category');

    if (!title) return jsonError('عنوان مطلب الزامی است', 400);
    if (!category) return jsonError('دسته‌بندی الزامی است', 400);
    if (!slug) return jsonError('نامک (slug) الزامی است', 400);
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return jsonError('نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد', 400);
    }

    const paragraphs = readParagraphs(body);
    if (paragraphs === null) {
      return jsonError('متن مطلب باید یک آرایه از پاراگراف‌ها باشد', 400);
    }
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        category,
        summary: readString(body, 'summary'),
        content: toJson(paragraphs),
        icon: readString(body, 'icon') ?? 'book',
        readTime: readString(body, 'readTime') ?? '۴ دقیقه',
        image: readString(body, 'image'),
        isPublished: readBoolean(body, 'isPublished') ?? true,
        sortOrder: readNumber(body, 'sortOrder') ?? 0,
      },
    });

    await writeAudit({
      actorId: admin.id,
      action: 'create',
      entity: 'article',
      entityId: article.id,
      after: article,
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
