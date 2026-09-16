import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const items = await db.navItem.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({
      header: items.filter((i) => i.position === 'header'),
      footer: items.filter((i) => i.position === 'footer'),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
