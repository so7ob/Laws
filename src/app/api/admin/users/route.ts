import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import {
  verifySessionCookieValue,
  getSessionCookieName,
} from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const where: any = {}
    if (q) {
      where.OR = [
        { username: { contains: q } },
        { email: { contains: q } },
        { fullName: { contains: q } },
      ]
    }
    const items = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        _count: {
          select: {
            auditLogs: true,
            favorites: true,
          },
        },
      },
    })
    return NextResponse.json({
      items: items.map((u) => ({
        ...u,
        passwordHash: undefined,
        roles: u.roles.map((r) => r.role),
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

/**
 * POST /api/admin/users
 * Creates a new user with a bcrypt-hashed password and links to roles.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieName = getSessionCookieName()
    const cookie = request.cookies.get(cookieName)?.value
    const session = await verifySessionCookieValue(cookie)
    const actingUserId = session?.userId || null

    const body = await request.json()
    const username = String(body.username || '').trim()
    const email = String(body.email || '').trim()
    const fullName = String(body.fullName || '').trim()
    const password = String(body.password || '')

    const errors: string[] = []
    if (!username) errors.push('اسم المستخدم مطلوب')
    if (!email) errors.push('البريد الإلكتروني مطلوب')
    if (!fullName) errors.push('الاسم الكامل مطلوب')
    if (!password || password.length < 8)
      errors.push('كلمة المرور مطلوبة (٨ أحرف على الأقل)')
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'تحقق فشل', details: errors },
        { status: 400 }
      )
    }

    // Duplicate checks → 409
    const [byUsername, byEmail] = await Promise.all([
      db.user.findUnique({ where: { username }, select: { id: true } }),
      db.user.findUnique({ where: { email }, select: { id: true } }),
    ])
    if (byUsername) {
      return NextResponse.json(
        { error: `اسم المستخدم «${username}» مستخدم مسبقًا` },
        { status: 409 }
      )
    }
    if (byEmail) {
      return NextResponse.json(
        { error: `البريد الإلكتروني «${email}» مستخدم مسبقًا` },
        { status: 409 }
      )
    }

    // Hash password with bcrypt.
    const passwordHash = await hashPassword(password)

    // Resolve role IDs from roleCodes.
    const roleCodes: string[] = Array.isArray(body.roleCodes)
      ? body.roleCodes.filter(Boolean)
      : []
    const roles = roleCodes.length
      ? await db.role.findMany({
          where: { code: { in: roleCodes } },
          select: { id: true, code: true },
        })
      : []

    const created = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          fullName,
          passwordHash,
          isActive: body.isActive !== false,
        },
      })

      // Link roles via UserRole join table.
      if (roles.length > 0) {
        await tx.userRole.createMany({
          data: roles.map((r) => ({
            userId: user.id,
            roleId: r.id,
            assignedBy: actingUserId,
          })),
        })
      }

      return user
    })

    // Audit log
    try {
      await db.auditLog.create({
        data: {
          userId: actingUserId,
          action: 'create',
          resource: 'user',
          resourceId: created.id,
          operation: 'create_user',
          afterState: JSON.stringify({
            username,
            email,
            fullName,
            roleCodes: roles.map((r) => r.code),
          }),
          reason: 'إنشاء مستخدم جديد من لوحة الإدارة',
        },
      })
    } catch {
      // best-effort
    }

    return NextResponse.json(
      { item: { ...created, passwordHash: undefined } },
      { status: 201 }
    )
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
