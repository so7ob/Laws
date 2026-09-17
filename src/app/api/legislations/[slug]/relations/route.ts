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
      select: { id: true, officialTitle: true, slug: true, shortTitle: true },
    })
    if (!leg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const outgoing = await db.relation.findMany({
      where: { fromLegislationId: leg.id, status: 'published' },
      include: {
        toLegislation: {
          select: {
            id: true,
            slug: true,
            officialTitle: true,
            shortTitle: true,
            year: true,
            type: { select: { nameAr: true, code: true } },
          },
        },
      },
    })
    const incoming = await db.relation.findMany({
      where: { toLegislationId: leg.id, status: 'published' },
      include: {
        fromLegislation: {
          select: {
            id: true,
            slug: true,
            officialTitle: true,
            shortTitle: true,
            year: true,
            type: { select: { nameAr: true, code: true } },
          },
        },
      },
    })

    return NextResponse.json({
      from: leg,
      outgoing: outgoing.map((r) => ({ ...r, direction: 'outgoing' })),
      incoming: incoming.map((r) => ({ ...r, direction: 'incoming' })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
