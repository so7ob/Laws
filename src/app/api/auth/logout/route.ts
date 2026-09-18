import { NextResponse } from 'next/server'
import { buildClearSessionCookieHeader } from '@/lib/session'

/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
export async function POST() {
  const resp = NextResponse.json({ ok: true })
  resp.headers.set('Set-Cookie', buildClearSessionCookieHeader())
  return resp
}
