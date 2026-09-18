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
import { Plus, Loader2, Save, AlertCircle, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

interface LegislationOption {
  id: string
  slug: string
  officialTitle: string
  shortTitle?: string | null
  year?: number | null
  number?: string | null
}

interface AmendmentOperationInput {
  operationType: string
  targetArticleId?: string
  oldText?: string
  newText?: string
  newArticleNumber?: string
  reason?: string
}

interface CreateAmendmentDialogProps {
  onCreated: () => void
}

const OPERATION_TYPES: { value: string; label: string; hint: string }[] = [
  { value: 'replace', label: 'استبدال', hint: 'استبدال نص مادة كامل' },
  { value: 'add', label: 'إضافة مادة', hint: 'إضافة مادة جديدة' },
  { value: 'delete_part', label: 'حذف جزء', hint: 'حذف فقرة أو جزء من مادة' },
  { value: 'repeal', label: 'إلغاء', hint: 'إلغاء مادة بالكامل' },
  { value: 'renumber', label: 'إعادة ترقيم', hint: 'تغيير رقم مادة' },
  { value: 'correct', label: 'تصحيح', hint: 'تصحيح خطأ مطبعي' },
  { value: 'substitute_phrase', label: 'استبدال عبارة', hint: 'استبدال عبارة عبر المادة' },
]

/**
 * Dialog for creating a new amendment document via POST /api/admin/amendments.
 *
 * Supports adding multiple operations (replace/add/delete/repeal/renumber/
 * correct/substitute_phrase) inline before submitting.
 */
export function CreateAmendmentDialog({ onCreated }: CreateAmendmentDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [legislations, setLegislations] = React.useState<LegislationOption[]>([])
  const [loadingOpts, setLoadingOpts] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Document-level fields
  const [title, setTitle] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [number, setNumber] = React.useState('')
  const [year, setYear] = React.useState(String(new Date().getFullYear()))
  const [targetLegislationId, setTargetLegislationId] = React.useState('')
  const [sourceLegislationId, setSourceLegislationId] = React.useState('')
  const [issueDate, setIssueDate] = React.useState('')
  const [effectiveDate, setEffectiveDate] = React.useState('')
  const [description, setDescription] = React.useState('')

  // Operations array
  const [operations, setOperations] = React.useState<AmendmentOperationInput[]>(
    [{ operationType: 'replace' }]
  )

  // Load legislations for the target/source dropdowns when the dialog opens.
  React.useEffect(() => {
    if (!open) return
    if (legislations.length > 0) return
    setLoadingOpts(true)
    fetch('/api/legislations?pageSize=200')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setLegislations(d.items || [])
      })
      .catch((e) => setError(e.message || 'تعذّر تحميل قائمة التشريعات'))
      .finally(() => setLoadingOpts(false))
  }, [open, legislations.length])

  function resetForm() {
    setTitle('')
    setSlug('')
    setNumber('')
    setYear(String(new Date().getFullYear()))
    setTargetLegislationId('')
    setSourceLegislationId('')
    setIssueDate('')
    setEffectiveDate('')
    setDescription('')
    setOperations([{ operationType: 'replace' }])
    setError(null)
  }

  function updateOperation(idx: number, patch: Partial<AmendmentOperationInput>) {
    setOperations((prev) =>
      prev.map((op, i) => (i === idx ? { ...op, ...patch } : op))
    )
  }

  function addOperation() {
    setOperations((prev) => [...prev, { operationType: 'replace' }])
  }

  function removeOperation(idx: number) {
    setOperations((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const fieldErrors: string[] = []
    if (!title.trim()) fieldErrors.push('عنوان وثيقة التعديل مطلوب')
    if (!targetLegislationId) fieldErrors.push('التشريع الهدف مطلوب')
    // Validate each operation has a type (newText/reason optional but recommended)
    operations.forEach((op, i) => {
      if (!op.operationType) fieldErrors.push(`العملية ${i + 1}: النوع مطلوب`)
    })
    if (fieldErrors.length > 0) {
      setError(fieldErrors.join('، '))
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, any> = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        number: number.trim() || undefined,
        year: year ? parseInt(year, 10) : undefined,
        targetLegislationId,
        sourceLegislationId: sourceLegislationId || undefined,
        issueDate: issueDate || undefined,
        effectiveDate: effectiveDate || undefined,
        description: description.trim() || undefined,
        operations: operations.map((op) => ({
          operationType: op.operationType,
          targetArticleId: op.targetArticleId || undefined,
          oldText: op.oldText || undefined,
          newText: op.newText || undefined,
          newArticleNumber: op.newArticleNumber || undefined,
          reason: op.reason || undefined,
        })),
      }
      const res = await fetch('/api/admin/amendments', {
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
      toast.success('تم إنشاء وثيقة التعديل', {
        description: `${data.item?.title || title} — ${operations.length} عملية`,
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
          وثيقة تعديل جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5" />
            إنشاء وثيقة تعديل جديدة
          </DialogTitle>
          <DialogDescription>
            تُنشأ الوثيقة بحالة «مسودة». العمليات المُضافة تُخزن مرتبة وتطبّق
            لاحقًا بعد المراجعة والاعتماد.
          </DialogDescription>
        </DialogHeader>

        {loadingOpts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title + slug */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="amd-title">
                  العنوان <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amd-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: تعديل بعض مواد قانون العمل"
                  disabled={saving}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amd-slug">المعرّف (URL slug)</Label>
                <Input
                  id="amd-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="يُولّد تلقائيًا"
                  disabled={saving}
                  dir="ltr"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {/* Number + year */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amd-number">الرقم</Label>
                <Input
                  id="amd-number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="مثال: 12"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amd-year">السنة</Label>
                <Input
                  id="amd-year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={saving}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amd-issue-date">تاريخ الإصدار</Label>
                <Input
                  id="amd-issue-date"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  disabled={saving}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amd-effective-date">تاريخ النفاذ</Label>
                <Input
                  id="amd-effective-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  disabled={saving}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Target + source legislations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amd-target">
                  التشريع الهدف <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={targetLegislationId}
                  onValueChange={setTargetLegislationId}
                  disabled={saving}
                >
                  <SelectTrigger id="amd-target">
                    <SelectValue placeholder="اختر التشريع المعدَّل" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {legislations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.shortTitle || l.officialTitle}
                        {l.year ? ` (${l.year})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amd-source">التشريع المصدر (اختياري)</Label>
                <Select
                  value={sourceLegislationId}
                  onValueChange={setSourceLegislationId}
                  disabled={saving}
                >
                  <SelectTrigger id="amd-source">
                    <SelectValue placeholder="تشريع التعديل المُصدِر" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {legislations
                      .filter((l) => l.id !== targetLegislationId)
                      .map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.shortTitle || l.officialTitle}
                          {l.year ? ` (${l.year})` : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="amd-description">الوصف</Label>
              <Textarea
                id="amd-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ملخص أغراض وثيقة التعديل..."
                disabled={saving}
                rows={2}
                className="resize-y"
              />
            </div>

            {/* Operations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  العمليات ({operations.length})
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOperation}
                  disabled={saving}
                >
                  <Plus className="size-4" />
                  إضافة عملية
                </Button>
              </div>
              <div className="space-y-3">
                {operations.map((op, idx) => {
                  const opTypeMeta =
                    OPERATION_TYPES.find((t) => t.value === op.operationType) ||
                    OPERATION_TYPES[0]
                  return (
                    <div
                      key={idx}
                      className="rounded-lg border bg-muted/20 p-3 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground shrink-0">
                          {idx + 1}
                        </span>
                        <Select
                          value={op.operationType}
                          onValueChange={(v) =>
                            updateOperation(idx, { operationType: v })
                          }
                          disabled={saving}
                        >
                          <SelectTrigger className="h-8 text-sm flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATION_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label} — {t.hint}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {operations.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0"
                            onClick={() => removeOperation(idx)}
                            disabled={saving}
                            aria-label={`حذف العملية ${idx + 1}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">رقم المادة الجديدة</Label>
                          <Input
                            value={op.newArticleNumber || ''}
                            onChange={(e) =>
                              updateOperation(idx, {
                                newArticleNumber: e.target.value,
                              })
                            }
                            placeholder="مثال: 45"
                            disabled={saving}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">السبب</Label>
                          <Input
                            value={op.reason || ''}
                            onChange={(e) =>
                              updateOperation(idx, {
                                reason: e.target.value,
                              })
                            }
                            placeholder="سبب التعديل"
                            disabled={saving}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      {['replace', 'substitute_phrase', 'correct'].includes(
                        op.operationType
                      ) && (
                        <div className="space-y-1">
                          <Label className="text-xs">النص القديم</Label>
                          <Textarea
                            value={op.oldText || ''}
                            onChange={(e) =>
                              updateOperation(idx, { oldText: e.target.value })
                            }
                            placeholder="النص المُستبدَل"
                            disabled={saving}
                            rows={2}
                            className="text-sm resize-y"
                          />
                        </div>
                      )}
                      <div className="space-y-1">
                        <Label className="text-xs">النص الجديد</Label>
                        <Textarea
                          value={op.newText || ''}
                          onChange={(e) =>
                            updateOperation(idx, { newText: e.target.value })
                          }
                          placeholder="نص المادة بعد التعديل"
                          disabled={saving}
                          rows={2}
                          className="text-sm resize-y"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
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
                <X className="size-4" />
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
                    حفظ الوثيقة
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
