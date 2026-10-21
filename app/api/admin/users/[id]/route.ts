import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { adminErrorResponse, jsonError, readBoolean, writeAudit } from '@/lib/admin-api';
import { assessUserRisk } from '@/lib/user-risk';

type Context = { params: Promise<{ id: string }> };

/** The full record of a single user. */
export async function GET(_request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        activityLevel: true,
        jobTitle: true,
        underlyingDiseases: true,
        medications: true,
        nutritionGoal: true,
        termsAccepted: true,
        currentWizardStep: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        painRegions: true,
        questionnaire: true,
        dailyLogs: {
          orderBy: { date: 'desc' },
          take: 30,
          include: { foods: true },
        },
        painAssessments: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!user) {
      return jsonError('کاربر یافت نشد', 404);
    }

    const risk = assessUserRisk({
      painRegions: user.painRegions,
      questionnaire: user.questionnaire,
    });

    return NextResponse.json({ ...user, risk });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/**
 * Update a user.
 *
 * Only the fields an admin is allowed to touch are accepted. The role and the
 * active flag are the two that matter; the profile itself is the user's to
 * edit.
 */
export async function PATCH(request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = (await request.json()) as Record<string, unknown>;

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true, fullName: true, phoneNumber: true },
    });

    if (!existing) {
      return jsonError('کاربر یافت نشد', 404);
    }

    const data: {
      role?: Role;
      isActive?: boolean;
      fullName?: string | null;
    } = {};

    if ('role' in body) {
      const role = body.role;
      if (role !== Role.ADMIN && role !== Role.USER) {
        return jsonError('نقش نامعتبر است', 400);
      }
      // An admin must not be able to demote themselves and lock the panel
      // out of the only account that can reach it.
      if (id === admin.id && role !== Role.ADMIN) {
        return jsonError('نمی‌توانید نقش مدیریتی حساب خودتان را حذف کنید', 400);
      }
      // Keep at least one admin in the system.
      if (existing.role === Role.ADMIN && role === Role.USER) {
        const admins = await prisma.user.count({ where: { role: Role.ADMIN, isActive: true } });
        if (admins <= 1) {
          return jsonError('حداقل یک مدیر فعال باید باقی بماند', 400);
        }
      }
      data.role = role;
    }

    if ('isActive' in body) {
      const isActive = readBoolean(body, 'isActive');
      if (isActive === undefined) {
        return jsonError('مقدار وضعیت فعال بودن نامعتبر است', 400);
      }
      if (id === admin.id && !isActive) {
        return jsonError('نمی‌توانید حساب خودتان را غیرفعال کنید', 400);
      }
      data.isActive = isActive;
    }

    if ('fullName' in body) {
      const fullName = body.fullName;
      if (fullName !== null && typeof fullName !== 'string') {
        return jsonError('نام نامعتبر است', 400);
      }
      data.fullName = typeof fullName === 'string' ? fullName.trim() : null;
    }

    if (Object.keys(data).length === 0) {
      return jsonError('هیچ تغییری ارسال نشده است', 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      } as never,
    });

    await writeAudit({
      actorId: admin.id,
      action: 'update',
      entity: 'user',
      entityId: id,
      before: existing,
      after: updated,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return adminErrorResponse(error);
  }
}

/**
 * Delete a user and everything that belongs to them.
 *
 * The rows cascade, so the daily logs, the pain zones and the questionnaire
 * go with the account.
 */
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    if (id === admin.id) {
      return jsonError('نمی‌توانید حساب خودتان را حذف کنید', 400);
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, phoneNumber: true, fullName: true, role: true },
    });

    if (!existing) {
      return jsonError('کاربر یافت نشد', 404);
    }

    if (existing.role === Role.ADMIN) {
      const admins = await prisma.user.count({ where: { role: Role.ADMIN, isActive: true } });
      if (admins <= 1) {
        return jsonError('حداقل یک مدیر فعال باید باقی بماند', 400);
      }
    }

    await prisma.user.delete({ where: { id } });

    await writeAudit({
      actorId: admin.id,
      action: 'delete',
      entity: 'user',
      entityId: id,
      before: existing,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
