// Legal status mapping
export const LEGAL_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'نافذ', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  amended: { label: 'معدَّل', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  repealed: { label: 'مُلغى', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  archived: { label: 'مؤرشف', color: 'text-slate-700 bg-slate-100 border-slate-200' },
}

export const WORKFLOW_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'مسودة', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  in_review: { label: 'قيد المراجعة', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  approved: { label: 'معتمد للنشر', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  published: { label: 'منشور', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  archived: { label: 'مؤرشف', color: 'text-slate-600 bg-slate-100 border-slate-200' },
}

export const VERIFICATION_LABELS: Record<string, { label: string; color: string }> = {
  unverified: { label: 'غير مُتحقق', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  imported: { label: 'مستورد', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  reviewed: { label: 'مُراجع', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  verified: { label: 'مُتحقق', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
}

export const AMENDMENT_OPERATION_LABELS: Record<string, string> = {
  replace: 'استبدال',
  add: 'إضافة',
  delete_part: 'حذف جزء',
  repeal: 'إلغاء مادة',
  renumber: 'إعادة ترقيم',
  correct: 'تصحيح',
  substitute_phrase: 'استبدال عبارة',
}

export const RELATION_TYPE_LABELS: Record<string, { fromLabel: string; toLabel: string }> = {
  amends: { fromLabel: 'يُعدِّل', toLabel: 'مُعدَّل بواسطة' },
  repeals: { fromLabel: 'يُلغي', toLabel: 'مُلغى بواسطة' },
  implements: { fromLabel: 'يُنفِّذ', toLabel: 'مُنفَّذ بموجبه' },
  based_on: { fromLabel: 'مستند إلى', toLabel: 'سند لـ' },
  refers_to: { fromLabel: 'يحيل إلى', toLabel: 'محال منه' },
  corrects: { fromLabel: 'يُصحح', toLabel: 'مُصحَّح بواسطة' },
  related_subject: { fromLabel: 'مرتبط موضوعيًا بـ', toLabel: 'مرتبط موضوعيًا بـ' },
}

export const ATTACHMENT_TYPE_LABELS: Record<string, string> = {
  executive_regulation: 'لائحة تنفيذية',
  table: 'جدول',
  form: 'نموذج',
  annex: 'ملحق',
  map: 'خريطة',
  tariff: 'تعرفة',
  list: 'قائمة',
  correction: 'تصحيح',
}

export const CHANGE_TYPE_LABELS: Record<string, string> = {
  initial: 'نص أولي',
  amended: 'مُعدَّل',
  added: 'مُضاف',
  repealed: 'مُلغى',
  renumbered: 'مُعاد ترقيمه',
  corrected: 'مُصحَّح',
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  try {
    return d.toLocaleDateString('ar-EG-u-nu-arab', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return d.toLocaleDateString('ar-EG')
  }
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  try {
    return d.toLocaleDateString('ar-EG-u-nu-arab', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return d.toLocaleDateString('ar-EG')
  }
}

export function relativeTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hour = Math.floor(min / 60)
  const day = Math.floor(hour / 24)
  if (day > 30) return formatDate(d)
  if (day > 0) return `قبل ${day} يومًا`
  if (hour > 0) return `قبل ${hour} ساعة`
  if (min > 0) return `قبل ${min} دقيقة`
  return 'الآن'
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.substring(0, max - 1) + '…'
}

export function highlight(text: string, query: string): { text: string; match: boolean }[] {
  if (!query || query.trim().length < 2) return [{ text, match: false }]
  const parts: { text: string; match: boolean }[] = []
  let idx = 0
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  while (idx < text.length) {
    const found = lowerText.indexOf(lowerQuery, idx)
    if (found < 0) {
      parts.push({ text: text.substring(idx), match: false })
      break
    }
    if (found > idx) parts.push({ text: text.substring(idx, found), match: false })
    parts.push({ text: text.substring(found, found + query.length), match: true })
    idx = found + query.length
  }
  return parts
}
