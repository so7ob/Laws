import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalLegislations,
      publishedLegislations,
      draftLegislations,
      inReviewLegislations,
      totalArticles,
      totalAmendments,
      appliedAmendments,
      pendingAmendments,
      totalRelations,
      pendingRelations,
      totalAttachments,
      pendingReviewAttachments,
      totalUsers,
      activeUsers,
      openReports,
      criticalReports,
      pendingImports,
      completedImports,
      recentAuditLogs,
      recentLegislations,
      byType,
      byStatus,
      byYear,
      recycleBatches,
    ] = await Promise.all([
      db.legislation.count(),
      db.legislation.count({ where: { workflowStatus: 'published' } }),
      db.legislation.count({ where: { workflowStatus: 'draft' } }),
      db.legislation.count({ where: { workflowStatus: 'in_review' } }),
      db.article.count(),
      db.amendmentDocument.count(),
      db.amendmentDocument.count({ where: { status: 'applied' } }),
      db.amendmentDocument.count({ where: { status: { in: ['draft', 'in_review', 'approved'] } } }),
      db.relation.count(),
      db.relation.count({ where: { status: { in: ['draft', 'in_review'] } } }),
      db.attachment.count(),
      db.attachment.count({ where: { status: 'in_review' } }),
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.report.count({ where: { status: 'open' } }),
      db.report.count({ where: { severity: 'critical', status: 'open' } }),
      db.importOperation.count({ where: { status: { in: ['uploaded', 'extracting', 'ready_review'] } } }),
      db.importOperation.count({ where: { status: 'completed' } }),
      db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { username: true, fullName: true } } },
      }),
      db.legislation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          type: true,
          authority: true,
        },
      }),
      db.legislation.groupBy({ by: ['typeId'], _count: { _all: true } }),
      db.legislation.groupBy({ by: ['workflowStatus'], _count: { _all: true } }),
      db.legislation.groupBy({ by: ['year'], _count: { _all: true }, orderBy: { year: 'desc' }, take: 12 }),
      db.deletionBatch.count({ where: { status: 'soft_deleted' } }),
    ])

    const typeIds = byType.map((t) => t.typeId)
    const types = typeIds.length
      ? await db.legislationType.findMany({ where: { id: { in: typeIds } } })
      : []
    const typeMap = new Map(types.map((t) => [t.id, t]))

    return NextResponse.json({
      kpis: {
        legislations: {
          total: totalLegislations,
          published: publishedLegislations,
          draft: draftLegislations,
          inReview: inReviewLegislations,
        },
        articles: totalArticles,
        amendments: {
          total: totalAmendments,
          applied: appliedAmendments,
          pending: pendingAmendments,
        },
        relations: {
          total: totalRelations,
          pending: pendingRelations,
        },
        attachments: {
          total: totalAttachments,
          pendingReview: pendingReviewAttachments,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        reports: {
          open: openReports,
          critical: criticalReports,
        },
        imports: {
          pending: pendingImports,
          completed: completedImports,
        },
        recycleBatches,
      },
      charts: {
        types: byType.map((t) => ({
          type: typeMap.get(t.typeId),
          count: t._count._all,
        })),
        statuses: byStatus.map((s) => ({
          status: s.workflowStatus,
          count: s._count._all,
        })),
        years: byYear.map((y) => ({ year: y.year, count: y._count._all })),
      },
      recent: {
        legislations: recentLegislations,
        auditLogs: recentAuditLogs,
      },
    })
  } catch (e: any) {
    console.error('admin dashboard error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
