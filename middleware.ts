import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * Routes that require a signed-in user. The pages also guard themselves on
 * the client, but the client-side check is trivially bypassed - this is the
 * server-side half.
 */
const PROTECTED_PREFIXES = ['/dashboard', '/wizard', '/nutrition', '/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!needsAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session')?.value;

  if (token) {
    const payload = await verifyToken(token);
    if (payload?.userId) {
      return NextResponse.next();
    }
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
