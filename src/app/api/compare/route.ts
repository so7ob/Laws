import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slugA = searchParams.get('a')
    const slugB = searchParams.get('b')

    if (!slugA || !slugB) {
      return NextResponse.json({ error: 'Both slugs a and b are required' }, { status: 400 })
    }

    const [legA, legB] = await Promise.all([
      db.legislation.findUnique({
        where: { slug: slugA },
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
      db.legislation.findUnique({
        where: { slug: slugB },
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
    ])

    if (!legA || !legB) {
      return NextResponse.json({ error: 'Legislation not found' }, { status: 404 })
    }

    // Get articles for both with current version text
    const [articlesA, articlesB] = await Promise.all([
      db.article.findMany({
        where: { legislationId: legA.id },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          publishedNumber: true,
          sortOrder: true,
          versions: {
            where: { isCurrent: true },
            select: { textContent: true, effectiveFrom: true, changeType: true },
            take: 1,
          },
        },
      }),
      db.article.findMany({
        where: { legislationId: legB.id },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          publishedNumber: true,
          sortOrder: true,
          versions: {
            where: { isCurrent: true },
            select: { textContent: true, effectiveFrom: true, changeType: true },
            take: 1,
          },
        },
      }),
    ])

    return NextResponse.json({
      a: {
        ...legA,
        subjects: legA.legislationSubjects.map((ls) => ls.subject),
        legislationSubjects: undefined,
        articleCount: legA._count.articles,
        attachmentCount: legA._count.attachments,
        amendmentCount: legA._count.amendmentsFor,
        relationCount: legA._count.relations + legA._count.reverseRelations,
        _count: undefined,
      },
      b: {
        ...legB,
        subjects: legB.legislationSubjects.map((ls) => ls.subject),
        legislationSubjects: undefined,
        articleCount: legB._count.articles,
        attachmentCount: legB._count.attachments,
        amendmentCount: legB._count.amendmentsFor,
        relationCount: legB._count.relations + legB._count.reverseRelations,
        _count: undefined,
      },
      articlesA: articlesA.map((a) => ({
        ...a,
        currentText: a.versions[0]?.textContent || '',
        currentVersion: a.versions[0],
        versions: undefined,
      })),
      articlesB: articlesB.map((a) => ({
        ...a,
        currentText: a.versions[0]?.textContent || '',
        currentVersion: a.versions[0],
        versions: undefined,
      })),
    })
  } catch (e: any) {
    console.error('compare API error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
