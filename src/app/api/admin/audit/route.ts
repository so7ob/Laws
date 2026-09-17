import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const resource = searchParams.get('resource')
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (resource) where.resource = resource
    if (action) where.action = action
    if (userId) where.userId = userId

    const [items, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, fullName: true } },
        },
      }),
      db.auditLog.count({ where }),
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
