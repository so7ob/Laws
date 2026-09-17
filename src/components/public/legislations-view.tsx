'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Scale,
  Calendar,
  Building2,
  FileText,
  History,
  Network,
  SortAsc,
  LayoutGrid,
} from 'lucide-react'
import { LEGAL_STATUS_LABELS, VERIFICATION_LABELS, formatDateShort, formatYear } from '@/lib/constants'
import { Breadcrumb } from '@/components/common/breadcrumb'

interface ListResponse {
  items: any[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface Filters {
  types: any[]
  authorities: any[]
  subjects: any[]
  classifications: any[]
}

export function LegislationsView({ preset }: { preset?: 'recent' | 'popular' | 'archive' | 'constitution' }) {
  const openLegislation = useAppStore((s) => s.openLegislation)
  const [data, setData] = useState<ListResponse | null>(null)
  const [filters, setFilters] = useState<Filters | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [applied, setApplied] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState('publicationDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetch('/api/filters')
      .then((r) => r.json())
      .then((d) => setFilters(d))
      .catch(() => {})
  }, [])

  const fetchList = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (applied.type) params.set('type', applied.type)
    if (applied.authority) params.set('authority', applied.authority)
    if (applied.subject) params.set('subject', applied.subject)
    if (applied.legalStatus) params.set('legalStatus', applied.legalStatus)
    if (applied.verification) params.set('verification', applied.verification)
    if (applied.yearFrom) params.set('yearFrom', applied.yearFrom)
    if (applied.yearTo) params.set('yearTo', applied.yearTo)
    params.set('page', String(page))
    params.set('sortBy', sortBy)
    params.set('sortOrder', sortOrder)

    if (preset === 'constitution') {
      params.set('type', 'constitution')
    }
    if (preset === 'archive') {
      params.set('legalStatus', 'archived')
    }

    fetch(`/api/legislations?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [q, applied, page, sortBy, sortOrder, preset])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchList()
  }, [fetchList])

  const title = preset === 'constitution' ? 'الدستور' :
                preset === 'recent' ? 'أحدث التشريعات' :
                preset === 'popular' ? 'الأكثر اطلاعًا' :
                preset === 'archive' ? 'الأرشيف' :
                'كل التشريعات'

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Breadcrumb />
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary mb-2 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#AC4459] to-[#344B61] flex items-center justify-center">
            <Scale className="h-5 w-5 text-white" />
          </div>
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          استعراض التشريعات اليمنية مع إمكانية البحث والتصفية
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            placeholder="ابحث في العناوين أو الديباجة..."
            className="pr-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SortAsc className="h-4 w-4 ml-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="publicationDate">تاريخ النشر</SelectItem>
              <SelectItem value="year">السنة</SelectItem>
              <SelectItem value="officialTitle">العنوان</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortAsc className="h-4 w-4 rotate-180" />}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 ml-1.5" />
                تصفية
                {Object.keys(applied).length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 bg-primary text-primary-foreground">
                    {Object.keys(applied).length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[380px] sm:w-[420px] overflow-y-auto">
              <FilterPanel
                filters={filters}
                applied={applied}
                onChange={(k, v) => {
                  setApplied((p) => ({ ...p, [k]: v }))
                  setPage(1)
                }}
                onReset={() => {
                  setApplied({})
                  setPage(1)
                }}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active filter chips */}
      {Object.keys(applied).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(applied).map(([k, v]) => {
            const filterLabels: Record<string, string> = {
              type: 'النوع',
              authority: 'الجهة',
              subject: 'الموضوع',
              legalStatus: 'الحالة',
              verification: 'التحقق',
              yearFrom: 'من سنة',
              yearTo: 'إلى سنة',
            }
            return (
            <Badge key={k} variant="secondary" className="cursor-pointer hover:bg-destructive/20" onClick={() => {
              setApplied((p) => {
                const next = { ...p }
                delete next[k]
                return next
              })
              setPage(1)
            }}>
              {filterLabels[k] || k}: {v}
              <X className="h-3 w-3 mr-1" />
            </Badge>
            )
          })}
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <div>
          {loading ? (
            <Skeleton className="h-5 w-32" />
          ) : data ? (
            <>
              عرض{' '}
              <span className="font-semibold text-foreground article-number">
                {((data.page - 1) * data.pageSize + 1).toLocaleString('ar-EG')}
              </span>
              {' — '}
              <span className="font-semibold text-foreground article-number">
                {Math.min(data.page * data.pageSize, data.total).toLocaleString('ar-EG')}
              </span>
              {' من '}
              <span className="font-semibold text-foreground article-number">
                {data.total.toLocaleString('ar-EG')}
              </span>
              {' تشريع'}
            </>
          ) : null}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((leg) => (
            <LegislationCard key={leg.id} leg={leg} onClick={() => openLegislation(leg.slug)} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Scale className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-semibold mb-1">لا توجد تشريعات مطابقة</p>
            <p className="text-sm text-muted-foreground">جرّب تعديل معايير البحث أو التصفية</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(data.totalPages, 7) }).map((_, i) => {
              const p = i + 1
              const isActive = p === page
              return (
                <Button
                  key={p}
                  variant={isActive ? 'default' : 'outline'}
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => setPage(p)}
                >
                  <span className="article-number">{p.toLocaleString('ar-EG')}</span>
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="icon"
            disabled={page === data.totalPages}
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

function LegislationCard({ leg, onClick }: { leg: any; onClick: () => void }) {
  const status = LEGAL_STATUS_LABELS[leg.legalStatus] || LEGAL_STATUS_LABELS.active
  const verification = VERIFICATION_LABELS[leg.verificationLevel] || VERIFICATION_LABELS.unverified
  return (
    <button
      onClick={onClick}
      className="group rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-card-hover transition-all overflow-hidden text-right flex flex-col"
    >
      <div className="h-1.5 bg-gradient-to-l from-[#AC4459] to-[#344B61]" />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            {leg.type?.nameAr}
          </Badge>
          <Badge variant="secondary" className={`text-[11px] ${status.color}`}>
            {status.label}
          </Badge>
        </div>
        <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {leg.officialTitle}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
          {leg.preamble}
        </p>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-3 mb-2">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {leg.authority?.nameAr}
          </span>
          <span dir="ltr" className="article-number">
            {leg.year ? formatYear(leg.year) : '—'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <Badge variant="outline" className="bg-muted/50 border-border/60">
            <FileText className="h-3 w-3 ml-1" />
            {leg.articleCount?.toLocaleString('ar-EG')} مادة
          </Badge>
          {leg.attachmentCount > 0 && (
            <Badge variant="outline" className="bg-muted/50 border-border/60">
              <LayoutGrid className="h-3 w-3 ml-1" />
              {leg.attachmentCount?.toLocaleString('ar-EG')} ملحق
            </Badge>
          )}
          {leg.amendmentCount > 0 && (
            <Badge variant="outline" className="bg-muted/50 border-border/60">
              <History className="h-3 w-3 ml-1" />
              {leg.amendmentCount?.toLocaleString('ar-EG')} تعديل
            </Badge>
          )}
          {leg.relationCount > 0 && (
            <Badge variant="outline" className="bg-muted/50 border-border/60">
              <Network className="h-3 w-3 ml-1" />
              {leg.relationCount?.toLocaleString('ar-EG')} علاقة
            </Badge>
          )}
          <Badge variant="outline" className={`mr-auto ${verification.color}`}>
            {verification.label}
          </Badge>
        </div>
      </div>
    </button>
  )
}

function FilterPanel({
  filters,
  applied,
  onChange,
  onReset,
}: {
  filters: Filters | null
  applied: Record<string, string>
  onChange: (k: string, v: string) => void
  onReset: () => void
}) {
  return (
    <div className="space-y-6 p-2">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold">تصفية النتائج</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          إعادة تعيين
        </Button>
      </div>

      <FilterSection title="نوع التشريع">
        <Select
          value={applied.type || 'all'}
          onValueChange={(v) => onChange('type', v === 'all' ? '' : v)}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {filters?.types.map((t) => (
              <SelectItem key={t.id} value={t.code}>{t.nameAr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="جهة الإصدار">
        <Select
          value={applied.authority || 'all'}
          onValueChange={(v) => onChange('authority', v === 'all' ? '' : v)}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {filters?.authorities.map((a) => (
              <SelectItem key={a.id} value={a.code}>{a.nameAr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="الموضوع">
        <Select
          value={applied.subject || 'all'}
          onValueChange={(v) => onChange('subject', v === 'all' ? '' : v)}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {filters?.subjects.map((s) => (
              <SelectItem key={s.id} value={s.code}>{s.nameAr}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="الحالة القانونية">
        <Select
          value={applied.legalStatus || 'all'}
          onValueChange={(v) => onChange('legalStatus', v === 'all' ? '' : v)}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="active">نافذ</SelectItem>
            <SelectItem value="amended">مُعدَّل</SelectItem>
            <SelectItem value="repealed">مُلغى</SelectItem>
            <SelectItem value="archived">مؤرشف</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="مستوى التحقق">
        <Select
          value={applied.verification || 'all'}
          onValueChange={(v) => onChange('verification', v === 'all' ? '' : v)}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="verified">مُتحقق</SelectItem>
            <SelectItem value="reviewed">مُراجع</SelectItem>
            <SelectItem value="imported">مستورد</SelectItem>
            <SelectItem value="unverified">غير مُتحقق</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="السنة">
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="من"
            value={applied.yearFrom || ''}
            onChange={(e) => onChange('yearFrom', e.target.value)}
          />
          <Input
            type="number"
            placeholder="إلى"
            value={applied.yearTo || ''}
            onChange={(e) => onChange('yearTo', e.target.value)}
          />
        </div>
      </FilterSection>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{title}</label>
      {children}
    </div>
  )
}
