'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
  DialogTrigger,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  Star,
  Search,
  NotebookPen,
  MessageSquarePlus,
  ExternalLink,
  Trash2,
  Pencil,
  Plus,
  Calendar,
  Building2,
  FileText,
  Hash,
  Clock,
  MessageCircle,
  Lightbulb,
  AlertTriangle,
  Filter,
  Play,
  CheckCircle2,
  XCircle,
  Inbox,
  Loader2,
  Settings,
  History,
  Download,
  Bell,
  Moon,
  Sun,
} from 'lucide-react'
import {
  LEGAL_STATUS_LABELS,
  formatDate,
  relativeTime,
  truncate,
  formatYear,
} from '@/lib/constants'
import { Breadcrumb } from '@/components/common/breadcrumb'

/* ============================================================
 * Types
 * ============================================================ */

interface LegislationLite {
  id: string
  slug: string
  officialTitle: string
  shortTitle?: string | null
  year?: number | null
  type?: { nameAr: string } | null
  authority?: { nameAr: string } | null
}

interface FavoriteItem {
  id: string
  legislationId: string | null
  articleId: string | null
  label: string | null
  createdAt: string
  legislation: LegislationLite | null
  article?: { id: string; publishedNumber: string | null; legislationId: string } | null
}

interface SavedSearchItem {
  id: string
  name: string
  query: string
  filters: string | null
  legislationId: string | null
  createdAt: string
}

interface NoteItem {
  id: string
  legislationId: string | null
  articleId: string | null
  content: string
  contextDate: string | null
  createdAt: string
  updatedAt: string
  legislation: LegislationLite | null
}

type ParticipationType = 'comment' | 'suggestion' | 'complaint'
type ParticipationStatus = 'received' | 'triage' | 'resolved' | 'rejected'

interface ParticipationItem {
  id: string
  legislationId: string | null
  participationType: ParticipationType
  content: string
  trackingNumber: string
  status: ParticipationStatus
  responseNotes: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
  legislation: LegislationLite | null
}

/* ============================================================
 * Label maps (local to this view)
 * ============================================================ */

