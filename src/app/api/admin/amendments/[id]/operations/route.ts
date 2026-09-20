import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/admin/amendments/[id]/operations
 * Returns the ordered operations for an amendment document.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const doc = await db.amendmentDocument.findUnique({
      where: { id },
      select: { id: true, title: true, status: true },
    })
    if (!doc) {
      return NextResponse.json(
        { error: 'وثيقة التعديل غير موجودة' },
        { status: 404 }
      )
    }

    const operations = await db.amendmentOperation.findMany({
      where: { documentId: id },
      orderBy: { sortOrder: 'asc' },
      include: {
        targetArticle: {
          select: {
            id: true,
            publishedNumber: true,
            legislation: { select: { slug: true, officialTitle: true } },
          },
        },
      },
    })

    return NextResponse.json({ items: operations, document: doc })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
