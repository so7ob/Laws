import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const leg = await db.legislation.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!leg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const attachments = await db.attachment.findMany({
      where: {
        legislationId: leg.id,
        status: { in: ['published'] },
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        file: true,
        versions: {
          orderBy: { versionNo: 'desc' },
        },
      },
    })

    return NextResponse.json({ items: attachments })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
