'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { toast } from 'sonner'
import {
  BookOpenText,
  Plus,
  Pencil,
  Trash2,
  Search,
  Sparkles,
  GitBranch,
  History,
  Send,
  RefreshCcw,
  FilePlus2,
} from 'lucide-react'
import { arNum, EmptyState, ErrorState, SectionHeader } from '../admin-shared'

interface DictEntry {
  id: string
  canonical: string
  synonym: string
  isActive: boolean
}

interface DictVersion {
  id: string
  version: number
  status: string
  entries?: DictEntry[]
  _count?: { entries: number }
}

interface DictResp {
  published: DictVersion | null
  draft: DictVersion | null
  versions: DictVersion[]
}

const STATUS_META: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  draft: {
    label: 'مسودة',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
  },
  published: {
    label: 'منشور',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  archived: {
    label: 'مؤرشف',
    color: 'text-slate-600 bg-slate-100 border-slate-200',
    dot: 'bg-slate-400',
  },
}

export function DictionarySection() {
  const [data, setData] = React.useState<DictResp | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [q, setQ] = React.useState('')

  // Dialog state for add / edit
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingEntry, setEditingEntry] = React.useState<DictEntry | null>(null)
  const [canonical, setCanonical] = React.useState('')
  const [synonym, setSynonym] = React.useState('')
  const [isActive, setIsActive] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  // Publish confirmation
  const [publishOpen, setPublishOpen] = React.useState(false)
  const [publishing, setPublishing] = React.useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = React.useState<DictEntry | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  function load() {
    setLoading(true)
    setError(null)
    fetch('/api/admin/dictionary')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل القاموس')
        setLoading(false)
      })
  }

  React.useEffect(() => {
    load()
  }, [])

  function openAdd() {
    setEditingEntry(null)
    setCanonical('')
    setSynonym('')
    setIsActive(true)
    setDialogOpen(true)
  }

  function openEdit(entry: DictEntry) {
    setEditingEntry(entry)
    setCanonical(entry.canonical)
    setSynonym(entry.synonym)
    setIsActive(entry.isActive)
    setDialogOpen(true)
  }

  async function saveEntry() {
    if (!canonical.trim() || !synonym.trim()) {
      toast.error('المرادف والمصطلح القانوني مطلوبان')
      return
    }
    setSaving(true)
    try {
      if (editingEntry) {
        // Edit existing entry (only allowed on draft entries)
        const res = await fetch('/api/admin/dictionary', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entryId: editingEntry.id,
            canonical: canonical.trim(),
            synonym: synonym.trim(),
            isActive,
          }),
        })
        const d = await res.json()
        if (d.error) throw new Error(d.error)
        toast.success('تم تحديث المرادف', { description: `${canonical.trim()} → ${synonym.trim()}` })
      } else {
        const res = await fetch('/api/admin/dictionary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add_entry',
            canonical: canonical.trim(),
            synonym: synonym.trim(),
            isActive,
          }),
        })
        const d = await res.json()
        if (d.error) throw new Error(d.error)
        toast.success('تمت إضافة المرادف', { description: `${canonical.trim()} → ${synonym.trim()}` })
      }
      setDialogOpen(false)
      load()
    } catch (e: any) {
      toast.error('فشل الحفظ', { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(entry: DictEntry, checked: boolean) {
    // Optimistic
    setData((prev) => {
      if (!prev || !prev.draft) return prev
      return {
        ...prev,
        draft: {
          ...prev.draft,
          entries: (prev.draft.entries || []).map((e) =>
            e.id === entry.id ? { ...e, isActive: checked } : e,
          ),
        },
      }
    })
    try {
      const res = await fetch('/api/admin/dictionary', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: entry.id, isActive: checked }),
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      toast.success(checked ? 'تم تفعيل المرادف' : 'تم تعطيل المرادف', {
        description: entry.canonical,
      })
    } catch (e: any) {
      toast.error('فشل التحديث', { description: e.message })
      load()
    }
  }

  async function createDraft() {
    try {
      const res = await fetch('/api/admin/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_draft' }),
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      toast.success('تم إنشاء مسودة جديدة', {
        description: `الإصدار ${arNum(d.item?.version || 1)}`,
      })
      load()
    } catch (e: any) {
      toast.error('فشل إنشاء المسودة', { description: e.message })
    }
  }

  async function publishDraft() {
    if (!data?.draft) return
    setPublishing(true)
    try {
      const res = await fetch('/api/admin/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', draftId: data.draft.id }),
      })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      toast.success('تم نشر القاموس', {
        description: `الإصدار ${arNum(d.item?.version || 1)} منشور الآن`,
      })
      setPublishOpen(false)
      load()
    } catch (e: any) {
      toast.error('فشل النشر', { description: e.message })
    } finally {
      setPublishing(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/admin/dictionary?entryId=${encodeURIComponent(deleteTarget.id)}`,
        { method: 'DELETE' },
      )
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      toast.success('تم حذف المرادف', { description: deleteTarget.canonical })
      setDeleteTarget(null)
      load()
    } catch (e: any) {
      toast.error('فشل الحذف', { description: e.message })
    } finally {
      setDeleting(false)
    }
  }

  // Filter entries
  const filteredEntries = React.useMemo(() => {
    if (!data) return []
    const src = data.draft?.entries || data.published?.entries || []
    if (!q.trim()) return src
    const qq = q.trim().toLowerCase()
    return src.filter(
      (e) =>
        e.canonical.toLowerCase().includes(qq) ||
        e.synonym.toLowerCase().includes(qq),
    )
  }, [data, q])

  return (
    <div className="space-y-4">
      <SectionHeader
        title="قاموس المرادفات القانونية"
        description="إدارة قاموس المرادفات لتحسين نتائج البحث"
        action={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCcw className={loading ? 'size-4 animate-spin' : 'size-4'} />
            تحديث
          </Button>
        }
      />

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpenText className="size-5" />
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            يُحفظ القاموس بإصدارات. التعديل على القاموس المنشور ينشئ مسودة إصدار
            جديد. يمكن تحرير المسودة وإضافة العناصر وحذفها وتعطيلها وتفعيلها.
            تعديل قاموس منشور ينشئ مسودة إصدار جديد، ولا يمحو تاريخ القاموس.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || (!data.published && !data.draft) ? (
        <EmptyState
          icon={BookOpenText}
          title="لا يوجد قاموس بعد"
          description="ابدأ بإنشاء قاموس المرادفات الأول. سيُنشأ كمسودة يمكنك تحريرها ونشرها."
          action={
            <Button onClick={createDraft}>
              <Plus className="size-4" />
              إنشاء قاموس جديد
            </Button>
          }
        />
      ) : (
        <>
          {/* Versions panel */}
          {data.versions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-secondary flex items-center gap-2">
                  <History className="size-4" />
                  الإصدارات
                  <Badge variant="secondary" className="text-[10px]">
                    {arNum(data.versions.length)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                  {data.versions.map((v) => {
                    const meta = STATUS_META[v.status] || STATUS_META.archived
                    const isPublished = v.id === data.published?.id
                    const isDraft = v.id === data.draft?.id
                    const count = v._count?.entries ?? v.entries?.length ?? 0
                    return (
                      <div
                        key={v.id}
                        className={`shrink-0 rounded-lg border p-3 min-w-[170px] transition-all ${
                          isPublished
                            ? 'border-emerald-300 bg-emerald-50/50 shadow-sm'
                            : isDraft
                            ? 'border-amber-300 bg-amber-50/50 shadow-sm'
                            : 'border-border bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-sm text-secondary">
                            الإصدار {arNum(v.version)}
                          </span>
                          <Badge variant="outline" className={`text-[10px] gap-1 ${meta.color}`}>
                            <span className={`size-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {arNum(count)} مرادف
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Draft editor OR Published view */}
          {data.draft ? (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-base font-bold text-secondary flex items-center gap-2">
                    <GitBranch className="size-4 text-amber-600" />
                    المسودة الحالية
                    <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
                      الإصدار {arNum(data.draft.version)}
                    </Badge>
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={openAdd}>
                      <Plus className="size-4" />
                      إضافة مرادف
                    </Button>
                    <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
                      <Button
                        size="sm"
                        onClick={() => setPublishOpen(true)}
                        disabled={publishing}
                      >
                        <Send className="size-4" />
                        نشر المسودة
                      </Button>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>نشر القاموس؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            سيتم أرشفة الإصدار المنشور حاليًا (إن وجد) وتعيين
                            الإصدار {arNum(data.draft.version)} كقاموس منشور. لا
                            يمكن التراجع عن هذه العملية.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={publishing}>
                            إلغاء
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.preventDefault()
                              publishDraft()
                            }}
                            disabled={publishing}
                          >
                            {publishing ? 'جارٍ النشر...' : 'تأكيد النشر'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative max-w-sm">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    className="pr-9"
                    placeholder="ابحث في المرادفات..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>

                {(data.draft.entries || []).length === 0 ? (
                  <div className="text-center py-10 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      لا توجد مرادفات في هذه المسودة بعد.
                    </p>
                    <Button size="sm" onClick={openAdd}>
                      <Plus className="size-4" />
                      إضافة أول مرادف
                    </Button>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <p className="text-center py-8 text-sm text-muted-foreground">
                    لا توجد نتائج مطابقة لبحثك.
                  </p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>المصطلح القانوني</TableHead>
                          <TableHead>المرادف</TableHead>
                          <TableHead className="w-24">الحالة</TableHead>
                          <TableHead className="w-32 text-center">إجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEntries.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="font-medium">{e.canonical}</TableCell>
                            <TableCell className="text-muted-foreground">{e.synonym}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={e.isActive}
                                  onCheckedChange={(c) => toggleActive(e, c)}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {e.isActive ? 'مفعّل' : 'معطّل'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  onClick={() => openEdit(e)}
                                  aria-label="تحرير"
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                  onClick={() => setDeleteTarget(e)}
                                  aria-label="حذف"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  إجمالي المرادفات في المسودة:{' '}
                  <span className="font-semibold">{arNum(data.draft.entries?.length || 0)}</span>
                </p>
              </CardContent>
            </Card>
          ) : data.published ? (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-base font-bold text-secondary flex items-center gap-2">
                    <Sparkles className="size-4 text-emerald-600" />
                    القاموس المنشور
                    <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                      الإصدار {arNum(data.published.version)}
                    </Badge>
                  </CardTitle>
                  <Button size="sm" onClick={createDraft}>
                    <FilePlus2 className="size-4" />
                    إنشاء مسودة جديدة
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative max-w-sm">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    className="pr-9"
                    placeholder="ابحث في المرادفات..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>

                {filteredEntries.length === 0 ? (
                  <p className="text-center py-8 text-sm text-muted-foreground">
                    لا توجد نتائج مطابقة لبحثك.
                  </p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>المصطلح القانوني</TableHead>
                          <TableHead>المرادف</TableHead>
                          <TableHead className="w-32">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEntries.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="font-medium">{e.canonical}</TableCell>
                            <TableCell className="text-muted-foreground">{e.synonym}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  e.isActive
                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                    : 'text-slate-600 bg-slate-50 border-slate-200'
                                }
                              >
                                {e.isActive ? 'مفعّل' : 'معطّل'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  إجمالي المرادفات المنشورة:{' '}
                  <span className="font-semibold">
                    {arNum(data.published.entries?.length || 0)}
                  </span>
                </p>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'تحرير المرادف' : 'إضافة مرادف جديد'}
            </DialogTitle>
            <DialogDescription>
              حدّد المصطلح القانوني والمرادف المرتبط به. يمكن تفعيل أو تعطيل المرادف
              لضبط ظهوره في نتائج البحث.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="canonical">المصطلح القانوني</Label>
              <Input
                id="canonical"
                value={canonical}
                onChange={(e) => setCanonical(e.target.value)}
                placeholder="مثال: قرار جمهوري"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="synonym">المرادف</Label>
              <Input
                id="synonym"
                value={synonym}
                onChange={(e) => setSynonym(e.target.value)}
                placeholder="مثال: قرار رئاسي"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="active-switch">تفعيل المرادف</Label>
                <p className="text-xs text-muted-foreground">
                  المرادفات المعطّلة لا تظهر في نتائج البحث.
                </p>
              </div>
              <Switch
                id="active-switch"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              إلغاء
            </Button>
            <Button onClick={saveEntry} disabled={saving || !canonical.trim() || !synonym.trim()}>
              {saving ? 'جارٍ الحفظ...' : editingEntry ? 'حفظ التعديلات' : 'إضافة'}
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
            <AlertDialogTitle>حذف المرادف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المرادف "{deleteTarget?.canonical}" → "{deleteTarget?.synonym}"
              نهائيًا من المسودة. لا يمكن التراجع عن هذا الإجراء.
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
