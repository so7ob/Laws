import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Demo user ID (in production, this would come from the session)
const DEMO_USER_ID = 'cmu4ol5dk0000wkrij9pfbhq2'

export async function GET() {
  try {
    // Find the demo "reader" user
    const user = await db.user.findUnique({ where: { username: 'reader' } })
    if (!user) return NextResponse.json({ items: [] })

    const items = await db.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        legislation: {
          include: {
            type: true,
            authority: true,
          },
        },
        article: {
          select: { id: true, publishedNumber: true, legislationId: true },
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

    const existing = await db.favorite.findFirst({
      where: {
        userId: user.id,
        legislationId: body.legislationId,
        articleId: body.articleId || null,
      },
    })
    if (existing) {
      return NextResponse.json({ item: existing, alreadyExists: true })
    }

    const item = await db.favorite.create({
      data: {
        userId: user.id,
        legislationId: body.legislationId || null,
        articleId: body.articleId || null,
        label: body.label || null,
      },
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await db.favorite.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
