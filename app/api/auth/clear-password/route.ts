import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUserId, issueSession } from '@/lib/session';
import { verifyPassword } from '@/lib/password';

/**
 * Remove the password of the signed-in user, so the account goes back to
 * signing in with an SMS code only.
 *
 * Until now this was only possible from the command line
 * (`npm run admin:clear-password`), which meant a user who wanted to go
 * back to SMS-only had to ask somebody with access to the server.
 *
 * The current password is required, the same bar as changing it: a stolen
 * session cookie on its own must not be enough to strip the account of the
 * second factor. The SMS code stays available either way, so nothing is
 * locked away that the account cannot get back to.
 */
export async function DELETE(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 });
    }

    let body: { currentPassword?: unknown };
    try {
      body = (await request.json()) as { currentPassword?: unknown };
    } catch {
      body = {};
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phoneNumber: true, password: { select: { hash: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'حساب کاربری یافت نشد' }, { status: 404 });
    }

    // Nothing to remove - the account already signs in with a code only.
    if (!user.password) {
      return NextResponse.json({ success: true });
    }

    if (typeof body.currentPassword !== 'string' || !body.currentPassword) {
      return NextResponse.json(
        { error: 'برای حذف رمز عبور، رمز فعلی لازم است' },
        { status: 400 },
      );
    }

    if (!(await verifyPassword(body.currentPassword, user.password.hash))) {
      return NextResponse.json(
        { error: 'رمز عبور فعلی درست نیست' },
        { status: 403 },
      );
    }

    await prisma.hashedPassword.deleteMany({ where: { userId } });

    // Removing a credential revokes every outstanding session. The version
    // bump invalidates this request's own token too, so issue a fresh one.
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
      select: { tokenVersion: true },
    });

    await issueSession(userId, user.phoneNumber, updated.tokenVersion);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing the password:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
