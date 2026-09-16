import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const q = searchParams.get('q') || ''
    const where: any = {}
    if (status) where.status = status
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { number: { contains: q } },
      ]
    }
    const items = await db.amendmentDocument.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        targetLegislation: { select: { id: true, slug: true, officialTitle: true, shortTitle: true } },
        sourceLegislation: { select: { id: true, slug: true, officialTitle: true, shortTitle: true } },
        reviewedBy: { select: { username: true, fullName: true } },
        appliedBy: { select: { username: true, fullName: true } },
        _count: { select: { operations: true } },
      },
    })
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
