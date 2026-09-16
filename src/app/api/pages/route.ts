import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    if (slug) {
      const page = await db.publicPage.findUnique({
        where: { slug },
        include: {
          sections: { orderBy: { sortOrder: 'asc' } },
        },
      })
      if (!page || page.status !== 'published')
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json({ item: page })
    }
    const items = await db.publicPage.findMany({
      where: { status: 'published' },
      orderBy: { updatedAt: 'desc' },
      include: { sections: { orderBy: { sortOrder: 'asc' } } },
    })
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
