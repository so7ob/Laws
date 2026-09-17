import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const scope = searchParams.get('scope') || 'all' // all, legislation, article, attachment
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const typeCode = searchParams.get('type')
    const yearFrom = searchParams.get('yearFrom') ? parseInt(searchParams.get('yearFrom')!) : null
    const yearTo = searchParams.get('yearTo') ? parseInt(searchParams.get('yearTo')!) : null
    const authorityCode = searchParams.get('authority')
    const subjectCode = searchParams.get('subject')
    const matchMode = searchParams.get('match') || 'all' // all, any, exact, exclude

    if (!q || q.trim().length < 2) {
      return NextResponse.json({
        items: [],
        articleHits: [],
        attachmentHits: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      })
    }

    const skip = (page - 1) * pageSize

    const filters: any = { workflowStatus: 'published' }
    if (typeCode) filters.type = { code: typeCode }
    if (authorityCode) filters.authority = { code: authorityCode }
    if (subjectCode) filters.legislationSubjects = { some: { subject: { code: subjectCode } } }
    if (yearFrom || yearTo) {
      filters.year = {}
      if (yearFrom) filters.year.gte = yearFrom
      if (yearTo) filters.year.lte = yearTo
    }

    // Build query based on match mode
    const buildTextFilter = (text: string) => {
      if (matchMode === 'exact') {
        return { contains: text }
      }
      if (matchMode === 'any') {
        return { contains: text }
      }
      return { contains: text }
    }

    const legislationWhere: any = {
      ...filters,
      OR: [
        { officialTitle: buildTextFilter(q) },
        { shortTitle: buildTextFilter(q) },
        { preamble: buildTextFilter(q) },
      ],
    }

    const [legislations, legTotal] = scope === 'article' || scope === 'attachment'
      ? [[], 0]
      : await Promise.all([
          db.legislation.findMany({
            where: legislationWhere,
            skip,
            take: pageSize,
            orderBy: [{ officialTitle: 'asc' }],
            include: {
              type: true,
              authority: true,
              legislationSubjects: { include: { subject: true } },
              _count: { select: { articles: true } },
            },
          }),
          db.legislation.count({ where: legislationWhere }),
        ])

    let articleHits: any[] = []
    let attachmentHits: any[] = []

    if (scope === 'all' || scope === 'article') {
      // Search article versions
      const articles = await db.articleVersion.findMany({
        where: {
          isCurrent: true,
          textContent: buildTextFilter(q),
          article: { legislation: filters },
        },
        take: 30,
        include: {
          article: {
            include: {
              legislation: {
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
          },
        },
      })
      articleHits = articles.map((av) => {
        const text = av.textContent || ''
        const idx = text.indexOf(q)
        const start = Math.max(0, idx - 60)
        const end = Math.min(text.length, idx + q.length + 60)
        const snippet =
          idx >= 0
            ? (start > 0 ? '...' : '') +
              text.substring(start, end) +
              (end < text.length ? '...' : '')
            : text.substring(0, 120) + '...'
        return {
          id: av.id,
          articleId: av.articleId,
          articleNumber: av.article.publishedNumber,
          legislation: av.article.legislation,
          snippet,
          matchCount: (text.match(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length,
        }
      })
    }

    if (scope === 'all' || scope === 'attachment') {
      // Search attachments
      const attachments = await db.attachment.findMany({
        where: {
          status: 'published',
          OR: [
            { title: buildTextFilter(q) },
            { textContent: buildTextFilter(q) },
            { tableContent: buildTextFilter(q) },
          ],
          legislation: filters,
        },
        take: 20,
        include: {
          legislation: {
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
      attachmentHits = attachments.map((a) => ({
        ...a,
        snippet: (a.textContent || a.tableContent || '').substring(0, 150),
      }))
    }

    // Aggregations
    const typeAgg = await db.legislation.groupBy({
      by: ['typeId'],
      where: legislationWhere,
      _count: { _all: true },
    })
    const yearAgg = await db.legislation.groupBy({
      by: ['year'],
      where: legislationWhere,
      _count: { _all: true },
      orderBy: { year: 'desc' },
    })

    return NextResponse.json({
      items: legislations.map((l) => ({
        ...l,
        subjects: l.legislationSubjects.map((ls) => ls.subject),
        legislationSubjects: undefined,
      })),
      articleHits,
      attachmentHits,
      total: legTotal,
      page,
      pageSize,
      totalPages: Math.ceil(legTotal / pageSize),
      aggregations: {
        types: typeAgg,
        years: yearAgg,
        articleHitCount: articleHits.length,
        attachmentHitCount: attachmentHits.length,
      },
    })
  } catch (e: any) {
    console.error('search API error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
