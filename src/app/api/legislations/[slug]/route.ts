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
      include: {
        type: true,
        authority: true,
        legislationSubjects: { include: { subject: true } },
        legislationClassifications: { include: { classification: true } },
        parent: { select: { id: true, officialTitle: true, slug: true } },
        amendmentsFor: {
          select: { id: true, officialTitle: true, slug: true },
        },
        structureNodes: {
          where: { parentNodeId: null },
          orderBy: { sortOrder: 'asc' },
        },
        articles: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            publishedNumber: true,
            sortOrder: true,
            isDuplicate: true,
            duplicateLabel: true,
            versions: {
              where: { isCurrent: true },
              select: {
                id: true,
                versionNo: true,
                textContent: true,
                effectiveFrom: true,
                effectiveTo: true,
                changeType: true,
                changeReason: true,
              },
              take: 1,
            },
          },
        },
        attachments: {
          where: { status: 'published' },
          orderBy: { sortOrder: 'asc' },
        },
        sources: {
          include: {
            source: true,
          },
        },
        officialJournals: true,
        _count: {
          select: {
            articles: true,
            attachments: true,
            amendmentsFor: true,
            relations: true,
            reverseRelations: true,
          },
        },
      },
    })

    if (!leg) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...leg,
      subjects: leg.legislationSubjects.map((ls) => ls.subject),
      classifications: leg.legislationClassifications.map((lc) => lc.classification),
      legislationSubjects: undefined,
      legislationClassifications: undefined,
      articleCount: leg._count.articles,
      attachmentCount: leg._count.attachments,
      amendmentCount: leg._count.amendmentsFor,
      relationCount: leg._count.relations + leg._count.reverseRelations,
      _count: undefined,
    })
  } catch (e: any) {
    console.error('legislation detail error:', e)
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 })
  }
}
