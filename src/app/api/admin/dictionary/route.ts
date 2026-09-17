import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get the latest published dictionary with its entries
    const dict = await db.searchDictionary.findFirst({
      where: { status: 'published' },
      orderBy: { version: 'desc' },
      include: {
        entries: {
          orderBy: { canonical: 'asc' },
        },
      },
    })

    const draftDict = await db.searchDictionary.findFirst({
      where: { status: 'draft' },
      orderBy: { version: 'desc' },
      include: {
        entries: {
          orderBy: { canonical: 'asc' },
        },
      },
    })

    const allVersions = await db.searchDictionary.findMany({
      orderBy: { version: 'desc' },
      include: {
        _count: { select: { entries: true } },
      },
    })

    return NextResponse.json({
      published: dict,
      draft: draftDict,
      versions: allVersions,
    })
  } catch (e: any) {
    console.error('dictionary GET error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create_draft') {
      // Create a new draft version based on the latest published
      const latest = await db.searchDictionary.findFirst({
        where: { status: 'published' },
        orderBy: { version: 'desc' },
        include: { entries: true },
      })

      const newVersion = (latest?.version || 0) + 1
      const draft = await db.searchDictionary.create({
        data: {
          version: newVersion,
          status: 'draft',
        },
      })

      // Copy entries from published to the new draft
      if (latest?.entries?.length) {
        for (const entry of latest.entries) {
          await db.searchDictionaryEntry.create({
            data: {
              dictionaryId: draft.id,
              canonical: entry.canonical,
              synonym: entry.synonym,
              isActive: entry.isActive,
            },
          })
        }
      }

      return NextResponse.json({ item: draft }, { status: 201 })
    }

    if (action === 'add_entry') {
      let draft = await db.searchDictionary.findFirst({
        where: { status: 'draft' },
        orderBy: { version: 'desc' },
      })

      if (!draft) {
        // Create a draft from latest published
        const latest = await db.searchDictionary.findFirst({
          where: { status: 'published' },
          orderBy: { version: 'desc' },
          include: { entries: true },
        })
        const newVersion = (latest?.version || 0) + 1
        draft = await db.searchDictionary.create({
          data: { version: newVersion, status: 'draft' },
        })
        if (latest?.entries?.length) {
          for (const entry of latest.entries) {
            await db.searchDictionaryEntry.create({
              data: {
                dictionaryId: draft.id,
                canonical: entry.canonical,
                synonym: entry.synonym,
                isActive: entry.isActive,
              },
            })
          }
        }
      }

      const entry = await db.searchDictionaryEntry.create({
        data: {
          dictionaryId: draft.id,
          canonical: body.canonical,
          synonym: body.synonym,
          isActive: body.isActive !== false,
        },
      })

      return NextResponse.json({ item: entry }, { status: 201 })
    }

    if (action === 'publish') {
      const draftId = body.draftId
      if (!draftId) return NextResponse.json({ error: 'draftId required' }, { status: 400 })

      // Close currently published
      const currentPublished = await db.searchDictionary.findMany({
        where: { status: 'published' },
      })
      for (const p of currentPublished) {
        await db.searchDictionary.update({
          where: { id: p.id },
          data: { status: 'archived' },
        })
      }

      // Publish the draft
      const published = await db.searchDictionary.update({
        where: { id: draftId },
        data: { status: 'published' },
      })

      return NextResponse.json({ item: published })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    console.error('dictionary POST error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { entryId, canonical, synonym, isActive } = body
    if (!entryId) return NextResponse.json({ error: 'entryId required' }, { status: 400 })

    const item = await db.searchDictionaryEntry.update({
      where: { id: entryId },
      data: {
        ...(canonical !== undefined && { canonical }),
        ...(synonym !== undefined && { synonym }),
        ...(isActive !== undefined && { isActive }),
      },
    })
    return NextResponse.json({ item })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('entryId')
    if (!entryId) return NextResponse.json({ error: 'entryId required' }, { status: 400 })

    await db.searchDictionaryEntry.delete({ where: { id: entryId } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
