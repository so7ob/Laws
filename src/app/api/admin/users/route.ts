import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const where: any = {}
    if (q) {
      where.OR = [
        { username: { contains: q } },
        { email: { contains: q } },
        { fullName: { contains: q } },
      ]
    }
    const items = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        _count: {
          select: {
            auditLogs: true,
            favorites: true,
          },
        },
      },
    })
    return NextResponse.json({
      items: items.map((u) => ({
        ...u,
        passwordHash: undefined,
        roles: u.roles.map((r) => r.role),
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
