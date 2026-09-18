import { NextRequest, NextResponse } from 'next/server'
import {
  verifySessionCookieValue,
  getSessionCookieName,
} from '@/lib/session'

/**
 * Gates all admin API routes behind a valid session cookie.
 *
 * Public routes that pass through unconditionally:
 *  - /api/auth/* (login, logout, me)
 *  - all non-admin /api/* routes (legislations, search, etc.)
 *  - all static/public routes
 *
 * Admin routes (/api/admin/*) require a signed session cookie. Without
 * one, the middleware returns 401 JSON. The middleware is stateless: it
 * only validates the HMAC signature + expiry. The handler then re-checks
 * the user against the DB as needed.
 *
 * This is demo-grade auth: a real deployment would add CSRF protection,
 * rate limiting, IP allow-listing, and a server-side session store. See
 * README "Demo vs Production" section.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only gate the admin API surface.
  if (!pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  const cookieName = getSessionCookieName()
  const cookie = request.cookies.get(cookieName)?.value
  const payload = verifySessionCookieValue(cookie)

  if (!payload) {
    return NextResponse.json(
      { error: 'غير مصرح — يرجى تسجيل الدخول', authRequired: true },
      { status: 401 }
    )
  }

  // Attach the session user info via a request header for downstream
  // handlers (optional convenience). Headers are immutable on the
  // incoming request, so we clone the response and set a custom header
  // the handler can read. For simplicity we pass through; handlers can
  // re-read the cookie.
  const response = NextResponse.next()
  response.headers.set('x-session-user', payload.username)
  response.headers.set('x-session-roles', payload.roleCodes.join(','))
  return response
}

export const config = {
  matcher: ['/api/admin/:path*'],
}
