import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserId, issueSession } from '@/lib/session';
import { hashPassword, verifyPassword, checkPasswordStrength } from '@/lib/password';

/**
 * Set or change the password of the signed-in user.
 *
 * The user has to prove who they are first: this route only works with a
 * session, and a session is only issued after an SMS code or an existing
 * password has been checked. So a stolen session cookie is the only way in,
 * which is the same bar as changing anything else in the profile.
 */
export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 });
    }

    let body: { password?: unknown; currentPassword?: unknown };
    try {
      body = (await request.json()) as { password?: unknown; currentPassword?: unknown };
    } catch {
      return NextResponse.json({ error: 'درخواست نامعتبر است' }, { status: 400 });
    }

    if (typeof body.password !== 'string') {
      return NextResponse.json({ error: 'رمز عبور را وارد کنید' }, { status: 400 });
    }

    const problem = checkPasswordStrength(body.password);
    if (problem) {
      return NextResponse.json({ error: problem }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phoneNumber: true, password: { select: { hash: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'حساب کاربری یافت نشد' }, { status: 404 });
    }

    // Changing an existing password needs the current one. Setting the first
    // password does not - the session already proves who the user is.
    if (user.password) {
      if (typeof body.currentPassword !== 'string' || !body.currentPassword) {
        return NextResponse.json(
          { error: 'برای تغییر رمز عبور، رمز فعلی لازم است' },
          { status: 400 },
        );
      }

      if (!(await verifyPassword(body.currentPassword, user.password.hash))) {
        return NextResponse.json(
          { error: 'رمز عبور فعلی درست نیست' },
          { status: 403 },
        );
      }
    }

    const hash = await hashPassword(body.password);

    await prisma.hashedPassword.upsert({
      where: { userId },
      create: { userId, hash },
      update: { hash },
    });

    // A password change revokes every outstanding session - a stolen cookie
    // must not survive it. The version bump invalidates this request's own
    // token too, so issue a fresh one right away.
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
      select: { tokenVersion: true },
    });

    await issueSession(userId, user.phoneNumber, updated.tokenVersion);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting the password:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
