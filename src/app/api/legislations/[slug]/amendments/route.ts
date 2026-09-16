import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const leg = await db.legislation.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!leg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const docs = await db.amendmentDocument.findMany({
      where: {
        OR: [
          { targetLegislationId: leg.id },
          { sourceLegislationId: leg.id },
        ],
      },
      include: {
        targetLegislation: {
          select: { id: true, slug: true, officialTitle: true, shortTitle: true },
        },
        sourceLegislation: {
          select: { id: true, slug: true, officialTitle: true, shortTitle: true },
        },
        operations: {
          orderBy: { sortOrder: 'asc' },
          include: {
            targetArticle: {
              select: { id: true, publishedNumber: true },
            },
          },
        },
      },
      orderBy: { effectiveDate: 'desc' },
    })

    return NextResponse.json({ items: docs })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
