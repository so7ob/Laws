import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifySessionCookieValue,
  getSessionCookieName,
} from '@/lib/session'

export async function GET() {
  try {
    const items = await db.role.findMany({
      orderBy: { powerLevel: 'asc' },
      include: {
        _count: {
          select: {
            users: true,
            permissions: true,
          },
        },
      },
    })
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

/**
 * POST /api/admin/roles
 * Creates a new role.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieName = getSessionCookieName()
    const cookie = request.cookies.get(cookieName)?.value
    const session = await verifySessionCookieValue(cookie)
    const actingUserId = session?.userId || null

    const body = await request.json()
    const code = String(body.code || '').trim()
    const nameAr = String(body.nameAr || '').trim()

    const errors: string[] = []
    if (!code) errors.push('رمز الدور مطلوب')
    if (!nameAr) errors.push('اسم الدور بالعربية مطلوب')
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'تحقق فشل', details: errors },
        { status: 400 }
      )
    }

    // Duplicate code check → 409
    const existing = await db.role.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json(
        { error: `رمز الدور «${code}» مستخدم مسبقًا` },
        { status: 409 }
      )
    }

    const powerLevel = body.powerLevel != null ? parseInt(String(body.powerLevel), 10) : 0

    const created = await db.role.create({
      data: {
        code,
        nameAr,
        description: body.description ? String(body.description) : null,
        powerLevel: Number.isFinite(powerLevel) ? powerLevel : 0,
        isProtected: false,
        isSystem: false,
        active: body.active !== false,
      },
    })

    // Audit log
    try {
      await db.auditLog.create({
        data: {
          userId: actingUserId,
          action: 'create',
          resource: 'role',
          resourceId: created.id,
          operation: 'create_role',
          afterState: JSON.stringify({ code, nameAr, powerLevel }),
          reason: 'إنشاء دور جديد من لوحة الإدارة',
        },
      })
    } catch {
      // best-effort
    }

    return NextResponse.json({ item: created }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
