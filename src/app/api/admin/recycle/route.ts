import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const items = await db.deletionBatch.findMany({
      where: { status: 'soft_deleted' },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        _count: true,
      },
    })
    const expiredCount = items.filter(
      (b) => b.expiresAt && new Date(b.expiresAt) < new Date()
    ).length
    return NextResponse.json({ items, expiredCount })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
