import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const items = await db.operationPolicy.findMany({
      orderBy: { category: 'asc' },
      include: {
        exceptions: true,
        _count: {
          select: {
            exceptions: true,
            auditLogs: true,
          },
        },
      },
    })
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
