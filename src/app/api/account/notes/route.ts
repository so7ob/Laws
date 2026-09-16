import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const user = await db.user.findUnique({ where: { username: 'reader' } })
    if (!user) return NextResponse.json({ items: [] })

    const items = await db.note.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        legislation: {
          select: {
            id: true,
            slug: true,
            officialTitle: true,
            shortTitle: true,
            year: true,
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

    const item = await db.note.create({
      data: {
        userId: user.id,
        legislationId: body.legislationId || null,
        articleId: body.articleId || null,
        content: body.content,
        contextDate: body.contextDate ? new Date(body.contextDate) : null,
      },
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, content } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const item = await db.note.update({
      where: { id },
      data: { content },
    })
    return NextResponse.json({ item })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await db.note.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
