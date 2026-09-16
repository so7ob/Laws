import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const where: any = {}
    if (status) where.status = status
    if (severity) where.severity = severity

    const items = await db.report.findMany({
      where,
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      include: {
        legislation: {
          select: { id: true, slug: true, officialTitle: true },
        },
      },
    })
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
