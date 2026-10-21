import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { adminErrorResponse, paginated, parsePagination } from '@/lib/admin-api';

/**
 * The audit trail.
 *
 * Every change an admin makes through the panel is recorded, so there is an
 * answer to "who changed this and when".
 */
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams, 25);

    const entity = searchParams.get('entity');
    const action = searchParams.get('action');

    const where: Prisma.AuditLogWhereInput = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;

    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: { select: { id: true, phoneNumber: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json(paginated(entries, total, pagination));
  } catch (error) {
    return adminErrorResponse(error);
  }
}
