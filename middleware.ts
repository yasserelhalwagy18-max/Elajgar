import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getEncodedSecret() {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return new TextEncoder().encode(JWT_SECRET);
}

export async function middleware(request: NextRequest) {
  // Extract token from cookie
  const token = request.cookies.get('session')?.value;

  if (token) {
    try {
      const encodedSecret = getEncodedSecret();
      // Verify token
      const { payload } = await jwtVerify(token, encodedSecret);

      // Clone the request headers and add user ID
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId as string);

      // Continue request with modified headers
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Token verification failed, proceed without user info
      console.error('JWT verification failed:', error);
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
