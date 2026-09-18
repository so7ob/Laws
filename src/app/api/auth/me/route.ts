import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionCookieValue, getSessionCookieName } from '@/lib/session'

/**
 * GET /api/auth/me
 * Returns the currently authenticated user, or 401 if no valid session.
 */
export async function GET(request: NextRequest) {
  try {
    const cookieName = getSessionCookieName()
    const cookie = request.cookies.get(cookieName)?.value
    const payload = verifySessionCookieValue(cookie)
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        isActive: true,
        isLocked: true,
        roles: { select: { role: { select: { code: true, nameAr: true } } } },
      },
    })

    if (!user || !user.isActive || user.isLocked) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles.map((r) => ({
          code: r.role.code,
          nameAr: r.role.nameAr,
        })),
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
