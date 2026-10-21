import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { adminErrorResponse, paginated, parsePagination } from '@/lib/admin-api';
import { getSubscriptionTotals } from '@/lib/subscription';

/**
 * The subscriptions that were bought.
 *
 * This is the admin's view of who paid for what: every subscription with its
 * plan, its user and the payment behind it.
 */
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams, 20);

    const planKey = searchParams.get('plan');
    const status = searchParams.get('status');
    const query = searchParams.get('q');

    const where: Prisma.SubscriptionWhereInput = {};

    if (planKey) where.plan = { key: planKey };
    if (status && ['ACTIVE', 'CANCELED', 'EXPIRED'].includes(status)) {
      where.status = status as Prisma.EnumSubscriptionStatusFilter['equals'];
    }

    if (query) {
      where.user = {
        OR: [
          { fullName: { contains: query } },
          { phoneNumber: { contains: query } },
        ],
      };
    }

    const [subscriptions, total, totals] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          plan: true,
          user: { select: { id: true, fullName: true, phoneNumber: true } },
          payment: { select: { id: true, amount: true, status: true, reference: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.subscription.count({ where }),
      getSubscriptionTotals(),
    ]);

    return NextResponse.json({
      ...paginated(subscriptions, total, pagination),
      totals,
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
