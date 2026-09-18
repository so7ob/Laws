import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySessionCookieValue, getSessionCookieName } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const q = searchParams.get('q') || ''
    const status = searchParams.get('status')
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (q) {
      where.OR = [
        { officialTitle: { contains: q } },
        { shortTitle: { contains: q } },
        { slug: { contains: q } },
      ]
    }
    if (status) where.workflowStatus = status

    const [items, total] = await Promise.all([
      db.legislation.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: {
          type: true,
          authority: true,
          _count: {
            select: {
              articles: true,
              attachments: true,
              amendmentsFor: true,
            },
          },
        },
      }),
      db.legislation.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

/**
 * Generate a URL-safe slug from an Arabic / mixed title.
 * Transliterates nothing; keeps Arabic letters, lowercases Latin,
 * replaces whitespace and punctuation with hyphens.
 */
function slugify(input: string): string {
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
 * POST /api/admin/legislations
 * Creates a new legislation in 'draft' workflow status.
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
    const officialTitle = String(body.officialTitle || '').trim()
    const typeId = String(body.typeId || '').trim()
    const authorityId = String(body.authorityId || '').trim()
    const number = String(body.number || '').trim()
    const yearNum = body.year != null ? parseInt(String(body.year), 10) : null

    const errors: string[] = []
    if (!officialTitle) errors.push('العنوان الرسمي مطلوب')
    if (!typeId) errors.push('نوع التشريع مطلوب')
    if (!authorityId) errors.push('جهة الإصدار مطلوبة')
    if (!number) errors.push('رقم التشريع مطلوب')
    if (body.year != null && (yearNum === null || Number.isNaN(yearNum)))
      errors.push('سنة التشريع غير صحيحة')
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'تحقق فشل', details: errors },
        { status: 400 }
      )
    }

    // --- Resolve slug ---
    const explicitSlug = String(body.slug || '').trim()
    const slug = explicitSlug
      ? slugify(explicitSlug)
      : slugify(body.shortTitle || officialTitle)

    if (!slug) {
      return NextResponse.json(
        { error: 'تعذّر توليد معرّف فريد للرابط' },
        { status: 400 }
      )
    }

    // --- Duplicate slug check → 409 ---
    const existing = await db.legislation.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: `المعرّف «${slug}» مستخدم مسبقًا` },
        { status: 409 }
      )
    }

    // --- Validate foreign keys ---
    const [type, authority] = await Promise.all([
      db.legislationType.findUnique({ where: { id: typeId }, select: { id: true } }),
      db.issuingAuthority.findUnique({ where: { id: authorityId }, select: { id: true } }),
    ])
    if (!type) {
      return NextResponse.json({ error: 'نوع التشريع غير موجود' }, { status: 400 })
    }
    if (!authority) {
      return NextResponse.json({ error: 'جهة الإصدار غير موجودة' }, { status: 400 })
    }

    // --- Parse optional dates ---
    const parseDate = (v: any): Date | null => {
      if (!v) return null
      const d = new Date(v)
      return Number.isNaN(d.getTime()) ? null : d
    }
    const issueDate = parseDate(body.issueDate)
    const effectiveDate = parseDate(body.effectiveDate)

    // --- Create the legislation ---
    const created = await db.legislation.create({
      data: {
        slug,
        officialTitle,
        shortTitle: body.shortTitle ? String(body.shortTitle).trim() : null,
        typeId,
        number,
        year: yearNum,
        authorityId,
        issueDate,
        effectiveDate,
        preamble: body.preamble ? String(body.preamble) : null,
        isPreamble: Boolean(body.isPreamble),
        // Defaults per schema: legalStatus='active', workflowStatus='draft',
        // verificationLevel='unverified', hasAmendments=false.
      },
    })

    // --- Audit log ---
    try {
      await db.auditLog.create({
        data: {
          userId: actingUserId,
          action: 'create',
          resource: 'legislation',
          resourceId: created.id,
          operation: 'create',
          afterState: JSON.stringify({
            slug: created.slug,
            officialTitle: created.officialTitle,
            number: created.number,
            year: created.year,
          }),
          reason: 'إنشاء تشريع جديد من لوحة الإدارة',
        },
      })
    } catch {
      // Audit is best-effort; don't fail the creation.
    }

    return NextResponse.json({ item: created }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
