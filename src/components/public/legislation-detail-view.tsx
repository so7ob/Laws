'use client'

import { useEffect, useState, useRef } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarPrimitive } from '@/components/ui/calendar'
import { Breadcrumb } from '@/components/common/breadcrumb'
import {
  ArrowRight,
  BookOpen,
  FileText,
  History,
  Network,
  LayoutGrid,
  Printer,
  Share2,
  Star,
  Flag,
  Search,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Scale,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Hash,
  GitCompare,
  Clock,
  X,
  Maximize2,
  CalendarClock,
  ListOrdered,
  Copy,
  Check,
} from 'lucide-react'
import {
  LEGAL_STATUS_LABELS,
  VERIFICATION_LABELS,
  AMENDMENT_OPERATION_LABELS,
  ATTACHMENT_TYPE_LABELS,
  RELATION_TYPE_LABELS,
  formatDate,
  formatDateShort,
  CHANGE_TYPE_LABELS,
  highlight,
  formatYear,
  stripMarkdown,
} from '@/lib/constants'
import { diffTexts, mergeSegments, getDiffStats } from '@/lib/diff'
import { toast } from 'sonner'
import { LegislationFeedback } from '@/components/public/legislation-feedback'
import { ShareDialog } from '@/components/public/share-dialog'
import { CitationDialog } from '@/components/public/citation-dialog'

interface LegislationDetail {
  id: string
  slug: string
  officialTitle: string
  shortTitle: string | null
  number: string | null
  year: number | null
  type: any
  authority: any
  subjects: any[]
  classifications: any[]
  issueDate: string | null
  publicationDate: string | null
  effectiveDate: string | null
  legalStatus: string
  workflowStatus: string
  verificationLevel: string
  preamble: string | null
  hasAmendments: boolean
  structureNodes: any[]
  articles: any[]
  attachments: any[]
  sources: any[]
  officialJournals: any[]
  articleCount: number
  attachmentCount: number
  amendmentCount: number
  relationCount: number
}

interface AmendmentDoc {
  items: any[]
}

interface RelationData {
  from: any
  outgoing: any[]
  incoming: any[]
}

