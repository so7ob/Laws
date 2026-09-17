import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const legislationId = searchParams.get('legislationId')

    const where: any = {}
    if (status) where.status = status
    if (legislationId) where.legislationId = legislationId

    const items = await db.correctionDraft.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        legislation: {
          select: {
            id: true,
            slug: true,
            officialTitle: true,
            shortTitle: true,
            year: true,
            type: { select: { nameAr: true, code: true } },
          },
        },
        article: {
          select: { id: true, publishedNumber: true },
        },
        attachment: {
          select: { id: true, title: true, attachmentType: true },
        },
      },
    })

    return NextResponse.json({ items })
  } catch (e: any) {
    console.error('corrections GET error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item = await db.correctionDraft.create({
      data: {
        legislationId: body.legislationId,
        targetArticleId: body.targetArticleId || null,
        attachmentId: body.attachmentId || null,
        targetType: body.targetType || 'article',
        currentContent: body.currentContent || null,
        proposedContent: body.proposedContent,
        reason: body.reason || null,
        effectDate: body.effectDate ? new Date(body.effectDate) : null,
        status: 'draft',
      },
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (e: any) {
    console.error('corrections POST error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, proposedContent, reason, status } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const update: any = {}
    if (proposedContent !== undefined) update.proposedContent = proposedContent
    if (reason !== undefined) update.reason = reason
    if (status) update.status = status

    if (action === 'approve') {
      update.status = 'approved'
    } else if (action === 'publish') {
      update.status = 'published'
    } else if (action === 'reject') {
      update.status = 'rejected'
    }

    const item = await db.correctionDraft.update({
      where: { id },
      data: update,
    })
    return NextResponse.json({ item })
  } catch (e: any) {
    console.error('corrections PUT error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await db.correctionDraft.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
