import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { adminErrorResponse, paginated, parsePagination } from '@/lib/admin-api';
import { getSubscriptionTotals } from '@/lib/subscription';

/** The payments, newest first. */
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams, 20);

    const planKey = searchParams.get('plan');
    const status = searchParams.get('status');
    const query = searchParams.get('q');

    const where: Prisma.PaymentWhereInput = {};

    if (planKey) where.plan = { key: planKey };
    if (status && ['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(status)) {
      where.status = status as Prisma.EnumPaymentStatusFilter['equals'];
    }

    if (query) {
      where.OR = [
        { reference: { contains: query } },
        { user: { fullName: { contains: query } } },
        { user: { phoneNumber: { contains: query } } },
      ];
    }

    const [payments, total, totals] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          plan: true,
          user: { select: { id: true, fullName: true, phoneNumber: true } },
          subscription: { select: { id: true, status: true, expiresAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.payment.count({ where }),
      getSubscriptionTotals(),
    ]);

    return NextResponse.json({
      ...paginated(payments, total, pagination),
      totals,
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
