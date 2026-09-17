import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const user = await db.user.findUnique({ where: { username: 'reader' } })
    if (!user) return NextResponse.json({ items: [] })

    const items = await db.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
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

    const item = await db.savedSearch.create({
      data: {
        userId: user.id,
        legislationId: body.legislationId || null,
        name: body.name,
        query: body.query || '',
        filters: body.filters ? JSON.stringify(body.filters) : null,
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

    await db.savedSearch.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
