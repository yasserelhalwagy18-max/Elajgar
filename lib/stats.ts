import prisma from './prisma';

/**
 * The public numbers shown on the landing page.
 *
 * Shared by `/api/stats` and the landing page's server component, so the
 * page renders the real numbers on the first paint instead of flashing
 * zeros while a client fetch lands.
 */
export interface LandingStats {
  gyms: number;
  foods: number;
  articles: number;
  exercises: number;
  users: number;
  plans: number;
  bestDiscount: number;
}

export async function getLandingStats(): Promise<LandingStats> {
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

  return {
    gyms,
    foods,
    articles,
    exercises,
    users,
    plans,
    bestDiscount: bestDiscount._max.discountPercentage ?? 0,
  };
}
