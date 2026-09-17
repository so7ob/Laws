'use client'

import * as React from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { toast } from 'sonner'
import {
  FileEdit,
  Plus,
  Trash2,
  ChevronLeft,
  ScrollText,
  FileText,
  Paperclip,
  CheckCircle2,
  Send,
  XCircle,
  RefreshCcw,
  CalendarClock,
  History,
  FileX2,
} from 'lucide-react'
import {
  ATTACHMENT_TYPE_LABELS,
  formatDate,
  relativeTime,
} from '@/lib/constants'
import { arNum, EmptyState, ErrorState, SectionHeader } from '../admin-shared'

interface CorrectionArticle {
  id: string
  publishedNumber: number | null
}
interface CorrectionAttachment {
  id: string
  title: string
  attachmentType: string | null
}
interface CorrectionLegislation {
  id: string
  slug: string
  officialTitle: string
  shortTitle: string | null
  year: number | null
  type: { nameAr: string; code: string } | null
}
interface CorrectionItem {
  id: string
  legislationId: string
  targetArticleId: string | null
  attachmentId: string | null
  targetType: string
  currentContent: string | null
  proposedContent: string
  reason: string | null
  effectDate: string | null
  status: string
  createdAt: string
  updatedAt: string
  legislation: CorrectionLegislation
  article: CorrectionArticle | null
  attachment: CorrectionAttachment | null
}

interface CorrectionsResp {
  items: CorrectionItem[]
}

interface LegislationOption {
  id: string
  slug: string
  officialTitle: string
  shortTitle: string | null
  year: number | null
  type: { nameAr: string } | null
}

const STATUS_META: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  draft: {
    label: 'مسودة',
    color: 'text-slate-700 bg-slate-50 border-slate-200',
    dot: 'bg-slate-400',
  },
  approved: {
    label: 'معتمد',
    color: 'text-secondary bg-secondary/10 border-secondary/30',
    dot: 'bg-secondary',
  },
  published: {
    label: 'منشور',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'مرفوض',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    dot: 'bg-rose-500',
  },
}

const TARGET_META: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  preamble: {
    label: 'الديباجة',
    icon: ScrollText,
    color: 'bg-amber-100 text-amber-700',
  },
  article: {
    label: 'مادة',
    icon: FileText,
    color: 'bg-primary/15 text-primary',
  },
  attachment: {
    label: 'ملحق',
    icon: Paperclip,
    color: 'bg-secondary/15 text-secondary',
  },
}

