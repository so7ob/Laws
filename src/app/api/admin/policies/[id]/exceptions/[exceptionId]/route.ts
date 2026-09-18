import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifySessionCookieValue,
  getSessionCookieName,
} from '@/lib/session'

/**
 * DELETE /api/admin/policies/[id]/exceptions/[exceptionId]
 * Deactivates (soft-delete) a policy exception by setting isActive=false.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; exceptionId: string }> }
) {
  try {
    const { id, exceptionId } = await params

    const cookieName = getSessionCookieName()
    const cookie = request.cookies.get(cookieName)?.value
    const session = await verifySessionCookieValue(cookie)
    const actingUserId = session?.userId || null

    const existing = await db.policyException.findFirst({
      where: { id: exceptionId, policyId: id },
      select: { id: true, isActive: true, userId: true, reason: true },
    })
    if (!existing) {
      return NextResponse.json(
        { error: 'الاستثناء غير موجود' },
        { status: 404 }
      )
    }

    await db.policyException.update({
      where: { id: exceptionId },
      data: { isActive: false },
    })

    try {
      await db.auditLog.create({
        data: {
          userId: actingUserId,
          action: 'delete',
          resource: 'policy_exception',
          resourceId: exceptionId,
          operation: 'revoke_exception',
          beforeState: JSON.stringify({
            policyId: id,
            userId: existing.userId,
            reason: existing.reason,
          }),
          reason: 'إلغاء استثناء سياسة من لوحة الإدارة',
        },
      })
    } catch {
      // best-effort
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
