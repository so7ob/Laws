import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalLegislations,
      publishedLegislations,
      totalArticles,
      totalAmendments,
      totalRelations,
      totalAttachments,
      totalUsers,
      totalReports,
      pendingImports,
      byType,
      byYear,
      byStatus,
      byVerification,
      recentLegislations,
    ] = await Promise.all([
      db.legislation.count(),
      db.legislation.count({ where: { workflowStatus: 'published' } }),
      db.article.count(),
      db.amendmentDocument.count(),
      db.relation.count({ where: { status: 'published' } }),
      db.attachment.count({ where: { status: 'published' } }),
      db.user.count(),
      db.report.count({ where: { status: 'open' } }),
      db.importOperation.count({ where: { status: { in: ['uploaded', 'extracting', 'ready_review'] } } }),
      db.legislation.groupBy({
        by: ['typeId'],
        _count: { _all: true },
      }),
      db.legislation.groupBy({
        by: ['year'],
        _count: { _all: true },
        orderBy: { year: 'desc' },
        take: 10,
      }),
      db.legislation.groupBy({
        by: ['legalStatus'],
        _count: { _all: true },
      }),
      db.legislation.groupBy({
        by: ['verificationLevel'],
        _count: { _all: true },
      }),
      db.legislation.findMany({
        where: { workflowStatus: 'published' },
        orderBy: { publicationDate: 'desc' },
        take: 6,
        include: {
          type: true,
          authority: true,
        },
      }),
    ])

    const typeIds = byType.map((t) => t.typeId)
    const types = typeIds.length
      ? await db.legislationType.findMany({
          where: { id: { in: typeIds } },
        })
      : []
    const typeMap = new Map(types.map((t) => [t.id, t]))

    const subjectCount = await db.subject.count()
    const authorityCount = await db.issuingAuthority.count()

    return NextResponse.json({
      counts: {
        legislations: totalLegislations,
        published: publishedLegislations,
        articles: totalArticles,
        amendments: totalAmendments,
        relations: totalRelations,
        attachments: totalAttachments,
        users: totalUsers,
        openReports: totalReports,
        pendingImports,
        subjects: subjectCount,
        authorities: authorityCount,
      },
      breakdowns: {
        types: byType.map((t) => ({
          type: typeMap.get(t.typeId),
          count: t._count._all,
        })),
        years: byYear.map((y) => ({ year: y.year, count: y._count._all })),
        statuses: byStatus.map((s) => ({ status: s.legalStatus, count: s._count._all })),
        verification: byVerification.map((v) => ({
          level: v.verificationLevel,
          count: v._count._all,
        })),
      },
      recent: recentLegislations,
    })
  } catch (e: any) {
    console.error('stats API error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