export function CorrectionsSection() {
  const openLegislation = useAppStore((s) => s.openLegislation)
  const [data, setData] = React.useState<CorrectionsResp | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<string>('all')
  const [legislationId, setLegislationId] = React.useState<string>('all')

  // Legislations for filter / picker
  const [legs, setLegs] = React.useState<LegislationOption[]>([])

  // Add dialog state
  const [addOpen, setAddOpen] = React.useState(false)
  const [addSaving, setAddSaving] = React.useState(false)
  const [addLeg, setAddLeg] = React.useState<string>('')
  const [addTarget, setAddTarget] = React.useState<string>('article')
  const [addArticle, setAddArticle] = React.useState<string>('')
  const [addAttachment, setAddAttachment] = React.useState<string>('')
  const [addProposed, setAddProposed] = React.useState('')
  const [addReason, setAddReason] = React.useState('')
  const [addEffectDate, setAddEffectDate] = React.useState('')

  // Article picker data (depends on selected legislation)
  const [articles, setArticles] = React.useState<
    { id: string; publishedNumber: number | null }[]
  >([])
  const [attachments, setAttachments] = React.useState<
    { id: string; title: string; attachmentType: string | null }[]
  >([])
  const [pickerLoading, setPickerLoading] = React.useState(false)

  // Edit dialog
  const [editTarget, setEditTarget] = React.useState<CorrectionItem | null>(null)
  const [editProposed, setEditProposed] = React.useState('')
  const [editReason, setEditReason] = React.useState('')
  const [editSaving, setEditSaving] = React.useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = React.useState<CorrectionItem | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  function loadLegislations() {
    fetch('/api/legislations?pageSize=100')
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setLegs(d.items || [])
      })
      .catch(() => {})
  }

  function loadCorrections() {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    if (legislationId !== 'all') params.set('legislationId', legislationId)
    const url = `/api/admin/corrections${params.toString() ? '?' + params.toString() : ''}`
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل مسودات التصحيح')
        setLoading(false)
      })
  }

  React.useEffect(() => {
    loadLegislations()
  }, [])

  React.useEffect(() => {
    loadCorrections()
  }, [status, legislationId])

  // When add dialog legislation changes, fetch its articles / attachments
  React.useEffect(() => {
    if (!addLeg) {
      setArticles([])
      setAttachments([])
      return
    }
    setPickerLoading(true)
    const leg = legs.find((l) => l.id === addLeg)
    if (!leg) {
      setPickerLoading(false)
      return
    }
    Promise.all([
      fetch(`/api/legislations/${encodeURIComponent(leg.slug)}/versions`).then((r) =>
        r.json(),
      ),
      fetch(`/api/legislations/${encodeURIComponent(leg.slug)}/attachments`).then((r) =>
        r.json(),
      ),
    ])
      .then(([v, a]) => {
        setArticles((v.items || []).map((x: any) => ({
          id: x.id,
          publishedNumber: x.publishedNumber,
        })))
        setAttachments((a.items || []).map((x: any) => ({
          id: x.id,
          title: x.title,
          attachmentType: x.attachmentType,
        })))
        setPickerLoading(false)
      })
      .catch(() => setPickerLoading(false))
  }, [addLeg, legs])

  function resetAddForm() {
    setAddLeg('')
    setAddTarget('article')
    setAddArticle('')
    setAddAttachment('')
    setAddProposed('')
    setAddReason('')
    setAddEffectDate('')
  }

  async function saveCorrection() {
    if (!addLeg) {
      toast.error('اختر التشريع')
      return
    }
    if (!addProposed.trim()) {
      toast.error('المحتوى المقترح مطلوب')
      return
    }
    if (addTarget === 'article' && !addArticle) {
      toast.error('اختر المادة المستهدفة')
      return
    }
    if (addTarget === 'attachment' && !addAttachment) {
      toast.error('اختر الملحق المستهدف')
      return
    }
    setAddSaving(true)
    try {
      const res = await fetch('/api/admin/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legislationId: addLeg,
          targetArticleId: addTarget === 'article' ? addArticle : null,
          attachmentId: addTarget === 'attachment' ? addAttachment : null,
          targetType: addTarget,
          proposedContent: addProposed.trim(),
          reason: addReason.trim() || null,
          effectDate: addEffectDate || null,
        }),
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      toast.success('تم إنشاء مسودة التصحيح', {
        description: legs.find((l) => l.id === addLeg)?.shortTitle || '',
      })
      setAddOpen(false)
      resetAddForm()
      loadCorrections()
    } catch (e: any) {
      toast.error('فشل إنشاء المسودة', { description: e.message })
    } finally {
      setAddSaving(false)
    }
  }

  async function approve(item: CorrectionItem) {
    try {
      const res = await fetch('/api/admin/corrections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, action: 'approve' }),
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      toast.success('تم اعتماد التصحيح')
      loadCorrections()
    } catch (e: any) {
      toast.error('فشل الاعتماد', { description: e.message })
    }
  }

  async function publish(item: CorrectionItem) {
    try {
      const res = await fetch('/api/admin/corrections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, action: 'publish' }),
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      toast.success('تم نشر التصحيح')
      loadCorrections()
    } catch (e: any) {
      toast.error('فشل النشر', { description: e.message })
    }
  }

  async function reject(item: CorrectionItem) {
    try {
      const res = await fetch('/api/admin/corrections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, action: 'reject' }),
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      toast.success('تم رفض التصحيح')
      loadCorrections()
    } catch (e: any) {
      toast.error('فشل الرفض', { description: e.message })
    }
  }

  async function saveEdit() {
    if (!editTarget) return
    if (!editProposed.trim()) {
      toast.error('المحتوى المقترح مطلوب')
      return
    }
    setEditSaving(true)
    try {
      const res = await fetch('/api/admin/corrections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editTarget.id,
          proposedContent: editProposed.trim(),
          reason: editReason.trim() || null,
        }),
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      toast.success('تم تحديث التصحيح')
      setEditTarget(null)
      loadCorrections()
    } catch (e: any) {
      toast.error('فشل التحديث', { description: e.message })
    } finally {
      setEditSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/admin/corrections?id=${encodeURIComponent(deleteTarget.id)}`,
        { method: 'DELETE' },
      )
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      toast.success('تم حذف مسودة التصحيح')
      setDeleteTarget(null)
      loadCorrections()
    } catch (e: any) {
      toast.error('فشل الحذف', { description: e.message })
    } finally {
      setDeleting(false)
    }
  }

  // Stats
  const stats = React.useMemo(() => {
    const all = data?.items || []
    return {
      total: all.length,
      draft: all.filter((i) => i.status === 'draft').length,
      approved: all.filter((i) => i.status === 'approved').length,
      published: all.filter((i) => i.status === 'published').length,
    }
  }, [data])

  return (
    <div className="space-y-4">
      <SectionHeader
        title="مسودات التصحيح"
        description="إدارة تصحيحات المحتوى المنشور بعد النشر"
        action={
          <>
            <Button variant="outline" size="sm" onClick={loadCorrections} disabled={loading}>
              <RefreshCcw className={loading ? 'size-4 animate-spin' : 'size-4'} />
              تحديث
            </Button>
            <Button
              size="sm"
              onClick={() => {
                resetAddForm()
                setAddOpen(true)
              }}
            >
              <Plus className="size-4" />
              مسودة تصحيح جديدة
            </Button>
          </>
        }
      />

      {/* Info Card */}
      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="size-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <FileEdit className="size-5" />
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            توفر مسودة تصحيح للديباجة أو المادة أو الملحق. تُحفظ هوية الأصل
            ونسخته وبصمته ومحتواه السابق والمقترح وسبب التصحيح وتاريخ الأثر. يظل
            المحتوى المنشور معروضًا حتى اعتماد التصحيح ونشره.
          </p>
        </CardContent>
      </Card>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="إجمالي التصحيحات" value={stats.total} icon={ScrollText} color="bg-secondary/10 text-secondary" />
        <StatCard label="مسودة" value={stats.draft} icon={FileEdit} color="bg-slate-100 text-slate-700" />
        <StatCard label="معتمد" value={stats.approved} icon={CheckCircle2} color="bg-secondary/15 text-secondary" />
        <StatCard label="منشور" value={stats.published} icon={Send} color="bg-emerald-100 text-emerald-700" />
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="approved">معتمد</SelectItem>
              <SelectItem value="published">منشور</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
          <Select value={legislationId} onValueChange={setLegislationId}>
            <SelectTrigger className="w-full sm:flex-1">
              <SelectValue placeholder="التشريع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التشريعات</SelectItem>
              {legs.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.shortTitle || l.officialTitle}
                  {l.year ? ` (${arNum(l.year)})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={FileX2}
          title="لا توجد مسودات تصحيح"
          description="لم يتم العثور على تصحيحات مطابقة لعوامل التصفية. ابدأ بإنشاء مسودة تصحيح جديدة."
          action={
            <Button
              size="sm"
              onClick={() => {
                resetAddForm()
                setAddOpen(true)
              }}
            >
              <Plus className="size-4" />
              مسودة تصحيح جديدة
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {data.items.map((item) => (
            <CorrectionCard
              key={item.id}
              item={item}
              onApprove={() => approve(item)}
              onPublish={() => publish(item)}
              onReject={() => reject(item)}
              onEdit={() => {
                setEditTarget(item)
                setEditProposed(item.proposedContent)
                setEditReason(item.reason || '')
              }}
              onDelete={() => setDeleteTarget(item)}
              onOpenLeg={() => openLegislation(item.legislation.slug)}
            />
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>مسودة تصحيح جديدة</DialogTitle>
            <DialogDescription>
              حدّد التشريع والجهة المستهدفة والمحتوى المقترح. سيتم إنشاء المسودة
              بحالة "مسودة" ويمكن اعتمادها ونشرها لاحقًا.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pl-1">
            <div className="space-y-1.5">
              <Label>التشريع *</Label>
              <Select value={addLeg} onValueChange={setAddLeg}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر التشريع" />
                </SelectTrigger>
                <SelectContent>
                  {legs.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.shortTitle || l.officialTitle}
                      {l.year ? ` (${arNum(l.year)})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>نوع الهدف *</Label>
              <Select value={addTarget} onValueChange={setAddTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الهدف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preamble">الديباجة</SelectItem>
                  <SelectItem value="article">مادة</SelectItem>
                  <SelectItem value="attachment">ملحق</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {addTarget === 'article' && (
              <div className="space-y-1.5">
                <Label>المادة *</Label>
                {pickerLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : articles.length === 0 ? (
                  <p className="text-xs text-muted-foreground rounded-md border border-dashed p-3">
                    لا توجد مواد لهذا التشريع.
                  </p>
                ) : (
                  <Select value={addArticle} onValueChange={setAddArticle}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      {articles.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          مادة {a.publishedNumber ? arNum(a.publishedNumber) : '—'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {addTarget === 'attachment' && (
              <div className="space-y-1.5">
                <Label>الملحق *</Label>
                {pickerLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : attachments.length === 0 ? (
                  <p className="text-xs text-muted-foreground rounded-md border border-dashed p-3">
                    لا توجد ملاحق لهذا التشريع.
                  </p>
                ) : (
                  <Select value={addAttachment} onValueChange={setAddAttachment}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الملحق" />
                    </SelectTrigger>
                    <SelectContent>
                      {attachments.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.title}
                          {a.attachmentType
                            ? ` — ${ATTACHMENT_TYPE_LABELS[a.attachmentType] || a.attachmentType}`
                            : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="proposed">المحتوى المقترح *</Label>
              <Textarea
                id="proposed"
                value={addProposed}
                onChange={(e) => setAddProposed(e.target.value)}
                placeholder="النص المصحّح المقترح..."
                rows={5}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">سبب التصحيح</Label>
              <Input
                id="reason"
                value={addReason}
                onChange={(e) => setAddReason(e.target.value)}
                placeholder="مثال: تصحيح خطأ مطبعي في الفقرة الثانية"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="effect-date">تاريخ الأثر</Label>
              <Input
                id="effect-date"
                type="date"
                value={addEffectDate}
                onChange={(e) => setAddEffectDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={addSaving}>
              إلغاء
            </Button>
            <Button onClick={saveCorrection} disabled={addSaving}>
              {addSaving ? 'جارٍ الحفظ...' : 'إنشاء المسودة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>تحرير مسودة التصحيح</DialogTitle>
            <DialogDescription>
              عدّل المحتوى المقترح وسبب التصحيح. لا يمكن تعديل الجهة المستهدفة بعد
              الإنشاء.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-proposed">المحتوى المقترح *</Label>
              <Textarea
                id="edit-proposed"
                value={editProposed}
                onChange={(e) => setEditProposed(e.target.value)}
                rows={5}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-reason">سبب التصحيح</Label>
              <Input
                id="edit-reason"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={editSaving}>
              إلغاء
            </Button>
            <Button onClick={saveEdit} disabled={editSaving || !editProposed.trim()}>
              {editSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف مسودة التصحيح؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف مسودة التصحيح نهائيًا. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleting ? 'جارٍ الحذف...' : 'حذف نهائي'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: any
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-xl font-bold text-secondary tabular-nums">{arNum(value)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function CorrectionCard({
  item,
  onApprove,
  onPublish,
  onReject,
  onEdit,
  onDelete,
  onOpenLeg,
}: {
  item: CorrectionItem
  onApprove: () => void
  onPublish: () => void
  onReject: () => void
  onEdit: () => void
  onDelete: () => void
  onOpenLeg: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const target = TARGET_META[item.targetType] || TARGET_META.article
  const status = STATUS_META[item.status] || STATUS_META.draft
  const TargetIcon = target.icon
  const leg = item.legislation

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
    <Card>
      <CardContent className="p-4">
        {/* Top: badges + legislation */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`gap-1 ${target.color}`}>
              <TargetIcon className="size-3.5" />
              {target.label}
            </Badge>
            <Badge variant="outline" className={`gap-1 ${status.color}`}>
              <span className={`size-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </Badge>
            {item.targetType === 'article' && item.article && (
              <Badge variant="secondary" className="gap-1">
                <FileText className="size-3" />
                مادة {item.article.publishedNumber ? arNum(item.article.publishedNumber) : '—'}
              </Badge>
            )}
            {item.targetType === 'attachment' && item.attachment && (
              <Badge variant="secondary" className="gap-1">
                <Paperclip className="size-3" />
                {item.attachment.title}
                {item.attachment.attachmentType && (
                  <span className="text-[10px] opacity-70">
                    ({ATTACHMENT_TYPE_LABELS[item.attachment.attachmentType] || item.attachment.attachmentType})
                  </span>
                )}
              </Badge>
            )}
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">
              عرض الفرق
              <ChevronLeft className={`size-4 transition-transform ${open ? '-rotate-90' : ''}`} />
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Legislation link */}
        <button
          onClick={onOpenLeg}
          className="block text-right group mb-3"
        >
          <p className="text-sm font-semibold text-secondary group-hover:text-primary transition-colors line-clamp-1">
            {leg.shortTitle || leg.officialTitle}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {leg.officialTitle}
            {leg.year ? ` • ${arNum(leg.year)}` : ''}
            {leg.type?.nameAr ? ` • ${leg.type.nameAr}` : ''}
          </p>
        </button>

        {/* Reason + dates */}
        {item.reason && (
          <div className="rounded-md bg-muted/40 border px-3 py-2 mb-3">
            <p className="text-xs font-semibold text-muted-foreground mb-0.5">سبب التصحيح</p>
            <p className="text-sm">{item.reason}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {item.effectDate && (
            <span className="flex items-center gap-1">
              <CalendarClock className="size-3.5" />
              تاريخ الأثر: <span className="font-medium text-foreground">{formatDate(item.effectDate)}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <History className="size-3.5" />
            أُنشئت: <span className="font-medium text-foreground">{relativeTime(item.createdAt)}</span>
          </span>
          <span>•</span>
          <span>
            آخر تحديث: <span className="font-medium text-foreground">{relativeTime(item.updatedAt)}</span>
          </span>
        </div>

        {/* Collapsible diff */}
        <CollapsibleContent>
            <div className="grid sm:grid-cols-2 gap-3 mt-3 border-t pt-3">
              <div className="rounded-md border border-rose-200 bg-rose-50/50 p-3">
                <p className="text-xs font-semibold text-rose-700 mb-1.5 flex items-center gap-1">
                  <span className="size-2 rounded-full bg-rose-500" />
                  المحتوى الحالي
                </p>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed line-clamp-6">
                  {item.currentContent || '— لا يوجد محتوى حالي مسجّل —'}
                </p>
              </div>
              <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-3">
                <p className="text-xs font-semibold text-emerald-700 mb-1.5 flex items-center gap-1">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  المحتوى المقترح
                </p>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed line-clamp-6">
                  {item.proposedContent}
                </p>
              </div>
            </div>
          </CollapsibleContent>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-3 border-t pt-3">
          {item.status === 'draft' && (
            <>
              <Button size="sm" variant="default" onClick={onApprove}>
                <CheckCircle2 className="size-4" />
                اعتماد
              </Button>
              <Button size="sm" variant="outline" onClick={onEdit}>
                <FileEdit className="size-4" />
                تحرير
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={onDelete}
              >
                <Trash2 className="size-4" />
                حذف
              </Button>
            </>
          )}
          {item.status === 'approved' && (
            <>
              <Button size="sm" variant="default" onClick={onPublish}>
                <Send className="size-4" />
                نشر
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={onReject}
              >
                <XCircle className="size-4" />
                رفض
              </Button>
            </>
          )}
          {(item.status === 'published' || item.status === 'rejected') && (
            <p className="text-xs text-muted-foreground self-center">
              {item.status === 'published'
                ? 'تم نشر هذا التصحيح ولا يمكن تعديله.'
                : 'تم رفض هذا التصحيح.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
    </Collapsible>
  )
}
