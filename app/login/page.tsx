import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';
import { destinationFor, safeNextPath } from '@/lib/destination';
import LoginForm from './login-form';

export const metadata: Metadata = {
  title: 'ورود به حساب کاربری',
  description: 'ورود به حساب کاربری علاجگر جهت دسترسی به داشبورد سلامت و برنامه‌های اصلاحی',
};

/**
 * The login screen.
 *
 * This is a server component, because a signed-in user has no business on
 * this page: they used to be shown the login form again and had to sign in
 * a second time. The session cookie is the source of truth here - the
 * browser's local storage can be stale, the cookie cannot - so a user with a
 * valid session is sent straight onward to where they belong.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = safeNextPath(rawNext);

  const userId = await getSessionUserId();

  if (userId) {
    // The session says the user is signed in, so they are sent onward even
    // when the profile cannot be read - the dashboard works out the rest.
    let role: string | undefined;
    let currentWizardStep: number | null | undefined;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, currentWizardStep: true },
      });
      role = user?.role;
      currentWizardStep = user?.currentWizardStep;
    } catch (error) {
      console.error('Failed to read the profile for the redirect:', error);
    }

    redirect(destinationFor({ role, currentWizardStep, nextPath }));
  }

  return <LoginForm nextPath={nextPath} />;
}
