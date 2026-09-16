import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const items = await db.platformSetting.findMany({
      orderBy: { category: 'asc' },
    })
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { key, value } = body
    if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 })
    const item = await db.platformSetting.upsert({
      where: { key },
      update: { value: String(value), type: body.type || 'string' },
      create: {
        key,
        value: String(value),
        type: body.type || 'string',
        category: body.category || 'general',
      },
    })
    return NextResponse.json({ item })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
