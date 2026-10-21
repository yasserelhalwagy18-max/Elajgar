import { ADMIN_PATH } from './admin-path';
import { isWizardComplete } from './wizard';

/**
 * Where a signed-in user belongs.
 *
 * The login screen sends the user onward after a successful sign-in, and the
 * login screen itself sends an already signed-in user onward. Both need the
 * same answer, so the rule lives here instead of in one of them.
 */

/**
 * Keep a `next` parameter only when it points inside this site.
 *
 * The middleware puts the path the user was trying to reach into `next`, but
 * the parameter comes from the URL, so anybody can craft one. A path that
 * starts with `//` is a protocol-relative URL - `//example.com` - and would
 * take the user off the site, so it is refused along with anything that is
 * not a path at all.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (typeof next !== 'string') return null;
  if (!next.startsWith('/')) return null;
  if (next.startsWith('//')) return null;
  return next;
}

/**
 * The page a user should land on.
 *
 * - A page they were sent to is honoured, because getting there was a
 *   deliberate click.
 * - An admin has no use for the questionnaire - the panel is what they came
 *   for.
 * - A user who has already answered the questionnaire has no use for it
 *   either - the dashboard is where the answers pay off.
 * - Anyone else is sent to the wizard, which opens at the step they left it,
 *   so they carry on where they stopped.
 */
export function destinationFor(options: {
  role?: string | null;
  currentWizardStep?: number | null;
  nextPath?: string | null;
}): string {
  const next = safeNextPath(options.nextPath);
  if (next) return next;
  if (options.role === 'ADMIN') return ADMIN_PATH;
  if (isWizardComplete(options.currentWizardStep)) return '/dashboard';
  return '/wizard';
}
