import 'server-only';

import { cookies } from 'next/headers';
import { Role } from '@prisma/client';
import prisma from './prisma';
import { verifyToken } from './auth';

export interface AdminActor {
  id: string;
  phoneNumber: string | null;
}

/**
 * A failure to authorise an admin request.
 *
 * `status` is the HTTP status the route should answer with: 401 when the
 * caller is not signed in, 403 when they are signed in but not allowed.
 */
export class AdminAuthError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AdminAuthError';
    this.status = status;
  }
}

/**
 * Authorise the current request as an admin.
 *
 * The role is read from the database on every call rather than trusted from
 * the session token, so revoking a role takes effect immediately instead of
 * when the token expires.
 *
 * This is the server-side half of the guard. The admin layout runs the same
 * check, but a layout guard protects pages - it does not protect data, and
 * an API route that forgets to call this would happily serve any signed-in
 * user.
 */
export async function requireAdmin(): Promise<AdminActor> {
  const token = (await cookies()).get('session')?.value;

  if (!token) {
    throw new AdminAuthError(401, 'برای دسترسی به پنل مدیریت باید وارد شوید');
  }

  const payload = await verifyToken(token);

  if (!payload || typeof payload.userId !== 'string') {
    throw new AdminAuthError(401, 'نشست شما منقضی شده است. دوباره وارد شوید');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, phoneNumber: true, role: true, isActive: true },
  });

  if (!user) {
    throw new AdminAuthError(401, 'حساب کاربری یافت نشد');
  }

  if (!user.isActive) {
    throw new AdminAuthError(403, 'این حساب غیرفعال شده است');
  }

  if (user.role !== Role.ADMIN) {
    throw new AdminAuthError(403, 'دسترسی مدیریتی برای این حساب فعال نیست');
  }

  return { id: user.id, phoneNumber: user.phoneNumber };
}
