import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const items = await db.platformSetting.findMany()
    const settings: Record<string, any> = {}
    for (const s of items) {
      let v: any = s.value
      if (s.type === 'number') v = parseInt(s.value)
      else if (s.type === 'boolean') v = s.value === 'true'
      else if (s.type === 'json') {
        try {
          v = JSON.parse(s.value)
        } catch {}
      }
      settings[s.key] = v
    }
    return NextResponse.json(settings)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
