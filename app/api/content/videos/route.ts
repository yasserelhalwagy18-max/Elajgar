import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * The published videos.
 *
 * Read-only and public: the video list is editorial content. The premium
 * ones are shown blurred to a visitor without a subscription and unlocked
 * for a subscriber.
 */
export async function GET() {
  try {
    const videos = await prisma.videoContent.findMany({
      where: { isPublished: true },
      include: {
        exercise: { select: { id: true, title: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