export function LegislationDetailView() {
  const slug = useAppStore((s) => s.slug)
  const navigate = useAppStore((s) => s.navigate)
  const [data, setData] = useState<LegislationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [articleSearch, setArticleSearch] = useState('')
  const [effectiveDate, setEffectiveDate] = useState<Date | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    const params = effectiveDate ? `?effectiveDate=${effectiveDate.toISOString()}` : ''
    fetch(`/api/legislations/${slug}${params}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
        // Track recently viewed in localStorage
        if (d && typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('recentlyViewed')
            const list = stored ? JSON.parse(stored) : []
            const filtered = list.filter((item: any) => item.slug !== d.slug)
            const newItem = {
              slug: d.slug,
              title: d.shortTitle || d.officialTitle,
              type: d.type?.nameAr,
              year: d.year,
              viewedAt: new Date().toISOString(),
            }
            const updated = [newItem, ...filtered].slice(0, 6)
            localStorage.setItem('recentlyViewed', JSON.stringify(updated))
          } catch {}
        }
      })
      .catch(() => setLoading(false))
  }, [slug, effectiveDate])

  function handleCopyLink() {
    if (typeof window === 'undefined') return
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true)
      toast.success('تم نسخ الرابط')
      setTimeout(() => setLinkCopied(false), 2000)
    }).catch(() => toast.error('تعذر نسخ الرابط'))
  }

  function handleFavorite() {
    if (!slug || !data) return
    fetch('/api/account/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ legislationId: data.id }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.alreadyExists) {
          toast.info('التشريع موجود في المفضلة مسبقًا')
        } else {
          toast.success('تمت الإضافة إلى المفضلة')
        }
      })
      .catch(() => toast.error('تعذرت الإضافة للمفضلة'))
  }

  function handleReport() {
    toast.info('سيتم توجيهك لنموذج الإبلاغ', {
      description: 'يمكنك الإبلاغ عن مشكلة في المحتوى من حساب الباحث → المشاركات',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-muted-foreground">التشريع غير موجود</p>
        <Button onClick={() => navigate('legislations')} className="mt-4">
          العودة للقائمة
        </Button>
      </div>
    )
  }

  const status = LEGAL_STATUS_LABELS[data.legalStatus] || LEGAL_STATUS_LABELS.active
  const verification = VERIFICATION_LABELS[data.verificationLevel] || VERIFICATION_LABELS.unverified
  const effectiveDateLabel = effectiveDate
    ? `النص النافذ في ${formatDate(effectiveDate)}`
    : 'عرض النص الحالي'

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      {/* Print-only header */}
      <div className="print-only hidden">
        <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
          <div>
            <div className="text-lg font-bold">منصة التشريعات اليمنية</div>
            <div className="text-xs">مرجعية قانونية موثوقة</div>
          </div>
          <div className="text-xs text-left">
            <div>تاريخ الطباعة: {formatDate(new Date())}</div>
            <div>النوع: {data.type?.nameAr}</div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb
        customCrumbs={[
          { label: data.shortTitle || data.officialTitle, icon: Scale },
        ]}
      />

      {/* Header card */}
      <Card className="mb-6 border-t-4 border-t-primary overflow-hidden relative">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 pattern-arabesque opacity-[0.03] pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/15">
                  {data.type?.nameAr}
                </Badge>
                <Badge variant="outline" className={status.color}>{status.label}</Badge>
                <Badge variant="outline" className={verification.color}>{verification.label}</Badge>
                {data.hasAmendments && (
                  <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
                    <History className="h-3 w-3 ml-1" />
                    معدَّل
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary mb-3 leading-tight">
                {data.officialTitle}
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <InfoBox icon={Hash} label="الرقم / السنة" value={data.number && data.year ? `${data.number} / ${formatYear(data.year)}` : '—'} />
                <InfoBox icon={Building2} label="جهة الإصدار" value={data.authority?.nameAr || '—'} />
                <InfoBox icon={Calendar} label="تاريخ الإصدار" value={formatDate(data.issueDate)} />
                <InfoBox icon={CheckCircle2} label="تاريخ النفاذ" value={formatDate(data.effectiveDate)} />
              </div>
              {/* Effective date picker */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <CalendarClock className="h-3.5 w-3.5 ml-1.5" />
                      {effectiveDateLabel}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                      <div className="text-sm font-semibold mb-1">عرض النص النافذ في تاريخ</div>
                      <div className="text-xs text-muted-foreground">اختر تاريخًا لعرض النسخة المناسبة</div>
                    </div>
                    <CalendarPrimitive
                      mode="single"
                      selected={effectiveDate || undefined}
                      onSelect={(d) => {
                        setEffectiveDate(d || null)
                        setDatePickerOpen(false)
                        if (d) toast.success(`عرض النص النافذ في ${formatDate(d)}`)
                      }}
                      initialFocus
                    />
                    {effectiveDate && (
                      <div className="p-2 border-t flex justify-between gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEffectiveDate(null); setDatePickerOpen(false) }}
                        >
                          إعادة التعيين
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                {effectiveDate && (
                  <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
                    <Clock className="h-3 w-3 ml-1" />
                    عرض زمني
                  </Badge>
                )}
              </div>
            </div>
            {/* Action tools */}
            <div className="flex lg:flex-col gap-2 lg:min-w-[140px] no-print" dir="rtl">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 ml-1.5" />
                <span className="hidden sm:inline">طباعة</span>
              </Button>
              <ShareDialog legislationTitle={data.officialTitle} />
              <CitationDialog
                data={{
                  officialTitle: data.officialTitle,
                  type: data.type,
                  number: data.number,
                  year: data.year,
                  authority: data.authority,
                  issueDate: data.issueDate,
                  publicationDate: data.publicationDate,
                  effectiveDate: data.effectiveDate,
                  officialJournal: data.officialJournals?.[0],
                }}
                legislationTitle={data.officialTitle}
              />
              <Button variant="outline" size="sm" onClick={handleFavorite}>
                <Star className="h-4 w-4 ml-1.5" />
                <span className="hidden sm:inline">أضف للمفضلة</span>
              </Button>
              <LegislationFeedback legislationId={data.id} legislationTitle={data.officialTitle} />
              <Button variant="outline" size="sm" onClick={handleReport}>
                <Flag className="h-4 w-4 ml-1.5" />
                <span className="hidden sm:inline">إبلاغ</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <QuickStat icon={FileText} label="عدد المواد" value={data.articleCount} />
        <QuickStat icon={LayoutGrid} label="الملاحق" value={data.attachmentCount} />
        <QuickStat icon={History} label="التعديلات" value={data.amendmentCount} />
        <QuickStat icon={Network} label="العلاقات" value={data.relationCount} />
        <ReadingTimeStat articles={data.articles} preamble={data.preamble} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <div className="overflow-x-auto" dir="rtl">
          <TabsList className="w-full justify-start mb-4 h-auto flex-wrap" dir="rtl">
            <TabsTrigger value="overview" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>النظرة العامة</span>
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-1.5">
              <FileText className="h-4 w-4" />
              <span>المواد</span>
            </TabsTrigger>
            <TabsTrigger value="structure" className="gap-1.5">
              <LayoutGrid className="h-4 w-4" />
              <span>الفهرس</span>
            </TabsTrigger>
            <TabsTrigger value="amendments" className="gap-1.5">
              <History className="h-4 w-4" />
              <span>التعديلات</span>
            </TabsTrigger>
            <TabsTrigger value="attachments" className="gap-1.5">
              <FileText className="h-4 w-4" />
              <span>الملاحق</span>
            </TabsTrigger>
            <TabsTrigger value="relations" className="gap-1.5">
              <Network className="h-4 w-4" />
              <span>العلاقات</span>
            </TabsTrigger>
            <TabsTrigger value="sources" className="gap-1.5">
              <FileText className="h-4 w-4" />
              <span>المصادر</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          <OverviewTab data={data} />
        </TabsContent>
        <TabsContent value="articles" className="mt-0">
          <ArticlesTab data={data} articleSearch={articleSearch} setArticleSearch={setArticleSearch} />
        </TabsContent>
        <TabsContent value="structure" className="mt-0">
          <StructureTab data={data} />
        </TabsContent>
        <TabsContent value="amendments" className="mt-0">
          <AmendmentsTab slug={data.slug} />
        </TabsContent>
        <TabsContent value="attachments" className="mt-0">
          <AttachmentsTab slug={data.slug} attachments={data.attachments} />
        </TabsContent>
        <TabsContent value="relations" className="mt-0">
          <RelationsTab slug={data.slug} />
        </TabsContent>
        <TabsContent value="sources" className="mt-0">
          <SourcesTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InfoBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="font-semibold text-sm">{value}</div>
    </div>
  )
}

function QuickStat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-xl font-bold text-secondary article-number">
            {value.toLocaleString('ar-EG')}
          </div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReadingTimeStat({ articles, preamble }: { articles: any[]; preamble: string | null }) {
  // Estimate reading time: ~200 words per minute for Arabic
  const totalText = [
    preamble || '',
    ...articles.map((a) => {
      const v = a.versions?.find((ver: any) => ver.isCurrent) || a.versions?.[0]
      return v?.textContent || ''
    }),
  ].join(' ')
  const wordCount = totalText.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <Card className="border-border/60 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-xl font-bold text-secondary article-number">
            {minutes.toLocaleString('ar-EG')}
            <span className="text-xs font-normal mr-1">دقيقة</span>
          </div>
          <div className="text-xs text-muted-foreground">وقت القراءة</div>
        </div>
      </CardContent>
    </Card>
  )
}

function OverviewTab({ data }: { data: LegislationDetail }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir="rtl">
      <div className="lg:col-span-2 space-y-6" dir="rtl">
        {/* Preamble */}
        {data.preamble && (
          <Card dir="rtl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                الديباجة
              </CardTitle>
            </CardHeader>
            <CardContent dir="rtl">
              <p className="legal-text leading-loose text-base" dir="rtl">{stripMarkdown(data.preamble || "")}</p>
            </CardContent>
          </Card>
        )}

        {/* First articles preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              أبرز المواد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.articles.slice(0, 5).map((a) => {
              const v = a.versions?.find((ver: any) => ver.isCurrent) || a.versions?.[0]
              return (
                <div key={a.id} className="border-r-4 border-r-primary/40 pr-4 py-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary text-primary-foreground article-number">
                      مادة ({a.publishedNumber})
                    </Badge>
                    {v?.changeType && v.changeType !== 'initial' && (
                      <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
                        {CHANGE_TYPE_LABELS[v.changeType] || v.changeType}
                      </Badge>
                    )}
                  </div>
                  <p className="legal-text text-sm">{stripMarkdown(v?.textContent || '—')}</p>
                </div>
              )
            })}
            {data.articles.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                ...و {data.articles.length - 5} مادة أخرى
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="الرقم" value={data.number || '—'} />
            <Row label="السنة" value={data.year?.toString() || '—'} />
            <Row label="النوع" value={data.type?.nameAr || '—'} />
            <Row label="جهة الإصدار" value={data.authority?.nameAr || '—'} />
            <Row label="تاريخ الإصدار" value={formatDate(data.issueDate)} />
            <Row label="تاريخ النشر" value={formatDate(data.publicationDate)} />
            <Row label="تاريخ النفاذ" value={formatDate(data.effectiveDate)} />
          </CardContent>
        </Card>

        {data.subjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">الموضوعات</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {data.subjects.map((s) => (
                <Badge key={s.id} variant="secondary" className="bg-muted">
                  {s.nameAr}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {data.classifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">التصنيفات</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {data.classifications.map((c) => (
                <Badge key={c.id} variant="outline">
                  {c.nameAr}
                </Badge>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-sm">ملاحظة</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              النص المعروض هو آخر نسخة نافذة. للاطلاع على النصوص السابقة والتعديلات،
              استخدم تبويب «التعديلات».
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ArticlesTab({ data, articleSearch, setArticleSearch }: { data: LegislationDetail; articleSearch: string; setArticleSearch: (s: string) => void }) {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null)

  const filtered = articleSearch.trim()
    ? data.articles.filter((a) => {
        const v = a.versions?.find((ver: any) => ver.isCurrent) || a.versions?.[0]
        const text = `${a.publishedNumber} ${v?.textContent || ''}`
        return text.includes(articleSearch)
      })
    : data.articles

  const selectedArticle = data.articles.find((a) => a.id === selectedArticleId)

  // IntersectionObserver to track which article is in view
  useEffect(() => {
    if (filtered.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry closest to the top that's intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          const id = visible[0].target.id.replace('article-', '')
          setActiveArticleId(id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )
    // Observe all article cards
    filtered.forEach((a) => {
      const el = document.getElementById(`article-${a.id}`)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [filtered])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-6" dir="rtl">
      {/* Article Navigation Sidebar - sticky */}
      <div className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-primary" />
                قائمة المواد
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="px-2 pb-2 space-y-0.5">
                  {data.articles.map((a, idx) => {
                    const isActive = activeArticleId === a.id
                    return (
                      <a
                        key={a.id}
                        href={`#article-${a.id}`}
                        onClick={(e) => {
                          e.preventDefault()
                          document.getElementById(`article-${a.id}`)?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          })
                        }}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all text-right group ${
                          isActive
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'hover:bg-accent text-muted-foreground'
                        }`}
                      >
                        <span className={`shrink-0 h-6 w-6 rounded flex items-center justify-center text-[10px] font-semibold transition-colors article-number ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }`}>
                          {a.publishedNumber || (idx + 1)}
                        </span>
                        <span className={`truncate transition-colors ${
                          isActive ? 'text-primary' : 'group-hover:text-foreground'
                        }`}>
                          مادة ({a.publishedNumber})
                        </span>
                        {isActive && (
                          <span className="mr-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </a>
                    )
                  })}
                  {data.articles.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      لا توجد مواد
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Articles content */}
      <div className="space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              placeholder="ابحث داخل المواد..."
              className="pr-10"
          />
        </div>
        <div className="text-sm text-muted-foreground shrink-0">
          <span className="article-number font-semibold text-foreground">{filtered.length.toLocaleString('ar-EG')}</span>
          {' '}من{' '}
          <span className="article-number">{data.articles.length.toLocaleString('ar-EG')}</span>{' '}مادة
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((a, idx) => {
          const v = a.versions?.find((ver: any) => ver.isCurrent) || a.versions?.[0]
          const parts = articleSearch ? highlight(stripMarkdown(v?.textContent || ''), articleSearch) : null
          return (
            <Card key={a.id} id={`article-${a.id}`} className="border-border/60 hover:border-primary/30 transition-colors group" dir="rtl">
              <CardContent className="p-5" dir="rtl">
                <div className="flex items-start gap-4" dir="rtl">
                  <div className="shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center article-number font-bold text-primary text-lg border border-primary/20">
                      {a.publishedNumber || (idx + 1)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-muted/50">
                        مادة ({a.publishedNumber})
                      </Badge>
                      {v?.changeType && v.changeType !== 'initial' && (
                        <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
                          {CHANGE_TYPE_LABELS[v.changeType] || v.changeType}
                        </Badge>
                      )}
                      {v?.effectiveFrom && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          نافذ منذ {formatDate(v.effectiveFrom)}
                        </span>
                      )}
                    </div>
                    {parts ? (
                      <p className="legal-text text-sm leading-loose">
                        {parts.map((p, i) => (
                          <span key={i} className={p.match ? 'bg-yellow-200/60 rounded px-0.5' : ''}>
                            {p.text}
                          </span>
                        ))}
                      </p>
                    ) : (
                      <p className="legal-text text-sm leading-loose">{stripMarkdown(v?.textContent || '—')}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="عرض النسخ السابقة"
                      onClick={() => setSelectedArticleId(a.id)}
                    >
                      <History className="h-4 w-4 text-secondary group-hover:text-primary transition-colors" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="إضافة للمفضلة">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="نسخ نص المادة"
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && v?.textContent) {
                          navigator.clipboard.writeText(v.textContent).then(() => {
                            toast.success('تم نسخ نص المادة')
                          }).catch(() => toast.error('تعذر النسخ'))
                        }
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="نسخ الرابط">
                      <Hash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              لا توجد مواد مطابقة لبحثك
            </CardContent>
          </Card>
        )}
        </div>
      </div>

      {selectedArticle && (
        <ArticleVersionsDialog
          article={selectedArticle}
          onClose={() => setSelectedArticleId(null)}
        />
      )}
    </div>
  )
}

function ArticleVersionsDialog({ article, onClose }: { article: any; onClose: () => void }) {
  const [compareA, setCompareA] = useState<string | null>(null)
  const [compareB, setCompareB] = useState<string | null>(null)
  const [allVersions, setAllVersions] = useState<any[]>(article.versions || [])
  const [loading, setLoading] = useState(false)
  const slug = useAppStore((s) => s.slug)

  useEffect(() => {
    if (!slug) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    fetch(`/api/legislations/${slug}/versions`)
      .then((r) => r.json())
      .then((d) => {
        const found = (d.items || []).find((a: any) => a.id === article.id)
        if (found?.versions) setAllVersions(found.versions)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug, article.id])

  // Sort by versionNo descending
  const sortedVersions = [...allVersions].sort((a: any, b: any) => b.versionNo - a.versionNo)

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div>تاريخ نسخ المادة</div>
              <div className="text-sm font-normal text-muted-foreground mt-0.5">
                مادة ({article.publishedNumber}) • {sortedVersions.length.toLocaleString('ar-EG')} نسخة
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            عرض جميع نسخ المادة مع إمكانية المقارنة
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="space-y-3 pr-1">
            {sortedVersions.map((v: any, i: number) => {
              const isCurrent = v.isCurrent
              const isFuture = v.isFuture
              const prevVersion = sortedVersions[i + 1]
              const isSelectedA = compareA === v.id
              const isSelectedB = compareB === v.id
              return (
                <div
                  key={v.id}
                  className={`rounded-lg border p-4 transition-all ${
                    isCurrent
                      ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : isFuture
                      ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-950/20'
                      : 'border-border bg-card'
                  } ${isSelectedA ? 'ring-2 ring-primary' : ''} ${isSelectedB ? 'ring-2 ring-secondary' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={isCurrent ? 'bg-emerald-600' : isFuture ? 'bg-blue-600' : 'bg-secondary'}>
                        <Clock className="h-3 w-3 ml-1" />
                        النسخة {v.versionNo?.toLocaleString('ar-EG')}
                      </Badge>
                      {v.changeType && (
                        <Badge variant="outline" className={
                          v.changeType === 'initial' ? 'text-slate-600 bg-slate-50 border-slate-200' :
                          v.changeType === 'amended' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                          v.changeType === 'added' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                          v.changeType === 'repealed' ? 'text-rose-700 bg-rose-50 border-rose-200' :
                          'text-muted-foreground'
                        }>
                          {CHANGE_TYPE_LABELS[v.changeType] || v.changeType}
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                          النص الحالي
                        </Badge>
                      )}
                      {isFuture && (
                        <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
                          <Clock className="h-3 w-3 ml-1" />
                          نفاذ مستقبلي
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant={isSelectedA ? 'default' : 'ghost'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setCompareA(isSelectedA ? null : v.id)}
                      >
                        مقارنة (أ)
                      </Button>
                      <Button
                        variant={isSelectedB ? 'default' : 'ghost'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setCompareB(isSelectedB ? null : v.id)}
                      >
                        مقارنة (ب)
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-2 text-sm mb-2">
                    <div className="text-muted-foreground text-xs">فترة النفاذ:</div>
                    <div className="text-xs article-number">
                      {formatDateShort(v.effectiveFrom)} — {v.effectiveTo ? formatDateShort(v.effectiveTo) : 'الآن'}
                    </div>
                    {v.changeReason && (
                      <>
                        <div className="text-muted-foreground text-xs">سبب التغيير:</div>
                        <div className="text-xs">{v.changeReason}</div>
                      </>
                    )}
                  </div>
                  <div className="legal-text text-sm bg-muted/30 rounded-md p-3 leading-loose">
                    {stripMarkdown(v.textContent || '—')}
                  </div>
                </div>
              )
            })}
            {sortedVersions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
                لا توجد نسخ مسجلة لهذه المادة
              </div>
            )}
          </div>
        </ScrollArea>

        {compareA && compareB && (
          <VersionCompareBar
            versionA={sortedVersions.find((v: any) => v.id === compareA)}
            versionB={sortedVersions.find((v: any) => v.id === compareB)}
            onClear={() => { setCompareA(null); setCompareB(null) }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function VersionCompareBar({ versionA, versionB, onClear }: { versionA: any; versionB: any; onClear: () => void }) {
  if (!versionA || !versionB) return null
  const textA = versionA.textContent || ''
  const textB = versionB.textContent || ''
  const isSame = textA === textB

  // Compute word-level diff
  const segments = isSame ? [] : mergeSegments(diffTexts(textA, textB))
  const stats = isSame ? { added: 0, removed: 0, unchanged: 0, total: 0, similarity: 100 } : getDiffStats(textA, textB)

  return (
    <div className="border-t bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <GitCompare className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">مقارنة النسختين</span>
          {isSame ? (
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
              <CheckCircle2 className="h-3 w-3 ml-1" />
              النصان متطابقان
            </Badge>
          ) : (
            <>
              <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
                تشابه {stats.similarity.toLocaleString('ar-EG')}%
              </Badge>
              {stats.added > 0 && (
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                  +{stats.added.toLocaleString('ar-EG')} إضافة
                </Badge>
              )}
              {stats.removed > 0 && (
                <Badge variant="outline" className="text-rose-700 bg-rose-50 border-rose-200">
                  -{stats.removed.toLocaleString('ar-EG')} حذف
                </Badge>
              )}
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isSame ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-4 text-center text-sm text-emerald-700">
          <CheckCircle2 className="h-5 w-5 mx-auto mb-1" />
          النصان متطابقان تمامًا
        </div>
      ) : (
        <>
          {/* Unified diff view */}
          <div className="rounded-md border border-border bg-card p-3 mb-3 max-h-48 overflow-y-auto">
            <div className="text-xs font-semibold text-muted-foreground mb-2">عرض الفروقات (موحّد)</div>
            <p className="legal-text text-sm leading-loose">
              {segments.map((seg, i) => (
                <span
                  key={i}
                  className={
                    seg.type === 'added'
                      ? 'bg-emerald-100/70 text-emerald-900 rounded px-0.5 mx-0.5 dark:bg-emerald-900/40 dark:text-emerald-100'
                      : seg.type === 'removed'
                      ? 'bg-rose-100/70 text-rose-900 line-through rounded px-0.5 mx-0.5 dark:bg-rose-900/40 dark:text-rose-100'
                      : ''
                  }
                >
                  {seg.text}
                </span>
              ))}
            </p>
          </div>

          {/* Side-by-side view */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-rose-200 bg-rose-50/30 p-3">
              <div className="text-xs font-semibold text-rose-700 mb-2 flex items-center gap-1">
                <span className="size-2 rounded-full bg-rose-500" />
                النسخة {versionA.versionNo?.toLocaleString('ar-EG')} ({formatDateShort(versionA.effectiveFrom)})
              </div>
              <div className="legal-text text-xs leading-relaxed max-h-32 overflow-y-auto">
                {segments.filter((s) => s.type !== 'added').map((seg, i) => (
                  <span
                    key={i}
                    className={seg.type === 'removed' ? 'bg-rose-200/60 rounded px-0.5' : ''}
                  >
                    {seg.text}{' '}
                  </span>
                ))}
                {segments.filter((s) => s.type !== 'added').length === 0 && (
                  <span className="text-muted-foreground text-xs">— لا يوجد محتوى —</span>
                )}
              </div>
            </div>
            <div className="rounded-md border border-emerald-200 bg-emerald-50/30 p-3">
              <div className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-500" />
                النسخة {versionB.versionNo?.toLocaleString('ar-EG')} ({formatDateShort(versionB.effectiveFrom)})
              </div>
              <div className="legal-text text-xs leading-relaxed max-h-32 overflow-y-auto">
                {segments.filter((s) => s.type !== 'removed').map((seg, i) => (
                  <span
                    key={i}
                    className={seg.type === 'added' ? 'bg-emerald-200/60 rounded px-0.5' : ''}
                  >
                    {seg.text}{' '}
                  </span>
                ))}
                {segments.filter((s) => s.type !== 'removed').length === 0 && (
                  <span className="text-muted-foreground text-xs">— لا يوجد محتوى —</span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StructureTab({ data }: { data: LegislationDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          فهرس التشريع
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.structureNodes.length === 0 && data.articles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            لا توجد بنية هيكلية مسجلة لهذا التشريع.
          </p>
        ) : (
          <div className="space-y-1">
            {data.structureNodes.length > 0 ? (
              data.structureNodes.map((n) => (
                <StructureNodeView key={n.id} node={n} articles={data.articles} depth={0} />
              ))
            ) : (
              <div className="space-y-1">
                {data.articles.map((a) => {
                  const v = a.versions?.find((ver: any) => ver.isCurrent) || a.versions?.[0]
                  return (
                    <div key={a.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/40">
                      <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="article-number">مادة {a.publishedNumber}</Badge>
                      <span className="text-sm truncate">{v?.textContent?.substring(0, 80)}...</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StructureNodeView({ node, articles, depth }: { node: any; articles: any[]; depth: number }) {
  const [open, setOpen] = useState(depth < 2)
  const hasChildren = node.children && node.children.length > 0
  const hasArticles = node.articles && node.articles.length > 0

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-right p-2 rounded-md hover:bg-muted/40 transition-colors"
        style={{ paddingRight: `${depth * 1.5 + 0.5}rem` }}
      >
        {hasChildren || hasArticles ? (
          open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronUp className="h-4 w-4 shrink-0" />
        ) : (
          <div className="w-4" />
        )}
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
          {node.nodeType === 'book' ? 'كتاب' :
           node.nodeType === 'part' ? 'جزء' :
           node.nodeType === 'chapter' ? 'باب' :
           node.nodeType === 'section' ? 'فصل' :
           node.nodeType === 'subsection' ? 'قسم' :
           node.nodeType === 'title' ? 'عنوان' : node.nodeType}
          {node.number && <span className="article-number"> {node.number}</span>}
        </Badge>
        {node.title && <span className="text-sm font-medium">{node.title}</span>}
      </button>
      {open && hasChildren && (
        <div>
          {node.children.map((c: any) => (
            <StructureNodeView key={c.id} node={c} articles={articles} depth={depth + 1} />
          ))}
        </div>
      )}
      {open && hasArticles && (
        <div style={{ paddingRight: `${(depth + 1) * 1.5 + 0.5}rem` }}>
          {node.articles.map((a: any) => {
            const v = articles.find((x) => x.id === a.id)?.versions?.[0]
            return (
              <div key={a.id} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/30">
                <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline" className="article-number text-[11px]">مادة {a.publishedNumber}</Badge>
                <span className="text-xs text-muted-foreground truncate">{v?.textContent?.substring(0, 80)}...</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AmendmentsTab({ slug }: { slug: string }) {
  const [data, setData] = useState<AmendmentDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/legislations/${slug}/amendments`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return <Skeleton className="h-64 rounded-xl" />
  }

  if (!data || data.items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
          لا توجد تعديلات مسجلة على هذا التشريع
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            يعرض هذا القسم الخط الزمني للتعديلات التي أثرت على هذا التشريع، مع تفاصيل
            العمليات والنصوص السابقة واللاحقة لكل مادة معدَّلة.
          </p>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {data.items.map((doc) => (
          <Card key={doc.id} className="overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}
              className="w-full text-right p-4 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary text-primary-foreground">
                      {formatYear(doc.year)}
                    </Badge>
                    <Badge variant="outline" className={doc.status === 'applied' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}>
                      {doc.status === 'applied' ? 'مُطبَّق' : doc.status === 'draft' ? 'مسودة' : doc.status === 'in_review' ? 'قيد المراجعة' : doc.status}
                    </Badge>
                    <Badge variant="outline">
                      {doc.operationCount?.toLocaleString('ar-EG')} عملية
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-base mb-1">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{doc.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-2">
                    <span>الرقم: {doc.number}</span>
                    <span>•</span>
                    <span>سنة النفاذ: {formatDate(doc.effectiveDate)}</span>
                  </div>
                </div>
                {expanded === doc.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </button>
            {expanded === doc.id && (
              <CardContent className="border-t bg-muted/20 p-4 space-y-3">
                {doc.operations?.map((op: any) => (
                  <div key={op.id} className="border-r-4 border-r-primary/40 pr-3 py-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-secondary text-secondary-foreground">
                        {AMENDMENT_OPERATION_LABELS[op.operationType] || op.operationType}
                      </Badge>
                      {op.targetArticle && (
                        <Badge variant="outline" className="article-number">
                          مادة {op.targetArticle.publishedNumber}
                        </Badge>
                      )}
                      {op.newArticleNumber && (
                        <Badge variant="outline" className="article-number text-emerald-700 bg-emerald-50 border-emerald-200">
                          مادة جديدة {op.newArticleNumber}
                        </Badge>
                      )}
                    </div>
                    <p className="legal-text text-sm">{op.newText}</p>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

function AttachmentsTab({ slug, attachments }: { slug: string; attachments: any[] }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/legislations/${slug}/attachments`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return <Skeleton className="h-64 rounded-xl" />

  const items = data?.items || attachments || []

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <LayoutGrid className="h-10 w-10 mx-auto mb-2 opacity-50" />
          لا توجد ملاحق منشورة لهذا التشريع
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            تشمل الملاحق: اللوائح التنفيذية، الجداول، النماذج، الخرائط، التعاريف،
            القوائم، والتصحيحات، مع عرض محتواها ومصادرها.
          </p>
        </CardContent>
      </Card>
      {items.map((att: any) => (
        <Card key={att.id} className="overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === att.id ? null : att.id)}
            className="w-full text-right p-4 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className="bg-primary text-primary-foreground">
                    {ATTACHMENT_TYPE_LABELS[att.attachmentType] || att.attachmentType}
                  </Badge>
                  <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                    منشور
                  </Badge>
                  {att.contentType === 'table' && (
                    <Badge variant="outline" className="bg-muted/50">
                      <LayoutGrid className="h-3 w-3 ml-1" />
                      جدول
                    </Badge>
                  )}
                  {att.contentType === 'file' && (
                    <Badge variant="outline" className="bg-muted/50">
                      <FileText className="h-3 w-3 ml-1" />
                      ملف
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-base">{att.title}</h3>
              </div>
              {expanded === att.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </button>
          {expanded === att.id && (
            <CardContent className="border-t bg-muted/20 p-4">
              {att.textContent && (
                <p className="legal-text text-sm mb-4">{att.textContent}</p>
              )}
              {att.tableContent && att.contentType === 'table' && (
                <TableView tableContent={att.tableContent} />
              )}
              {att.contentType === 'file' && (
                <div className="flex items-center justify-center py-12 border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground mb-3">ملف مرفق</p>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 ml-1.5" />
                      تنزيل الملف
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

function TableView({ tableContent }: { tableContent: string }) {
  let table: { columns: string[]; rows: string[][] } = { columns: [], rows: [] }
  try {
    table = JSON.parse(tableContent)
  } catch {
    return <p className="text-sm text-destructive">خطأ في صيغة الجدول</p>
  }
  if (!table.columns || !table.rows) return null

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary/10">
          <tr>
            {table.columns.map((c, i) => (
              <th key={i} className="text-right p-2 font-semibold border-b border-border">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/30 border-b border-border/40">
              {row.map((cell, j) => (
                <td key={j} className="p-2 border-l border-border/40 last:border-l-0 article-number">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RelationsTab({ slug }: { slug: string }) {
  const [data, setData] = useState<RelationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/legislations/${slug}/relations`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return <Skeleton className="h-64 rounded-xl" />

  if (!data || (data.outgoing.length === 0 && data.incoming.length === 0)) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Network className="h-10 w-10 mx-auto mb-2 opacity-50" />
          لا توجد علاقات قانونية مسجلة
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            العلاقات القانونية الموجهة: يُعدِّل، يُلغي، يُنفِّذ، يُستند إلى، يُحيل إلى،
            يُصحح، مرتبط موضوعيًا — مع عرض الاتجاه العكسي بصياغة مناسبة.
          </p>
        </CardContent>
      </Card>

      {data.outgoing.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            العلاقات الصادرة
          </h3>
          <div className="space-y-2">
            {data.outgoing.map((r) => {
              const rel = RELATION_TYPE_LABELS[r.relationType] || { fromLabel: r.relationType, toLabel: r.relationType }
              return (
                <Card key={r.id} className="border-border/60">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Badge className="bg-secondary text-secondary-foreground">
                      {rel.fromLabel}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => useAppStore.getState().openLegislation(r.toLegislation.slug)}
                        className="text-sm font-medium hover:text-primary truncate"
                      >
                        {r.toLegislation.officialTitle}
                      </button>
                      <div className="text-[11px] text-muted-foreground">
                        {r.toLegislation.type?.nameAr} • {formatYear(r.toLegislation.year)}
                      </div>
                    </div>
                    {r.evidence && (
                      <Badge variant="outline" className="text-[11px]">
                        {r.evidence}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {data.incoming.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary rotate-180" />
            العلاقات الواردة
          </h3>
          <div className="space-y-2">
            {data.incoming.map((r) => {
              const rel = RELATION_TYPE_LABELS[r.relationType] || { fromLabel: r.relationType, toLabel: r.relationType }
              return (
                <Card key={r.id} className="border-border/60">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Badge variant="outline" className="bg-muted">
                      {rel.toLabel}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => useAppStore.getState().openLegislation(r.fromLegislation.slug)}
                        className="text-sm font-medium hover:text-primary truncate"
                      >
                        {r.fromLegislation.officialTitle}
                      </button>
                      <div className="text-[11px] text-muted-foreground">
                        {r.fromLegislation.type?.nameAr} • {formatYear(r.fromLegislation.year)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function SourcesTab({ data }: { data: LegislationDetail }) {
  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            المصادر الأصلية للنص القانوني: الجريدة الرسمية، النسخ الإلكترونية،
            الوثائق الإثباتية. كل مصدر له مستوى تحقق مستقل.
          </p>
        </CardContent>
      </Card>

      {data.sources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            لا توجد مصادر مسجلة
          </CardContent>
        </Card>
      ) : (
        data.sources.map((s: any) => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">{s.source?.name || s.source?.originalName}</h3>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>النوع: {s.source?.mimeType}</div>
                    <div>الحجم: {s.source?.size?.toLocaleString('ar-EG')} بايت</div>
                    <div>تاريخ الاستلام: {formatDate(s.source?.receivedAt)}</div>
                    <div>مستوى التحقق: {
                      VERIFICATION_LABELS[s.source?.verificationLevel]?.label || s.source?.verificationLevel
                    }</div>
                  </div>
                </div>
                <Badge variant="outline" className={
                  s.role === 'extraction' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                  s.role === 'evidence' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                  s.role === 'display' ? 'text-purple-700 bg-purple-50 border-purple-200' :
                  'text-amber-700 bg-amber-50 border-amber-200'
                }>
                  {s.role === 'extraction' ? 'استخراج' :
                   s.role === 'evidence' ? 'إثبات' :
                   s.role === 'display' ? 'عرض' :
                   s.role === 'download' ? 'تنزيل' : s.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {data.officialJournals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              الجريدة الرسمية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.officialJournals.map((j) => (
              <div key={j.id} className="flex flex-wrap items-center gap-3 text-sm border-b border-border/40 pb-2 last:border-b-0">
                <Badge variant="outline">
                  <BookOpen className="h-3 w-3 ml-1" />
                  العدد {j.journalNumber || '—'}
                </Badge>
                {j.issueNumber && (
                  <span className="text-xs text-muted-foreground">
                    إصدار {j.issueNumber}
                  </span>
                )}
                {j.pageFrom && (
                  <span className="text-xs text-muted-foreground">
                    صفحات {j.pageFrom}{j.pageTo ? `-${j.pageTo}` : ''}
                  </span>
                )}
                {j.publicationDate && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(j.publicationDate)}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/30 py-1.5 last:border-b-0">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-sm article-number">{value}</span>
    </div>
  )
}
