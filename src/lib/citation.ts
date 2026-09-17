/**
 * Generate formatted legal citations for Yemeni legislation.
 */

export interface CitationData {
  officialTitle: string
  type?: { nameAr: string; code: string } | null
  number?: string | null
  year?: number | null
  authority?: { nameAr: string; code: string } | null
  issueDate?: string | null
  publicationDate?: string | null
  effectiveDate?: string | null
  officialJournal?: {
    journalNumber?: string | null
    issueNumber?: string | null
    pageFrom?: number | null
    publicationDate?: string | null
  } | null
}

export function generateCitation(data: CitationData, format: 'simple' | 'full' | 'academic' = 'full'): string {
  const parts: string[] = []

  if (format === 'simple') {
    // Simple: "قانون العمل رقم (5) لسنة 1995"
    parts.push(data.type?.nameAr || 'قانون')
    parts.push(data.officialTitle)
    if (data.number) parts.push(`رقم (${data.number})`)
    if (data.year) parts.push(`لسنة ${data.year.toLocaleString('ar-EG')}`)
    return parts.join(' ')
  }

  if (format === 'academic') {
    // Academic: "قانون العمل رقم (5) لسنة 1995، الصادر عن مجلس النواب، الجريدة الرسمية عدد كذا"
    parts.push(data.type?.nameAr || 'قانون')
    parts.push(data.officialTitle)
    if (data.number) parts.push(`رقم (${data.number})`)
    if (data.year) parts.push(`لسنة ${data.year.toLocaleString('ar-EG')}`)
    if (data.authority?.nameAr) parts.push(`الصادر عن ${data.authority.nameAr}`)
    if (data.publicationDate) {
      const d = new Date(data.publicationDate)
      parts.push(`المنشور في ${d.toLocaleDateString('ar-EG-u-nu-arab', { year: 'numeric', month: 'long', day: 'numeric' })}`)
    }
    if (data.officialJournal?.journalNumber) {
      parts.push(`الجريدة الرسمية عدد ${data.officialJournal.journalNumber}`)
    }
    return parts.join('، ')
  }

  // Full: includes all details
  parts.push(data.type?.nameAr || 'قانون')
  parts.push(data.officialTitle)
  if (data.number) parts.push(`رقم (${data.number})`)
  if (data.year) parts.push(`لسنة ${data.year.toLocaleString('ar-EG')}`)
  if (data.authority?.nameAr) parts.push(`— الصادر عن ${data.authority.nameAr}`)
  if (data.issueDate) {
    const d = new Date(data.issueDate)
    parts.push(`صدر بتاريخ ${d.toLocaleDateString('ar-EG-u-nu-arab', { year: 'numeric', month: 'long', day: 'numeric' })}`)
  }
  if (data.effectiveDate) {
    const d = new Date(data.effectiveDate)
    parts.push(`نافذ اعتبارًا من ${d.toLocaleDateString('ar-EG-u-nu-arab', { year: 'numeric', month: 'long', day: 'numeric' })}`)
  }
  if (data.officialJournal?.journalNumber) {
    let journal = `الجريدة الرسمية عدد ${data.officialJournal.journalNumber}`
    if (data.officialJournal.issueNumber) journal += `، إصدار ${data.officialJournal.issueNumber}`
    if (data.officialJournal.pageFrom) journal += `، صفحة ${data.officialJournal.pageFrom.toLocaleString('ar-EG')}`
    parts.push(journal)
  }
  return parts.join(' ')
}

export const CITATION_FORMATS = [
  { id: 'simple', label: 'مختصر', desc: 'صيغة قصيرة مع الاسم والرقم والسنة' },
  { id: 'full', label: 'كامل', desc: 'صيغة تفصيلية مع كل البيانات' },
  { id: 'academic', label: 'أكاديمي', desc: 'صيغة مرجعية للبحوث والأوراق العلمية' },
] as const
