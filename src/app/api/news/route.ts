import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    if (slug) {
      const item = await db.newsArticle.findUnique({ where: { slug } })
      if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json({ item })
    }
    const items = await db.newsArticle.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    })
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
