import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [types, authorities, subjects, classifications] = await Promise.all([
      db.legislationType.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
      }),
      db.issuingAuthority.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
      }),
      db.subject.findMany({
        where: { parentSubjectId: null },
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      db.classification.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ])

    return NextResponse.json({
      types,
      authorities,
      subjects,
      classifications,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
