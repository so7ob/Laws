import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const where: any = {}
    if (status) where.status = status

    const items = await db.importOperation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, fileType, fileSize } = body
    const item = await db.importOperation.create({
      data: {
        fileName: fileName || 'untitled.txt',
        fileType: fileType || 'txt',
        fileSize: fileSize || 0,
        status: 'uploaded',
        extractionText: body.text || '',
        previewTree: body.preview || '',
        notes: body.notes || '',
      },
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
