import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Extract token from cookie
  const token = request.cookies.get('session')?.value;

  if (token) {
    const payload = await verifyToken(token);

    if (payload && payload.userId) {
      // Clone the request headers and add user ID
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId as string);

      // Continue request with modified headers
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

// Only run middleware on API routes (except auth routes where it's not needed or could interfere)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
