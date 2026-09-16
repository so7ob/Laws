import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const q = searchParams.get('q') || ''
    const status = searchParams.get('status')
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (q) {
      where.OR = [
        { officialTitle: { contains: q } },
        { shortTitle: { contains: q } },
        { slug: { contains: q } },
      ]
    }
    if (status) where.workflowStatus = status

    const [items, total] = await Promise.all([
      db.legislation.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: {
          type: true,
          authority: true,
          _count: {
            select: {
              articles: true,
              attachments: true,
              amendmentsFor: true,
            },
          },
        },
      }),
      db.legislation.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
