import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifySessionCookieValue,
  getSessionCookieName,
} from '@/lib/session'

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['in_review', 'archived'],
  in_review: ['approved', 'rejected', 'draft'],
  approved: ['applied', 'rejected', 'draft'],
  applied: ['archived'],
  rejected: ['draft', 'archived'],
  archived: ['draft'],
}

/**
 * PATCH /api/admin/amendments/[id]
 * Updates the status of an amendment document (workflow transition).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cookieName = getSessionCookieName()
    const cookie = request.cookies.get(cookieName)?.value
    const session = await verifySessionCookieValue(cookie)
    const actingUserId = session?.userId || null

    const body = await request.json()
    const newStatus = String(body.status || '').trim()

    if (!newStatus) {
      return NextResponse.json(
        { error: 'الحالة الجديدة مطلوبة' },
        { status: 400 }
      )
    }

    const doc = await db.amendmentDocument.findUnique({
      where: { id },
      select: { id: true, status: true, title: true },
    })
    if (!doc) {
      return NextResponse.json(
        { error: 'وثيقة التعديل غير موجودة' },
        { status: 404 }
      )
    }

    // Validate the transition.
    const allowed = VALID_TRANSITIONS[doc.status] || []
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `لا يمكن الانتقال من «${doc.status}» إلى «${newStatus}». الانتقالات المسموحة: ${allowed.join('، ') || 'لا يوجد'}`,
        },
        { status: 409 }
      )
    }

    const updateData: any = { status: newStatus }
    if (newStatus === 'in_review' && !doc.reviewedAt) {
      updateData.reviewedAt = new Date()
      updateData.reviewedById = actingUserId
    }
    if (newStatus === 'rejected') {
      updateData.reviewNotes = body.reason
        ? String(body.reason)
        : 'مرفوض من لوحة الإدارة'
    }

    const updated = await db.amendmentDocument.update({
      where: { id },
      data: updateData,
    })

    // Audit log
    try {
      await db.auditLog.create({
        data: {
          userId: actingUserId,
          action: 'transition',
          resource: 'amendment',
          resourceId: doc.id,
          operation: `transition:${doc.status}->${newStatus}`,
          beforeState: JSON.stringify({ status: doc.status }),
          afterState: JSON.stringify({ status: newStatus }),
          reason: `انتقال حالة وثيقة التعديل من ${doc.status} إلى ${newStatus}`,
        },
      })
    } catch {
      // best-effort
    }

    return NextResponse.json({ item: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
