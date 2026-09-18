'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2, Save, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface FilterData {
  types: { id: string; code: string; nameAr: string }[]
  authorities: { id: string; code: string; nameAr: string }[]
}

interface CreateLegislationDialogProps {
  onCreated: () => void
}

/**
 * Dialog for creating a new legislation via POST /api/admin/legislations.
 *
 * Fetches the filter list (types + authorities) from /api/filters on open,
 * validates required fields client-side, and shows server-side errors
 * (including 409 duplicate-slug) as actionable messages.
 */
export function CreateLegislationDialog({ onCreated }: CreateLegislationDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [filters, setFilters] = React.useState<FilterData | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form fields
  const [officialTitle, setOfficialTitle] = React.useState('')
  const [shortTitle, setShortTitle] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [typeId, setTypeId] = React.useState('')
  const [authorityId, setAuthorityId] = React.useState('')
  const [number, setNumber] = React.useState('')
  const [year, setYear] = React.useState(String(new Date().getFullYear()))
  const [issueDate, setIssueDate] = React.useState('')
  const [effectiveDate, setEffectiveDate] = React.useState('')
  const [preamble, setPreamble] = React.useState('')

  // Load types + authorities when the dialog opens.
  React.useEffect(() => {
    if (!open) return
    if (filters) return
    fetch('/api/filters')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setFilters({ types: d.types || [], authorities: d.authorities || [] })
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل قوائم الأنواع والجهات')
      })
  }, [open, filters])

  function resetForm() {
    setOfficialTitle('')
    setShortTitle('')
    setSlug('')
    setTypeId('')
    setAuthorityId('')
    setNumber('')
    setYear(String(new Date().getFullYear()))
    setIssueDate('')
    setEffectiveDate('')
    setPreamble('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Client-side validation.
    const fieldErrors: string[] = []
    if (!officialTitle.trim()) fieldErrors.push('العنوان الرسمي مطلوب')
    if (!typeId) fieldErrors.push('نوع التشريع مطلوب')
    if (!authorityId) fieldErrors.push('جهة الإصدار مطلوبة')
    if (!number.trim()) fieldErrors.push('رقم التشريع مطلوب')
    if (fieldErrors.length > 0) {
      setError(fieldErrors.join('، '))
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, any> = {
        officialTitle: officialTitle.trim(),
        shortTitle: shortTitle.trim() || undefined,
        slug: slug.trim() || undefined,
        typeId,
        authorityId,
        number: number.trim(),
        year: year ? parseInt(year, 10) : undefined,
        issueDate: issueDate || undefined,
        effectiveDate: effectiveDate || undefined,
        preamble: preamble.trim() || undefined,
      }
      const res = await fetch('/api/admin/legislations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 409) {
          setError(data.error || 'المعرّف مستخدم مسبقًا')
        } else if (res.status === 400 && data.details) {
          setError(data.details.join('، '))
        } else {
          throw new Error(data.error || `فشل الإنشاء (HTTP ${res.status})`)
        }
        return
      }
      toast.success('تم إنشاء التشريع', {
        description: data.item?.officialTitle || officialTitle,
      })
      resetForm()
      setOpen(false)
      onCreated()
    } catch (e: any) {
      setError(e.message || 'فشل الإنشاء')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          إضافة تشريع جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5" />
            إنشاء تشريع جديد
          </DialogTitle>
          <DialogDescription>
            يُنشأ التشريع بحالة سير العمل «مسودة» وبحالة قانونية «ساري».
            يمكن لاحقًا نقله للمراجعة ثم النشر من تبويب سير العمل.
          </DialogDescription>
        </DialogHeader>

        {!filters ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Official title */}
            <div className="space-y-2">
              <Label htmlFor="leg-official-title">
                العنوان الرسمي <span className="text-destructive">*</span>
              </Label>
              <Input
                id="leg-official-title"
                value={officialTitle}
                onChange={(e) => setOfficialTitle(e.target.value)}
                placeholder="مثال: قانون ضرائب الدخل"
                disabled={saving}
                autoFocus
              />
            </div>

            {/* Short title + slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leg-short-title">العنوان المختصر</Label>
                <Input
                  id="leg-short-title"
                  value={shortTitle}
                  onChange={(e) => setShortTitle(e.target.value)}
                  placeholder="مثال: قانون الضريبة"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leg-slug">المعرّف (URL slug)</Label>
                <Input
                  id="leg-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="يُولّد تلقائيًا إن تُرك فارغًا"
                  disabled={saving}
                  dir="ltr"
                  className="font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  يُستخدم في رابط التشريع. أحرف لاتينية أو عربية مع شرطات.
                </p>
              </div>
            </div>

            {/* Type + authority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leg-type">
                  النوع <span className="text-destructive">*</span>
                </Label>
                <Select value={typeId} onValueChange={setTypeId} disabled={saving}>
                  <SelectTrigger id="leg-type">
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.types.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leg-authority">
                  جهة الإصدار <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={authorityId}
                  onValueChange={setAuthorityId}
                  disabled={saving}
                >
                  <SelectTrigger id="leg-authority">
                    <SelectValue placeholder="اختر الجهة" />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.authorities.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Number + year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leg-number">
                  الرقم <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="leg-number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="مثال: 31"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leg-year">السنة</Label>
                <Input
                  id="leg-year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="مثال: 2024"
                  disabled={saving}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leg-issue-date">تاريخ الإصدار</Label>
                <Input
                  id="leg-issue-date"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  disabled={saving}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Effective date */}
            <div className="space-y-2">
              <Label htmlFor="leg-effective-date">تاريخ النفاذ</Label>
              <Input
                id="leg-effective-date"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                disabled={saving}
                dir="ltr"
              />
            </div>

            {/* Preamble */}
            <div className="space-y-2">
              <Label htmlFor="leg-preamble">الديباجة</Label>
              <Textarea
                id="leg-preamble"
                value={preamble}
                onChange={(e) => setPreamble(e.target.value)}
                placeholder="نص ديباجة التشريع (اختياري)"
                disabled={saving}
                rows={4}
                className="resize-y"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جارٍ الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    حفظ التشريع
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
