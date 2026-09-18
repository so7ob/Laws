import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/legislations/[slug]/attachments/[attachmentId]/download
 *
 * Yields a real downloadable file for an attachment, regardless of whether
 * a real FileAsset is stored. In the sandbox environment we have no
 * persistent object storage, so the endpoint synthesises the file body
 * from the attachment's own data:
 *
 *  - contentType "text"  -> plain/text .txt (UTF-8)
 *  - contentType "table" -> text/csv .csv (with UTF-8 BOM for Arabic Excel)
 *  - contentType "file" with fileId -> served via FileAsset (future hook)
 *  - contentType "file" without fileId -> descriptive .txt document
 *
 * The route sets proper Content-Type / Content-Disposition headers so
 * browsers trigger a real download with an Arabic-friendly filename.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; attachmentId: string }> }
) {
  try {
    const { slug, attachmentId } = await params

    const leg = await db.legislation.findUnique({
      where: { slug },
      select: {
        id: true,
        officialTitle: true,
        number: true,
        year: true,
      },
    })
    if (!leg) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const att = await db.attachment.findFirst({
      where: {
        id: attachmentId,
        legislationId: leg.id,
        status: { in: ['published', 'in_review'] },
      },
      include: {
        file: true,
      },
    })
    if (!att) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }

    // Sanitise the attachment title into a safe filename (Arabic retained).
    const safeTitle = (att.title || 'attachment')
      .replace(/[\\/:*?"<>|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // ---------- Build the file body + extension + mime ----------
    let body: string
    let ext: string
    let mime: string

    if (att.contentType === 'table') {
      ext = 'csv'
      mime = 'text/csv;charset=utf-8'
      body = tableToCsv(att.tableContent)
    } else if (att.contentType === 'text' && att.textContent) {
      ext = 'txt'
      mime = 'text/plain;charset=utf-8'
      body = att.textContent
    } else if (att.contentType === 'file' && att.fileId && att.file) {
      // Future: stream the real FileAsset bytes. The sandbox seed has no
      // binary storage, so we fall through to a descriptive document.
      ext = 'txt'
      mime = 'text/plain;charset=utf-8'
      body = descriptiveDocument(att, leg)
    } else {
      // "file" without stored bytes, or text without textContent:
      // synthesise a descriptive document so the download always works.
      ext = 'txt'
      mime = 'text/plain;charset=utf-8'
      body = att.textContent?.trim()
        ? att.textContent
        : descriptiveDocument(att, leg)
    }

    // Prepend UTF-8 BOM for CSV so Excel detects Arabic correctly.
    const bom = ext === 'csv' ? '\uFEFF' : ''
    const buf = Buffer.from(bom + body, 'utf-8')

    const filename = `${safeTitle}.${ext}`
    // Use RFC 5987 encoding for the Arabic filename so it survives proxies.
    const encodedFilename = encodeURIComponent(filename)
    const disposition = `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Disposition': disposition,
        'Content-Length': String(buf.byteLength),
        'Cache-Control': 'private, no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

/**
 * Convert a stored table (JSON {"columns":[], "rows":[[]]}) to CSV.
 * Quotes fields that contain commas, quotes, or newlines (RFC 4180).
 */
function tableToCsv(raw: string | null | undefined): string {
  if (!raw) return ''
  let table: { columns: string[]; rows: string[][] }
  try {
    table = JSON.parse(raw)
  } catch {
    return ''
  }
  if (!table.columns || !table.rows) return ''

  const esc = (v: string) => {
    const s = String(v ?? '')
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const lines = [table.columns.map(esc).join(',')]
  for (const row of table.rows) {
    lines.push(row.map(esc).join(','))
  }
  return lines.join('\r\n')
}

/**
 * Build a descriptive plain-text document for file-type attachments that
 * have no stored binary. This guarantees the download button always yields
 * a meaningful file rather than a 404.
 */
function descriptiveDocument(
  att: {
    title: string
    attachmentType: string
    contentType: string
    version: number | null
    effectiveFrom: Date | null
    updatedAt: Date | null
    textContent: string | null
  },
  leg: { officialTitle: string; number: string | null; year: number | null }
): string {
  const lines: string[] = []
  lines.push('بسم الله الرحمن الرحيم')
  lines.push('')
  lines.push('منصة التشريعات اليمنية — مستند مرفق')
  lines.push('======================================')
  lines.push('')
  lines.push(`عنوان المرفق: ${att.title}`)
  lines.push(`التشريع المرتبط: ${leg.officialTitle}`)
  if (leg.number) lines.push(`رقم التشريع: ${leg.number}`)
  if (leg.year) lines.push(`سنة التشريع: ${leg.year}`)
  lines.push(`نوع المرفق: ${att.attachmentType}`)
  lines.push(`صيغة المحتوى: ${att.contentType}`)
  if (att.version) lines.push(`الإصدار: ${att.version}`)
  if (att.effectiveFrom)
    lines.push(`نافذ من: ${att.effectiveFrom.toISOString().slice(0, 10)}`)
  if (att.updatedAt)
    lines.push(`آخر تحديث: ${att.updatedAt.toISOString().slice(0, 10)}`)
  lines.push('')
  if (att.textContent && att.textContent.trim()) {
    lines.push('--- المحتوى ---')
    lines.push(att.textContent.trim())
  } else {
    lines.push('--- ملاحظة ---')
    lines.push(
      'هذا المرفق مسجل كملف رقمي. في بيئة الإنتاج يُخدم الملف الأصلي من مخزن الملفات (FileAsset).'
    )
    lines.push('هذا المستند وثيقة مرجعية تثبت وجود المرفق وبياناته.')
  }
  lines.push('')
  lines.push('---')
  lines.push('منصة التشريعات اليمنية — بيانات تجريبية')
  return lines.join('\n')
}
