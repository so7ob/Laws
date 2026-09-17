import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const q = searchParams.get('q') || ''
    const typeCode = searchParams.get('type')
    const authorityCode = searchParams.get('authority')
    const subjectCode = searchParams.get('subject')
    const yearFrom = searchParams.get('yearFrom') ? parseInt(searchParams.get('yearFrom')!) : null
    const yearTo = searchParams.get('yearTo') ? parseInt(searchParams.get('yearTo')!) : null
    const legalStatus = searchParams.get('legalStatus')
    const verificationLevel = searchParams.get('verification')
    const sortBy = searchParams.get('sortBy') || 'publicationDate'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const skip = (page - 1) * pageSize

    const where: any = {
      workflowStatus: 'published',
    }
    if (q) {
      where.OR = [
        { officialTitle: { contains: q } },
        { shortTitle: { contains: q } },
        { preamble: { contains: q } },
      ]
    }
    if (typeCode) {
      where.type = { code: typeCode }
    }
    if (authorityCode) {
      where.authority = { code: authorityCode }
    }
    if (subjectCode) {
      where.legislationSubjects = { some: { subject: { code: subjectCode } } }
    }
    if (legalStatus) {
      where.legalStatus = legalStatus
    }
    if (verificationLevel) {
      where.verificationLevel = verificationLevel
    }
    if (yearFrom || yearTo) {
      where.year = {}
      if (yearFrom) where.year.gte = yearFrom
      if (yearTo) where.year.lte = yearTo
    }

    const orderBy: any = {}
    if (sortBy === 'title') {
      orderBy.officialTitle = sortOrder
    } else if (sortBy === 'year') {
      orderBy.year = sortOrder
    } else {
      orderBy[sortBy || 'publicationDate'] = sortOrder
    }

    const [items, total] = await Promise.all([
      db.legislation.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          type: true,
          authority: true,
          legislationSubjects: { include: { subject: true } },
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
      }),
      db.legislation.count({ where }),
    ])

    return NextResponse.json({
      items: items.map((l) => ({
        ...l,
        subjects: l.legislationSubjects.map((ls) => ls.subject),
        legislationSubjects: undefined,
        articleCount: l._count.articles,
        attachmentCount: l._count.attachments,
        amendmentCount: l._count.amendmentsFor,
        relationCount: l._count.relations + l._count.reverseRelations,
        _count: undefined,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (e: any) {
    console.error('legislations API error:', e)
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 })
  }
}
