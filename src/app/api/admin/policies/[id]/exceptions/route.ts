import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifySessionCookieValue,
  getSessionCookieName,
} from '@/lib/session'

/**
 * GET /api/admin/policies/[id]/exceptions
 * Lists all exceptions for a policy.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const policy = await db.operationPolicy.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!policy) {
      return NextResponse.json({ error: 'السياسة غير موجودة' }, { status: 404 })
    }

    const exceptions = await db.policyException.findMany({
      where: { policyId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, email: true },
        },
        grantedBy: {
          select: { username: true, fullName: true },
        },
      },
    })
    return NextResponse.json({ items: exceptions })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

/**
 * POST /api/admin/policies/[id]/exceptions
 * Creates a new policy exception.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Resolve the acting user.
    const cookieName = getSessionCookieName()
    const cookie = request.cookies.get(cookieName)?.value
    const session = await verifySessionCookieValue(cookie)
    const actingUserId = session?.userId || null

    const body = await request.json()
    const userId = String(body.userId || '').trim()
    const reason = String(body.reason || '').trim()

    const errors: string[] = []
    if (!userId) errors.push('المستخدم مطلوب')
    if (!reason) errors.push('السبب مطلوب')
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'تحقق فشل', details: errors },
        { status: 400 }
      )
    }

    // Validate policy + user exist.
    const [policy, user] = await Promise.all([
      db.operationPolicy.findUnique({ where: { id }, select: { id: true } }),
      db.user.findUnique({ where: { id: userId }, select: { id: true } }),
    ])
    if (!policy) {
      return NextResponse.json({ error: 'السياسة غير موجودة' }, { status: 404 })
    }
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 400 })
    }

    // Parse optional expiry.
    let expiresAt: Date | null = null
    if (body.expiresAt) {
      const d = new Date(body.expiresAt)
      if (!Number.isNaN(d.getTime())) expiresAt = d
    }

    const created = await db.policyException.create({
      data: {
        policyId: id,
        userId,
        reason,
        grantedById: actingUserId,
        expiresAt,
        isActive: body.isActive !== false,
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, email: true },
        },
        grantedBy: {
          select: { username: true, fullName: true },
        },
      },
    })

    // Audit log
    try {
      await db.auditLog.create({
        data: {
          userId: actingUserId,
          action: 'create',
          resource: 'policy_exception',
          resourceId: created.id,
          operation: 'grant_exception',
          afterState: JSON.stringify({
            policyId: id,
            userId,
            reason,
            expiresAt: expiresAt?.toISOString() || null,
          }),
          reason: 'منح استثناء سياسة من لوحة الإدارة',
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
