import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const items = await db.role.findMany({
      orderBy: { powerLevel: 'asc' },
      include: {
        _count: {
          select: {
            users: true,
            permissions: true,
          },
        },
      },
    })
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
