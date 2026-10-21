import { NextResponse } from 'next/server';
import { Prisma, Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { adminErrorResponse } from '@/lib/admin-api';
import {
  BODY_BUCKETS,
  BODY_BUCKET_LABELS,
  resolveBucket,
  type BodyBucket,
} from '@/lib/body-regions';

/**
 * The aggregate for the admin overview.
 *
 * Every number here comes from the database. The dashboard used to render a
 * hardcoded table of three fake users and a hardcoded pain distribution, which
 * looked like real data and was not.
 */
export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      totalUsers,
      activeUsers,
      adminUsers,
      newUsersThisWeek,
      usersWithPain,
      totalGyms,
      totalFoods,
      totalArticles,
      publishedArticles,
      totalExercises,
      totalVideos,
      totalPlans,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { painRegions: { not: Prisma.DbNull } } }),
      prisma.gym.count(),
      prisma.food.count(),
      prisma.article.count(),
      prisma.article.count({ where: { isPublished: true } }),
      prisma.exercise.count(),
      prisma.videoContent.count(),
      prisma.plan.count(),
    ]);

    const [painRows, signups, recentLogs] = await Promise.all([
      // The pain regions live in a JSON column, so they are aggregated in
      // the application rather than in SQL.
      prisma.user.findMany({
        where: { painRegions: { not: Prisma.DbNull } },
        select: { painRegions: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { createdAt: true },
      }),
      prisma.dailyLog.count({ where: { date: { gte: weekAgo } } }),
    ]);

    const distribution = aggregatePainDistribution(painRows);
    const signupTrend = buildSignupTrend(signups, now);

    return NextResponse.json({
      counts: {
        users: { total: totalUsers, active: activeUsers, admins: adminUsers, newThisWeek: newUsersThisWeek, withPain: usersWithPain },
        gyms: totalGyms,
        foods: totalFoods,
        articles: { total: totalArticles, published: publishedArticles },
        exercises: totalExercises,
        videos: totalVideos,
        plans: totalPlans,
        dailyLogsThisWeek: recentLogs,
      },
      pain: distribution,
      signupTrend,
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

interface PainRow {
  painRegions: Prisma.JsonValue | null;
}

/**
 * Count how many users reported each body region.
 *
 * A user can report a region once, so the count is the number of *users*
 * with that region - which is what the percentage on the heatmap means.
 */
function aggregatePainDistribution(rows: PainRow[]) {
  const counts = new Map<BodyBucket, number>();
  for (const bucket of BODY_BUCKETS) counts.set(bucket, 0);

  const highIntensityUsers = new Set<string>();
  let usersWithAnyPain = 0;

  for (const row of rows) {
    const zones = Array.isArray(row.painRegions) ? row.painRegions : [];
    if (zones.length === 0) continue;

    usersWithAnyPain++;

    let maxIntensity = 0;
    for (const zone of zones) {
      if (!zone || typeof zone !== 'object') continue;

      const record = zone as Record<string, unknown>;
      const bucket = resolveBucket(typeof record.zone === 'string' ? record.zone : null);
      if (!bucket) continue;

      counts.set(bucket, (counts.get(bucket) ?? 0) + 1);

      const intensity = Number(record.intensity);
      if (Number.isFinite(intensity) && intensity > maxIntensity) maxIntensity = intensity;
    }

    if (maxIntensity >= 7) highIntensityUsers.add(JSON.stringify(zones));
  }

  const total = Math.max(usersWithAnyPain, 1);

  return {
    /** The number of users who reported at least one region. */
    usersWithPain: usersWithAnyPain,
    /** The number of users reporting an intensity of 7 or more. */
    highIntensityUsers: highIntensityUsers.size,
    regions: BODY_BUCKETS.map((bucket) => ({
      id: bucket,
      label: BODY_BUCKET_LABELS[bucket],
      count: counts.get(bucket) ?? 0,
      percentage: Math.round(((counts.get(bucket) ?? 0) / total) * 100),
    })),
  };
}

/**
 * The number of signups per day over the last seven days.
 */
function buildSignupTrend(rows: Array<{ createdAt: Date }>, now: Date) {
  const days: Array<{ date: string; count: number }> = [];

  for (let offset = 6; offset >= 0; offset--) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - offset);

    const next = new Date(day);
    next.setDate(next.getDate() + 1);

    const count = rows.filter((row) => row.createdAt >= day && row.createdAt < next).length;
    days.push({ date: day.toISOString().slice(0, 10), count });
  }

  return days;
}
