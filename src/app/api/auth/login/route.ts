import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import {
  buildSessionCookieHeader,
  getSessionMaxAge,
} from '@/lib/session'

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Sets an HttpOnly signed session cookie on success.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const username = String(body.username || '').trim()
    const password = String(body.password || '')

    if (!username || !password) {
      return NextResponse.json(
        { error: 'يرجى إدخال اسم المستخدم وكلمة المرور' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        passwordHash: true,
        isActive: true,
        isLocked: true,
        lockedUntil: true,
        failedAttempts: true,
        roles: {
          select: { role: { select: { code: true } } },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'بيانات الاعتماد غير صحيحة' },
        { status: 401 }
      )
    }

    if (!user.isActive || user.isLocked) {
      return NextResponse.json(
        { error: 'الحساب موقوف أو مقفل' },
        { status: 403 }
      )
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: 'الحساب مقفل مؤقتًا بسبب محاولات دخول كثيرة' },
        { status: 429 }
      )
    }

    const valid = await verifyPassword(password, user.passwordHash || '')
    if (!valid) {
      // Increment failed attempts (best-effort, don't block the response).
      try {
        await db.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: { increment: 1 },
          },
        })
      } catch {
        // ignore — audit-grade only.
      }
      return NextResponse.json(
        { error: 'بيانات الاعتماد غير صحيحة' },
        { status: 401 }
      )
    }

    // Reset failed attempts on success.
    try {
      await db.user.update({
        where: { id: user.id },
        data: { failedAttempts: 0, lastLoginAt: new Date() },
      })
    } catch {
      // ignore
    }

    const roleCodes = user.roles.map((r) => r.role.code)
    const expiry = Date.now() + getSessionMaxAge() * 1000
    const cookie = buildSessionCookieHeader({
      userId: user.id,
      username: user.username,
      roleCodes,
      expiry,
    })

    const resp = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        roleCodes,
      },
    })
    resp.headers.set('Set-Cookie', cookie)
    return resp
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
