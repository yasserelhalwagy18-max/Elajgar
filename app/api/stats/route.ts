import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * The public numbers shown on the landing page.
 *
 * The counts used to be typed into the page by hand, which meant they were
 * wrong: the page claimed there were 24 foods while the database held more
 * than two hundred. They come from the database now.
 */
export async function GET() {
  try {
    const [gyms, foods, articles, exercises, users, plans] = await Promise.all([
      prisma.gym.count(),
      prisma.food.count(),
      prisma.article.count({ where: { isPublished: true } }),
      prisma.exercise.count({ where: { isPublished: true } }),
      prisma.user.count(),
      prisma.plan.count({ where: { isActive: true } }),
    ]);

    // The best discount any partner gym offers.
    const bestDiscount = await prisma.gym.aggregate({
      _max: { discountPercentage: true },
    });

    return NextResponse.json({
      gyms,
      foods,
      articles,
      exercises,
      users,
      plans,
      bestDiscount: bestDiscount._max.discountPercentage ?? 0,
    });
  } catch (error) {
    console.error('Error fetching the public stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
