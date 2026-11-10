import { hasSessionCookie } from '@kompas/core/identity';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Optimistic guard for signed-in routes: without a session cookie, go to sign-in and come back
 * afterwards (`returnTo`, validated again by `safeReturnTo` on use). Pages still check the
 * session itself — a cookie is not proof of a valid session.
 */
export function proxy(request: NextRequest): NextResponse {
  if (hasSessionCookie(request.headers)) return NextResponse.next();
  const signIn = new URL('/logowanie', request.url);
  signIn.searchParams.set('returnTo', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(signIn);
}

export const config = {
  // Signed-in areas of F1: account (S3) and admin panel.
  matcher: ['/konto/:path*', '/admin/:path*'],
};
