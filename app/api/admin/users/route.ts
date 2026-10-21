import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import {
  adminErrorResponse,
  paginated,
  parsePagination,
} from '@/lib/admin-api';
import { assessUserRisk } from '@/lib/user-risk';
import { normalizeText } from '@/lib/utils';

/**
 * The list of users for the admin panel.
 *
 * The search runs on the server so the panel never has to download the whole
 * table to filter it, and the result is paginated for the same reason.
 */
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams, 20);

    const query = normalizeText(searchParams.get('q') ?? '');
    const roleFilter = searchParams.get('role');
    const activeFilter = searchParams.get('isActive');

    const where: Prisma.UserWhereInput = {};

    if (query) {
      // The phone number is stored in Latin digits but the admin may type
      // Persian ones, so both spellings are searched.
      where.OR = [
        { phoneNumber: { contains: query } },
        { phoneNumber: { contains: toLatinDigits(query) } },
        { fullName: { contains: query } },
        { jobTitle: { contains: query } },
      ];
    }

    if (roleFilter === 'ADMIN' || roleFilter === 'USER') {
      where.role = roleFilter as Role;
    }

    if (activeFilter === 'true' || activeFilter === 'false') {
      where.isActive = activeFilter === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          phoneNumber: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          currentWizardStep: true,
          painRegions: true,
          questionnaire: { select: { stressLevel: true, sleepQuality: true } },
          _count: { select: { dailyLogs: true, painZones: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.user.count({ where }),
    ]);

    const items = users.map((user) => {
      const risk = assessUserRisk({
        painRegions: user.painRegions,
        questionnaire: user.questionnaire,
      });

      const { questionnaire, painRegions, _count, ...rest } = user;

      return {
        ...rest,
        risk: risk.level,
        riskReason: risk.reason,
        maxPainIntensity: risk.maxIntensity,
        logCount: _count.dailyLogs,
      };
    });

    return NextResponse.json(paginated(items, total, pagination));
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/** Convert Persian digits to Latin ones so a phone number can be found. */
function toLatinDigits(input: string): string {
  return input.replace(/[۰-۹]/g, (digit) =>
    String.fromCharCode(digit.charCodeAt(0) - 0x06f0 + 0x30),
  );
}