const PARTICIPATION_TYPE_LABELS: Record<ParticipationType, { label: string; icon: typeof MessageCircle; color: string }> = {
  comment: { label: 'تعليق', icon: MessageCircle, color: 'text-[#344B61] bg-[#344B61]/10 border-[#344B61]/20' },
  suggestion: { label: 'اقتراح', icon: Lightbulb, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  complaint: { label: 'شكوى', icon: AlertTriangle, color: 'text-rose-700 bg-rose-50 border-rose-200' },
}

const PARTICIPATION_STATUS_LABELS: Record<ParticipationStatus, { label: string; icon: typeof Inbox; color: string }> = {
  received: { label: 'مستلم', icon: Inbox, color: 'text-slate-700 bg-slate-100 border-slate-200' },
  triage: { label: 'قيد الفرز', icon: Loader2, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  resolved: { label: 'تم الحل', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  rejected: { label: 'مرفوض', icon: XCircle, color: 'text-rose-700 bg-rose-50 border-rose-200' },
}

/* ============================================================
 * Main AccountView Component
 * ============================================================ */

export function AccountView() {
  const [activeTab, setActiveTab] = useState('favorites')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb />
        {/* Page header */}
        <header className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <NotebookPen className="size-6" />
              </div>
              <div>
                <h1 className="font-cairo text-2xl font-bold text-foreground sm:text-3xl">
                  حساب الباحث
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  ملفك الشخصي على منصة التشريعات اليمنية
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              <Hash className="size-4 text-primary" />
              <span>المستخدم الحالي:</span>
              <Badge variant="secondary" className="font-mono">reader</Badge>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1.5 sm:w-fit">
            <TabsTrigger value="favorites" className="gap-1.5 py-2">
              <Star className="size-4" />
              المفضلة
            </TabsTrigger>
            <TabsTrigger value="saved-searches" className="gap-1.5 py-2">
              <Search className="size-4" />
              البحوث المحفوظة
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5 py-2">
              <NotebookPen className="size-4" />
              الملاحظات
            </TabsTrigger>
            <TabsTrigger value="participations" className="gap-1.5 py-2">
              <MessageCircle className="size-4" />
              المشاركات
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 py-2">
              <Settings className="size-4" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="mt-6">
            <FavoritesTab />
          </TabsContent>
          <TabsContent value="saved-searches" className="mt-6">
            <SavedSearchesTab />
          </TabsContent>
          <TabsContent value="notes" className="mt-6">
            <NotesTab />
          </TabsContent>
          <TabsContent value="participations" className="mt-6">
            <ParticipationsTab />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

/* ============================================================
 * Empty state helper
 * ============================================================ */

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Star
  title: string
  description: string
}) {
  return (
    <Card className="border-dashed border-2 bg-muted/20">
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Icon className="size-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="font-cairo text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function LoadingList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-3 p-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* ============================================================
 * Tab 1: Favorites
 * ============================================================ */

function FavoritesTab() {
  const openLegislation = useAppStore((s) => s.openLegislation)
  const [items, setItems] = useState<FavoriteItem[] | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/account/favorites')
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || [])
        setLoading(false)
      })
      .catch(() => {
        setItems([])
        setLoading(false)
        toast.error('تعذّر تحميل المفضلات')
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/account/favorites?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل الحذف')
      toast.success('تمت إزالة العنصر من المفضلة')
      load()
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ أثناء الحذف')
    }
  }

  if (loading) return <LoadingGrid count={6} />
  if (!items || items.length === 0)
    return (
      <EmptyState
        icon={Star}
        title="لا توجد مفضلات بعد"
        description="أضف التشريعات التي تهتم بها إلى المفضلة للوصول السريع إليها لاحقًا."
      />
    )

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((fav) => {
        const leg = fav.legislation
        const status = leg?.legalStatus
          ? LEGAL_STATUS_LABELS[leg.legalStatus as string] || null
          : null
        return (
          <Card key={fav.id} className="flex flex-col transition-shadow hover:shadow-md">
            <CardHeader className="gap-2 pb-3">
              <div className="flex items-start justify-between gap-2">
                {leg?.type?.nameAr && (
                  <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                    {leg.type.nameAr}
                  </Badge>
                )}
                {status && (
                  <Badge variant="outline" className={status.color}>
                    {status.label}
                  </Badge>
                )}
              </div>
              <CardTitle className="font-cairo text-base leading-snug">
                {leg?.officialTitle || fav.label || 'عنصر بدون عنوان'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {leg?.year && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    <span>سنة الإصدار: {formatYear(leg.year)}</span>
                  </div>
                )}
                {leg?.authority?.nameAr && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    <span>{leg.authority.nameAr}</span>
                  </div>
                )}
                {fav.article?.publishedNumber && (
                  <div className="flex items-center gap-1.5">
                    <FileText className="size-3.5" />
                    <span>المادة رقم: {fav.article.publishedNumber.toLocaleString('ar-EG')}</span>
                  </div>
                )}
              </div>
              <div className="mt-auto flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!leg?.slug}
                  onClick={() => leg?.slug && openLegislation(leg.slug)}
                >
                  <ExternalLink className="size-4" />
                  فتح
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                    >
                      <Trash2 className="size-4" />
                      إزالة
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>إزالة من المفضلة</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من إزالة «{truncate(leg?.officialTitle || fav.label || 'هذا العنصر', 60)}» من المفضلة؟ لا يمكن التراجع عن هذا الإجراء.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-rose-600 hover:bg-rose-700"
                        onClick={() => remove(fav.id)}
                      >
                        إزالة
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/* ============================================================
 * Tab 2: Saved Searches
 * ============================================================ */

function SavedSearchesTab() {
  const navigate = useAppStore((s) => s.navigate)
  const [items, setItems] = useState<SavedSearchItem[] | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/account/saved-searches')
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || [])
        setLoading(false)
      })
      .catch(() => {
        setItems([])
        setLoading(false)
        toast.error('تعذّر تحميل البحوث المحفوظة')
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/account/saved-searches?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل الحذف')
      toast.success('تم حذف البحث المحفوظ')
      load()
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ أثناء الحذف')
    }
  }

  function parseFilters(filters: string | null): Record<string, any> | null {
    if (!filters) return null
    try {
      return JSON.parse(filters)
    } catch {
      return null
    }
  }

  if (loading) return <LoadingList count={4} />
  if (!items || items.length === 0)
    return (
      <EmptyState
        icon={Search}
        title="لا توجد بحوث محفوظة"
        description="احفظ بحوثك المتقدمة لتشغيلها مرة أخرى بنقرة واحدة دون إعادة إدخال المعايير."
      />
    )

  return (
    <div className="space-y-4">
      {items.map((s) => {
        const filters = parseFilters(s.filters)
        const filterEntries = filters
          ? Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== '')
          : []
        return (
          <Card key={s.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Search className="size-5 shrink-0 text-primary" />
                    <h3 className="font-cairo text-base font-semibold text-foreground">
                      {s.name}
                    </h3>
                  </div>
                  {s.query && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="gap-1.5 bg-secondary/10 font-mono text-secondary text-xs"
                      >
                        <Hash className="size-3" />
                        {s.query}
                      </Badge>
                    </div>
                  )}
                  {filterEntries.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Filter className="size-3" />
                        المرشحات:
                      </span>
                      {filterEntries.map(([k, v]) => (
                        <Badge key={k} variant="outline" className="px-2 py-0.5 text-xs">
                          <span className="text-muted-foreground">{k}:</span>
                          <span className="font-mono">{String(v)}</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    <span>أُنشئ {relativeTime(s.createdAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => navigate('search', { query: s.query || '' })}
                  >
                    <Play className="size-4" />
                    تشغيل البحث
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                      >
                        <Trash2 className="size-4" />
                        حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف البحث المحفوظ</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف البحث «{s.name}»؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-rose-600 hover:bg-rose-700"
                          onClick={() => remove(s.id)}
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/* ============================================================
 * Tab 3: Notes
 * ============================================================ */

function NotesTab() {
  const openLegislation = useAppStore((s) => s.openLegislation)
  const [items, setItems] = useState<NoteItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [legislations, setLegislations] = useState<LegislationLite[]>([])

  // Add dialog state
  const [addOpen, setAddOpen] = useState(false)
  const [addLegId, setAddLegId] = useState('')
  const [addContent, setAddContent] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit dialog state
  const [editItem, setEditItem] = useState<NoteItem | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const loadLegislations = useCallback(() => {
    fetch('/api/legislations?pageSize=100')
      .then((r) => r.json())
      .then((d) => setLegislations(d.items || []))
      .catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/account/notes')
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || [])
        setLoading(false)
      })
      .catch(() => {
        setItems([])
        setLoading(false)
        toast.error('تعذّر تحميل الملاحظات')
      })
  }, [])

  useEffect(() => {
    load()
    loadLegislations()
  }, [load, loadLegislations])

  async function createNote() {
    if (!addContent.trim()) {
      toast.error('الرجاء كتابة محتوى الملاحظة')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/account/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legislationId: addLegId || null,
          content: addContent.trim(),
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'فشل الحفظ')
      }
      toast.success('تم حفظ الملاحظة')
      setAddOpen(false)
      setAddLegId('')
      setAddContent('')
      load()
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ')
    } finally {
      setSaving(false)
    }
  }

  async function updateNote() {
    if (!editItem) return
    if (!editContent.trim()) {
      toast.error('لا يمكن ترك الملاحظة فارغة')
      return
    }
    setEditSaving(true)
    try {
      const res = await fetch('/api/account/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editItem.id, content: editContent.trim() }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'فشل التحديث')
      }
      toast.success('تم تحديث الملاحظة')
      setEditItem(null)
      setEditContent('')
      load()
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ')
    } finally {
      setEditSaving(false)
    }
  }

  async function removeNote(id: string) {
    try {
      const res = await fetch(`/api/account/notes?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل الحذف')
      toast.success('تم حذف الملاحظة')
      load()
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ')
    }
  }

  function openEdit(note: NoteItem) {
    setEditItem(note)
    setEditContent(note.content)
  }

  if (loading) return <LoadingList count={4} />

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-cairo text-lg font-semibold text-foreground">
            ملاحظاتي الشخصية
          </h2>
          {items && items.length > 0 && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              لديك {items.length.toLocaleString('ar-EG')} ملاحظة
            </p>
          )}
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4" />
              إضافة ملاحظة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-cairo">إضافة ملاحظة جديدة</DialogTitle>
              <DialogDescription>
                اكتب ملاحظتك واربطها بتشريع محدد إن أردت. تظهر الملاحظات في حسابك فقط.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">التشريع المرتبط</label>
                <Select value={addLegId} onValueChange={setAddLegId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر تشريعًا (اختياري)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {legislations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.officialTitle}
                        {l.year ? ` (${formatYear(l.year)})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">المحتوى</label>
                <Textarea
                  value={addContent}
                  onChange={(e) => setAddContent(e.target.value)}
                  placeholder="اكتب ملاحظتك هنا..."
                  rows={6}
                  className="resize-y"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                إلغاء
              </Button>
              <Button
                onClick={createNote}
                disabled={saving || !addContent.trim()}
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                حفظ الملاحظة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!items || items.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="لا توجد ملاحظات"
          description="سجّل ملاحظاتك على التشريعات والمواد للرجوع إليها لاحقًا أثناء دراستك أو بحثك."
        />
      ) : (
        <div className="space-y-4">
          {items.map((note) => {
            const leg = note.legislation
            return (
              <Card key={note.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3">
                    {/* Quoted content */}
                    <div className="flex gap-3">
                      <div className="w-1 shrink-0 rounded-full bg-primary/40" />
                      <blockquote className="flex-1 border-r-2 border-primary/30 pr-3 text-sm leading-relaxed text-foreground">
                        {note.content}
                      </blockquote>
                    </div>
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {leg && (
                        <button
                          className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-primary hover:bg-primary/5 hover:underline"
                          onClick={() => leg.slug && openLegislation(leg.slug)}
                        >
                          <FileText className="size-3.5" />
                          <span className="max-w-[20rem] truncate">
                            {leg.officialTitle}
                          </span>
                          {leg.year && (
                            <span className="text-muted-foreground">
                              ({formatYear(leg.year)})
                            </span>
                          )}
                          <ExternalLink className="size-3" />
                        </button>
                      )}
                      {note.contextDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          تاريخ السياق: {formatDate(note.contextDate)}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {note.createdAt === note.updatedAt
                          ? `أُنشئ ${relativeTime(note.createdAt)}`
                          : `عُدّل ${relativeTime(note.updatedAt)}`}
                      </span>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 border-t border-border pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => openEdit(note)}
                      >
                        <Pencil className="size-4" />
                        تحرير
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                          >
                            <Trash2 className="size-4" />
                            حذف
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>حذف الملاحظة</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-rose-600 hover:bg-rose-700"
                              onClick={() => removeNote(note.id)}
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-cairo">تحرير الملاحظة</DialogTitle>
            <DialogDescription>
              عدّل محتوى الملاحظة ثم اضغط حفظ. سيتم تحديث تاريخ آخر تعديل تلقائيًا.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editItem?.legislation && (
              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="size-4" />
                  <span>التشريع المرتبط:</span>
                </div>
                <p className="mt-1 font-medium text-foreground">
                  {editItem.legislation.officialTitle}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">المحتوى</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              إلغاء
            </Button>
            <Button
              onClick={updateNote}
              disabled={editSaving || !editContent.trim()}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {editSaving && <Loader2 className="size-4 animate-spin" />}
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ============================================================
 * Tab 4: Participations
 * ============================================================ */

function ParticipationsTab() {
  const openLegislation = useAppStore((s) => s.openLegislation)
  const [items, setItems] = useState<ParticipationItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [legislations, setLegislations] = useState<LegislationLite[]>([])

  // New participation dialog
  const [addOpen, setAddOpen] = useState(false)
  const [addLegId, setAddLegId] = useState('')
  const [addType, setAddType] = useState<ParticipationType>('comment')
  const [addContent, setAddContent] = useState('')
  const [saving, setSaving] = useState(false)

  const loadLegislations = useCallback(() => {
    fetch('/api/legislations?pageSize=100')
      .then((r) => r.json())
      .then((d) => setLegislations(d.items || []))
      .catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/account/participations')
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || [])
        setLoading(false)
      })
      .catch(() => {
        setItems([])
        setLoading(false)
        toast.error('تعذّر تحميل المشاركات')
      })
  }, [])

  useEffect(() => {
    load()
    loadLegislations()
  }, [load, loadLegislations])

  async function submitParticipation() {
    if (!addContent.trim()) {
      toast.error('الرجاء كتابة محتوى المشاركة')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/account/participations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legislationId: addLegId || null,
          participationType: addType,
          content: addContent.trim(),
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'فشل الإرسال')
      }
      const data = await res.json()
      const tracking = data?.item?.trackingNumber
      toast.success(
        tracking
          ? `تم استلام مشاركتك. رقم التتبع: ${tracking}`
          : 'تم استلام مشاركتك بنجاح',
        { duration: 6000 }
      )
      setAddOpen(false)
      setAddLegId('')
      setAddType('comment')
      setAddContent('')
      load()
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingList count={4} />

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-cairo text-lg font-semibold text-foreground">
            مشاركاتي المجتمعية
          </h2>
          {items && items.length > 0 && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              لديك {items.length.toLocaleString('ar-EG')} مشاركة
            </p>
          )}
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <MessageSquarePlus className="size-4" />
              مشاركة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-cairo">مشاركة جديدة</DialogTitle>
              <DialogDescription>
                شارك بملاحظاتك أو اقتراحاتك أو شكاواك حول التشريعات. سيتم إصدار رقم تتبع فريد لكل مشاركة.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">التشريع المرتبط</label>
                <Select value={addLegId} onValueChange={setAddLegId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر تشريعًا (اختياري)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {legislations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.officialTitle}
                        {l.year ? ` (${formatYear(l.year)})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">نوع المشاركة</label>
                <Select value={addType} onValueChange={(v) => setAddType(v as ParticipationType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comment">تعليق</SelectItem>
                    <SelectItem value="suggestion">اقتراح</SelectItem>
                    <SelectItem value="complaint">شكوى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">المحتوى</label>
                <Textarea
                  value={addContent}
                  onChange={(e) => setAddContent(e.target.value)}
                  placeholder="اكتب ملاحظتك أو اقتراحك أو شكواك..."
                  rows={6}
                  className="resize-y"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                إلغاء
              </Button>
              <Button
                onClick={submitParticipation}
                disabled={saving || !addContent.trim()}
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                إرسال المشاركة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!items || items.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="لا توجد مشاركات"
          description="ساهم بتقديم التعليقات والاقتراحات والشكاوى المتعلقة بالتشريعات اليمنية. تتم متابعة كل مشاركة عبر رقم تتبع فريد."
        />
      ) : (
        <div className="space-y-4">
          {items.map((p) => {
            const typeMeta = PARTICIPATION_TYPE_LABELS[p.participationType] || PARTICIPATION_TYPE_LABELS.comment
            const statusMeta = PARTICIPATION_STATUS_LABELS[p.status] || PARTICIPATION_STATUS_LABELS.received
            const TypeIcon = typeMeta.icon
            const StatusIcon = statusMeta.icon
            const leg = p.legislation
            return (
              <Card key={p.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3">
                    {/* Header row: type + status + tracking */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={`gap-1.5 ${typeMeta.color}`}>
                        <TypeIcon className="size-3.5" />
                        {typeMeta.label}
                      </Badge>
                      <Badge variant="outline" className={`gap-1.5 ${statusMeta.color}`}>
                        <StatusIcon className="size-3.5" />
                        {statusMeta.label}
                      </Badge>
                      <div className="mr-auto flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs">
                        <Hash className="size-3 text-muted-foreground" />
                        <span className="text-muted-foreground">رقم التتبع:</span>
                        <span className="font-mono font-medium text-foreground">
                          {p.trackingNumber}
                        </span>
                      </div>
                    </div>
                    {/* Content */}
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {p.content}
                    </p>
                    {/* Response notes (if any) */}
                    {p.responseNotes && (
                      <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-3 text-sm">
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="size-3.5" />
                          رد الإدارة
                        </div>
                        <p className="text-foreground">{p.responseNotes}</p>
                      </div>
                    )}
                    {/* Footer: legislation + time */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-3">
                        {leg && (
                          <button
                            className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-primary hover:bg-primary/5 hover:underline"
                            onClick={() => leg.slug && openLegislation(leg.slug)}
                          >
                            <FileText className="size-3.5" />
                            <span className="max-w-[20rem] truncate">
                              {leg.officialTitle}
                            </span>
                            <ExternalLink className="size-3" />
                          </button>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5" />
                          {relativeTime(p.createdAt)}
                        </span>
                      </div>
                      {p.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          منشور علنًا
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SettingsTab() {
  const [recentCount, setRecentCount] = useState(0)
  const [searchHistoryCount, setSearchHistoryCount] = useState(0)

  useEffect(() => {
    try {
      const recent = localStorage.getItem('recentlyViewed')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (recent) setRecentCount(JSON.parse(recent).length)
      const history = localStorage.getItem('searchHistory')
      if (history) setSearchHistoryCount(JSON.parse(history).length)
    } catch {}
  }, [])

  function clearRecentlyViewed() {
    try {
      localStorage.removeItem('recentlyViewed')
      setRecentCount(0)
      toast.success('تم مسح قائمة "شوهد مؤخرًا"')
    } catch {
      toast.error('تعذر المسح')
    }
  }

  function clearSearchHistory() {
    try {
      localStorage.removeItem('searchHistory')
      setSearchHistoryCount(0)
      toast.success('تم مسح سجل البحث')
    } catch {
      toast.error('تعذر المسح')
    }
  }

  function clearAllData() {
    try {
      localStorage.removeItem('recentlyViewed')
      localStorage.removeItem('searchHistory')
      setRecentCount(0)
      setSearchHistoryCount(0)
      toast.success('تم مسح جميع البيانات المحلية')
    } catch {
      toast.error('تعذر المسح')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
              <History className="h-4 w-4 text-primary" />
            </div>
            البيانات المحلية
          </CardTitle>
          <CardDescription className="text-xs">
            إدارة البيانات المخزنة محليًا في متصفحك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Recently viewed */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                <History className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">قائمة "شوهد مؤخرًا"</div>
                <div className="text-xs text-muted-foreground">
                  {recentCount > 0
                    ? `${recentCount.toLocaleString('ar-EG')} تشريع`
                    : 'لا توجد عناصر'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearRecentlyViewed}
              disabled={recentCount === 0}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4 ml-1.5" />
              مسح
            </Button>
          </div>

          {/* Search history */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-secondary/10 flex items-center justify-center">
                <Search className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <div className="text-sm font-medium">سجل البحث</div>
                <div className="text-xs text-muted-foreground">
                  {searchHistoryCount > 0
                    ? `${searchHistoryCount.toLocaleString('ar-EG')} بحث`
                    : 'لا توجد عمليات بحث'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSearchHistory}
              disabled={searchHistoryCount === 0}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4 ml-1.5" />
              مسح
            </Button>
          </div>

          {/* Clear all */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                <Trash2 className="h-4 w-4 ml-1.5" />
                مسح جميع البيانات المحلية
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد مسح البيانات</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم مسح جميع البيانات المحلية المخزنة في متصفحك (قائمة "شوهد مؤخرًا" وسجل البحث). هذا الإجراء لا يمكن التراجع عنه.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllData} className="bg-rose-600 hover:bg-rose-700">
                  نعم، امسح الكل
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-secondary/10 flex items-center justify-center">
              <Settings className="h-4 w-4 text-secondary" />
            </div>
            التفضيلات
          </CardTitle>
          <CardDescription className="text-xs">
            إعدادات العرض والإشعارات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                <Bell className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-medium">إشعارات التشريعات الجديدة</div>
                <div className="text-xs text-muted-foreground">تنبيه عند نشر تشريعات جديدة</div>
              </div>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                <Download className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium">تنزيل تلقائي للملفات</div>
                <div className="text-xs text-muted-foreground">تنزيل ملفات الملاحق تلقائيًا</div>
              </div>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            معلومات الحساب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between border-b border-border/30 py-1.5">
            <span className="text-muted-foreground">المستخدم</span>
            <span className="font-medium">قارئ تجريبي (reader)</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/30 py-1.5">
            <span className="text-muted-foreground">الدور</span>
            <span className="font-medium">قارئ / باحث</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">نوع الحساب</span>
            <span className="font-medium">حساب تجريبي</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountView
