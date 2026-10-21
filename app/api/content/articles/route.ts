import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * The published articles for the education section.
 *
 * Read-only and public: the content is editorial, not user data. Draft
 * articles are never returned.
 */
export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
