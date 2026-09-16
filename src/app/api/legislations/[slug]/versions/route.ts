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

    const articles = await db.article.findMany({
      where: { legislationId: leg.id },
      orderBy: { sortOrder: 'asc' },
      include: {
        versions: {
          orderBy: { versionNo: 'desc' },
          select: {
            id: true,
            versionNo: true,
            textContent: true,
            rawText: true,
            effectiveFrom: true,
            effectiveTo: true,
            changeType: true,
            changeReason: true,
            isCurrent: true,
            isFuture: true,
          },
        },
      },
    })

    return NextResponse.json({
      items: articles.map((a) => ({
        ...a,
        currentVersion: a.versions.find((v) => v.isCurrent) || a.versions[0],
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
