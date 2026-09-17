import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateTrackingNumber } from '@/lib/auth'

export async function GET() {
  try {
    const user = await db.user.findUnique({ where: { username: 'reader' } })
    if (!user) return NextResponse.json({ items: [] })

    const items = await db.participation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        legislation: {
          select: {
            id: true,
            slug: true,
            officialTitle: true,
            shortTitle: true,
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

    const item = await db.participation.create({
      data: {
        userId: user.id,
        legislationId: body.legislationId || null,
        participationType: body.participationType || 'comment',
        content: body.content,
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
