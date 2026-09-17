import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateTrackingNumber } from '@/lib/auth'

export async function GET() {
  try {
    const user = await db.user.findUnique({ where: { username: 'reader' } })
    if (!user) return NextResponse.json({ items: [] })

    // Use participations with type 'feedback' as feedback
    const items = await db.participation.findMany({
      where: {
        userId: user.id,
        participationType: 'feedback',
      },
      orderBy: { createdAt: 'desc' },
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
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const user = await db.user.findUnique({ where: { username: 'reader' } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // body: { legislationId, rating (up/down), content? }
    const rating = body.rating // 'up' or 'down'
    const content = body.content || (rating === 'up' ? 'تقييم إيجابي' : 'تقييم سلبي')

    const item = await db.participation.create({
      data: {
        userId: user.id,
        legislationId: body.legislationId,
        participationType: 'feedback',
        content: `${rating === 'up' ? '👍' : '👎'} ${content}`,
        trackingNumber: generateTrackingNumber(),
        status: 'received',
        isPublic: false,
      },
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
