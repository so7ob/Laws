import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifySessionCookieValue,
  getSessionCookieName,
} from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const q = searchParams.get('q') || ''
    const where: any = {}
    if (status) where.status = status
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { number: { contains: q } },
      ]
    }
    const items = await db.amendmentDocument.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        targetLegislation: { select: { id: true, slug: true, officialTitle: true, shortTitle: true } },
        sourceLegislation: { select: { id: true, slug: true, officialTitle: true, shortTitle: true } },
        reviewedBy: { select: { username: true, fullName: true } },
        appliedBy: { select: { username: true, fullName: true } },
        _count: { select: { operations: true } },
      },
    })
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

const VALID_OPERATION_TYPES = new Set([
  'replace',
  'add',
  'delete_part',
  'repeal',
  'renumber',
  'correct',
  'substitute_phrase',
])

function slugifyAmendment(input: string): string {
  return input
    .trim()
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/[\s\u200c]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 80)
}

/**
 * POST /api/admin/amendments
 * Creates a new amendment document in 'draft' status with optional operations.
 */
export async function POST(request: NextRequest) {
  try {
    // Resolve the acting user from the session cookie for the audit log.
    const cookieName = getSessionCookieName()
    const cookie = request.cookies.get(cookieName)?.value
    const session = await verifySessionCookieValue(cookie)
    const actingUserId = session?.userId || null

    const body = await request.json()

    // --- Validate required fields ---
    const title = String(body.title || '').trim()
    const targetLegislationId = String(body.targetLegislationId || '').trim()

    const errors: string[] = []
    if (!title) errors.push('عنوان وثيقة التعديل مطلوب')
    if (!targetLegislationId) errors.push('التشريع الهدف مطلوب')
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'تحقق فشل', details: errors },
        { status: 400 }
      )
    }

    // --- Validate operations (optional array) ---
    const rawOps = Array.isArray(body.operations) ? body.operations : []
    const operations: any[] = []
    for (let i = 0; i < rawOps.length; i++) {
      const op = rawOps[i] || {}
      const opType = String(op.operationType || '').trim().toLowerCase()
      if (!opType) {
        errors.push(`العملية ${i + 1}: النوع مطلوب`)
        continue
      }
      if (!VALID_OPERATION_TYPES.has(opType)) {
        errors.push(`العملية ${i + 1}: نوع غير مدعوم «${opType}»`)
        continue
      }
      operations.push({
        operationType: opType,
        targetArticleId: op.targetArticleId || null,
        sortOrder: i,
        oldText: op.oldText ? String(op.oldText) : null,
        newText: op.newText ? String(op.newText) : null,
        newArticleNumber: op.newArticleNumber ? String(op.newArticleNumber) : null,
        reason: op.reason ? String(op.reason) : null,
      })
    }
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'تحقق فشل', details: errors },
        { status: 400 }
      )
    }

    // --- Resolve slug ---
    const explicitSlug = String(body.slug || '').trim()
    const slug = explicitSlug
      ? slugifyAmendment(explicitSlug)
      : slugifyAmendment(`${title}-${Date.now()}`)
    if (!slug) {
      return NextResponse.json(
        { error: 'تعذّر توليد معرّف فريد للرابط' },
        { status: 400 }
      )
    }

    // --- Duplicate slug check → 409 ---
    const existing = await db.amendmentDocument.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: `المعرّف «${slug}» مستخدم مسبقًا` },
        { status: 409 }
      )
    }

    // --- Validate foreign keys ---
    const [targetLeg, sourceLeg] = await Promise.all([
      db.legislation.findUnique({
        where: { id: targetLegislationId },
        select: { id: true, officialTitle: true },
      }),
      body.sourceLegislationId
        ? db.legislation.findUnique({
            where: { id: String(body.sourceLegislationId).trim() },
            select: { id: true },
          })
        : Promise.resolve(null),
    ])
    if (!targetLeg) {
      return NextResponse.json(
        { error: 'التشريع الهدف غير موجود' },
        { status: 400 }
      )
    }

    // --- Parse optional fields ---
    const parseDate = (v: any): Date | null => {
      if (!v) return null
      const d = new Date(v)
      return Number.isNaN(d.getTime()) ? null : d
    }
    const yearNum =
      body.year != null ? parseInt(String(body.year), 10) : null

    // --- Create the amendment document + operations in a transaction ---
    const created = await db.$transaction(async (tx) => {
      const doc = await tx.amendmentDocument.create({
        data: {
          slug,
          title,
          number: body.number ? String(body.number).trim() : null,
          year: yearNum,
          targetLegislationId,
          sourceLegislationId: sourceLeg?.id || null,
          status: 'draft',
          issueDate: parseDate(body.issueDate),
          effectiveDate: parseDate(body.effectiveDate),
          description: body.description ? String(body.description) : null,
          operationCount: operations.length,
        },
      })

      // Create operations (if any) linked to the document.
      if (operations.length > 0) {
        await tx.amendmentOperation.createMany({
          data: operations.map((op) => ({ ...op, documentId: doc.id })),
        })
      }

      // Audit log
      try {
        await tx.auditLog.create({
          data: {
            userId: actingUserId,
            action: 'create',
            resource: 'amendment',
            resourceId: doc.id,
            operation: 'create',
            afterState: JSON.stringify({
              slug: doc.slug,
              title: doc.title,
              targetLegislationId: doc.targetLegislationId,
              operationCount: operations.length,
            }),
            reason: 'إنشاء وثيقة تعديل جديدة من لوحة الإدارة',
          },
        })
      } catch {
        // best-effort
      }

      return doc
    })

    // Return with relations for the UI.
    const result = await db.amendmentDocument.findUnique({
      where: { id: created.id },
      include: {
        targetLegislation: { select: { id: true, slug: true, officialTitle: true } },
        sourceLegislation: { select: { id: true, slug: true, officialTitle: true } },
        _count: { select: { operations: true } },
      },
    })

    return NextResponse.json({ item: result }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
