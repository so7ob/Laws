'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Sheet, SheetContent, SheetTrigger,
} from '@/components/ui/sheet'
import {
  Search, Filter, FileText, Scale, LayoutGrid, Download,
  ChevronLeft, Hash, Calendar, Building2, TrendingUp,
  Target, X, Sparkles, BarChart3,
} from 'lucide-react'
import { LEGAL_STATUS_LABELS, formatDateShort, highlight } from '@/lib/constants'
import { Breadcrumb } from '@/components/common/breadcrumb'

interface SearchResponse {
  items: any[]
  articleHits: any[]
  attachmentHits: any[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  aggregations: {
    types: any[]
    years: any[]
    articleHitCount: number
    attachmentHitCount: number
  }
}

export function SearchView() {
  const initialQuery = useAppStore((s) => s.searchQuery)
  const openLegislation = useAppStore((s) => s.openLegislation)
  const [data, setData] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState(initialQuery)
  const [scope, setScope] = useState<'all' | 'legislation' | 'article' | 'attachment'>('all')
  const [match, setMatch] = useState<'all' | 'any' | 'exact'>('all')
  const [page, setPage] = useState(1)
  const [applied, setApplied] = useState<Record<string, string>>({})
  const [filters, setFilters] = useState<any>(null)
  const [activeHit, setActiveHit] = useState<'legislations' | 'articles' | 'attachments'>('legislations')

  useEffect(() => {
    fetch('/api/filters')
      .then((r) => r.json())
      .then((d) => setFilters(d))
      .catch(() => {})
  }, [])

  const doSearch = useCallback(() => {
    if (!query.trim()) {
      setData(null)
      return
    }
    setLoading(true)
    const params = new URLSearchParams()
    params.set('q', query)
    params.set('scope', scope)
    params.set('match', match)
    params.set('page', String(page))
    if (applied.type) params.set('type', applied.type)
    if (applied.authority) params.set('authority', applied.authority)
    if (applied.subject) params.set('subject', applied.subject)
    if (applied.yearFrom) params.set('yearFrom', applied.yearFrom)
    if (applied.yearTo) params.set('yearTo', applied.yearTo)

    fetch(`/api/search?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
        // Auto-pick the hit tab with results
        if (d.items?.length > 0) setActiveHit('legislations')
        else if (d.articleHits?.length > 0) setActiveHit('articles')
        else if (d.attachmentHits?.length > 0) setActiveHit('attachments')
      })
      .catch(() => setLoading(false))
  }, [query, scope, match, page, applied])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
    doSearch()
  }, [doSearch])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    doSearch()
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Breadcrumb />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary mb-2 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#AC4459] to-[#344B61] flex items-center justify-center">
            <Search className="h-5 w-5 text-white" />
          </div>
          البحث المتقدم
        </h1>
        <p className="text-sm text-muted-foreground">
          ابحث في نصوص التشريعات والمواد والملاحق مع تحليلات وتجميعات
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={onSearchSubmit} className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="عبارة حرفية، كل الكلمات، أو أي كلمة..."
            className="pr-12 h-12 text-base"
          />
        </div>
        <div className="flex gap-2">
          <Select value={scope} onValueChange={(v: any) => setScope(v)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل النطاق</SelectItem>
              <SelectItem value="legislation">التشريعات</SelectItem>
              <SelectItem value="article">المواد</SelectItem>
              <SelectItem value="attachment">الملاحق</SelectItem>
            </SelectContent>
          </Select>
          <Select value={match} onValueChange={(v: any) => setMatch(v)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الكلمات</SelectItem>
              <SelectItem value="any">أي كلمة</SelectItem>
              <SelectItem value="exact">عبارة حرفية</SelectItem>
            </SelectContent>
          </Select>
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
            <SheetContent side="right" className="w-[380px] overflow-y-auto">
              <div className="space-y-6 p-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold">تصفية النتائج</h3>
                  <Button variant="ghost" size="sm" onClick={() => setApplied({})}>
                    إعادة تعيين
                  </Button>
                </div>
                <FilterSection title="نوع التشريع">
                  <Select value={applied.type || 'all'} onValueChange={(v) => setApplied((p) => ({ ...p, type: v === 'all' ? '' : v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      {filters?.types?.map((t: any) => (
                        <SelectItem key={t.id} value={t.code}>{t.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterSection>
                <FilterSection title="جهة الإصدار">
                  <Select value={applied.authority || 'all'} onValueChange={(v) => setApplied((p) => ({ ...p, authority: v === 'all' ? '' : v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      {filters?.authorities?.map((a: any) => (
                        <SelectItem key={a.id} value={a.code}>{a.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterSection>
                <FilterSection title="الموضوع">
                  <Select value={applied.subject || 'all'} onValueChange={(v) => setApplied((p) => ({ ...p, subject: v === 'all' ? '' : v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      {filters?.subjects?.map((s: any) => (
                        <SelectItem key={s.id} value={s.code}>{s.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterSection>
                <FilterSection title="السنة">
                  <div className="flex gap-2">
                    <Input type="number" placeholder="من" value={applied.yearFrom || ''} onChange={(e) => setApplied((p) => ({ ...p, yearFrom: e.target.value }))} />
                    <Input type="number" placeholder="إلى" value={applied.yearTo || ''} onChange={(e) => setApplied((p) => ({ ...p, yearTo: e.target.value }))} />
                  </div>
                </FilterSection>
              </div>
            </SheetContent>
          </Sheet>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <Search className="h-4 w-4 ml-1.5" />
            بحث
          </Button>
        </div>
      </form>

      {/* Results */}
      {!data && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-primary/40" />
            <p className="font-semibold mb-1">ابدأ البحث الآن</p>
            <p className="text-sm text-muted-foreground">اكتب عبارة للبحث في نصوص التشريعات والمواد</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}

      {data && !loading && (
        <>
          {/* Aggregations bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <AggCard label="التشريعات" value={data.total} active={activeHit === 'legislations'} onClick={() => setActiveHit('legislations')} icon={Scale} />
            <AggCard label="المواد" value={data.aggregations.articleHitCount} active={activeHit === 'articles'} onClick={() => setActiveHit('articles')} icon={FileText} />
            <AggCard label="الملاحق" value={data.aggregations.attachmentHitCount} active={activeHit === 'attachments'} onClick={() => setActiveHit('attachments')} icon={LayoutGrid} />
            <AggCard label="إجمالي النتائج" value={data.total + data.aggregations.articleHitCount + data.aggregations.attachmentHitCount} icon={BarChart3} />
          </div>

          {/* Year aggregation */}
          {data.aggregations.years.length > 0 && (
            <Card className="mb-4">
              <CardContent className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">التوزيع حسب السنة:</span>
                  {data.aggregations.years.slice(0, 10).map((y: any) => (
                    <Badge key={y.year} variant="outline" className="article-number">
                      {y.year?.toLocaleString('ar-EG')}
                      <span className="text-[10px] text-muted-foreground mr-1">({y._count?._all || y.count})</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hit results */}
          <div className="space-y-3">
            {activeHit === 'legislations' && data.items.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-muted-foreground">
                  لا توجد تشريعات مطابقة لبحثك
                </CardContent>
              </Card>
            )}

            {activeHit === 'legislations' && data.items.map((leg) => {
              const status = LEGAL_STATUS_LABELS[leg.legalStatus] || LEGAL_STATUS_LABELS.active
              return (
                <Card key={leg.id} className="border-border/60 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => openLegislation(leg.slug)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-primary/30">{leg.type?.nameAr}</Badge>
                        <Badge variant="secondary" className={`text-[11px] ${status.color}`}>{status.label}</Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-bold text-base mb-1">{leg.officialTitle}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{leg.preamble}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{leg.authority?.nameAr}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{leg.year?.toLocaleString('ar-EG')}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{leg._count?.articles || leg.subjects?.length || 0} مادة</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {activeHit === 'articles' && data.articleHits.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-muted-foreground">
                  لا توجد مواد مطابقة لبحثك
                </CardContent>
              </Card>
            )}

            {activeHit === 'articles' && data.articleHits.map((hit) => (
              <Card key={hit.id} className="border-border/60 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => openLegislation(hit.legislation.slug)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="article-number bg-primary text-primary-foreground">مادة ({hit.articleNumber})</Badge>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      <Scale className="h-3 w-3 ml-1" />
                      {hit.legislation.shortTitle || hit.legislation.officialTitle}
                    </Badge>
                    <Badge variant="secondary" className="text-[11px]">
                      <Target className="h-3 w-3 ml-1" />
                      {hit.matchCount?.toLocaleString('ar-EG')} مطابقة
                    </Badge>
                  </div>
                  <p className="legal-text text-sm bg-muted/30 p-3 rounded-md">
                    {highlight(hit.snippet, query).map((p, i) => (
                      <span key={i} className={p.match ? 'bg-yellow-200/70 rounded px-0.5 font-semibold' : ''}>
                        {p.text}
                      </span>
                    ))}
                  </p>
                  <div className="text-[11px] text-muted-foreground mt-2">
                    {hit.legislation.type?.nameAr} • {hit.legislation.year?.toLocaleString('ar-EG')}
                  </div>
                </CardContent>
              </Card>
            ))}

            {activeHit === 'attachments' && data.attachmentHits.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-muted-foreground">
                  لا توجد ملاحق مطابقة لبحثك
                </CardContent>
              </Card>
            )}

            {activeHit === 'attachments' && data.attachmentHits.map((att) => (
              <Card key={att.id} className="border-border/60 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => openLegislation(att.legislation.slug)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-secondary text-secondary-foreground">
                      <LayoutGrid className="h-3 w-3 ml-1" />
                      ملحق
                    </Badge>
                    <span className="font-semibold text-sm">{att.title}</span>
                  </div>
                  <p className="legal-text text-sm text-muted-foreground">{att.snippet}...</p>
                  <div className="text-[11px] text-muted-foreground mt-2">
                    {att.legislation.shortTitle || att.legislation.officialTitle}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(data.totalPages, 7) }).map((_, i) => {
                const p = i + 1
                return (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="icon" className="w-9 h-9" onClick={() => setPage(p)}>
                    <span className="article-number">{p.toLocaleString('ar-EG')}</span>
                  </Button>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AggCard({ label, value, active, onClick, icon: Icon }: { label: string; value: number; active?: boolean; onClick?: () => void; icon: any }) {
  const Comp: any = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={`rounded-lg border p-3 text-right transition-all ${active ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold text-secondary article-number">{value?.toLocaleString('ar-EG') || 0}</div>
    </Comp>
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
