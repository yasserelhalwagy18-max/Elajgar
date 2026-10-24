import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';
import { getActiveSubscription } from '@/lib/subscription';

/**
 * The published videos.
 *
 * Read-only and public: the video list is editorial content. The premium
 * ones are shown blurred to a visitor without a subscription and unlocked
 * for a subscriber.
 *
 * The paywall is enforced HERE, not in the UI: a premium video's stream URL
 * only ever reaches a caller with an active subscription. Everyone else gets
 * the metadata (title, duration, thumbnail) the blurred card needs, with
 * `url: null`.
 */
export async function GET() {
  try {
    const userId = await getSessionUserId();
    const subscription = userId ? await getActiveSubscription(userId) : null;
    const entitled = Boolean(subscription);

    const videos = await prisma.videoContent.findMany({
      where: { isPublished: true },
      include: {
        exercise: { select: { id: true, title: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      videos.map((video) =>
        video.isPremium && !entitled ? { ...video, url: null } : video,
      ),
    );
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
