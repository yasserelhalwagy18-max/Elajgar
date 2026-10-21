/**
 * Where the admin panel lives.
 *
 * The path is deliberately not `/admin`. The panel is behind a real check -
 * only an account with the `ADMIN` role can open it - but a path like
 * `/admin` is the first thing a scanner tries, and a panel that answers
 * there tells the world it exists.
 *
 * The folder in `app/` has to have the same name, because that is what the
 * route is. To move the panel:
 *
 * 1. rename the folder in `app/`
 * 2. change `ADMIN_PATH` below
 * 3. add the new path to `PROTECTED_PREFIXES` in `middleware.ts`
 *
 * The API under `/api/admin` is left alone on purpose: it is protected by
 * the role check, and a path that is hard to guess is no substitute for
 * that.
 */
export const ADMIN_PATH = '/panel-7x9k4m';
