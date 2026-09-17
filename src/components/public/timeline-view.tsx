'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  Scale,
  ChevronLeft,
  GitBranch,
  Clock,
  ArrowLeft,
  Milestone,
  FileText,
} from 'lucide-react'
import { LEGAL_STATUS_LABELS, formatDate, formatYear } from '@/lib/constants'
import { Breadcrumb } from '@/components/common/breadcrumb'

interface TimelineItem {
  id: string
  slug: string
  officialTitle: string
  shortTitle: string | null
  year: number | null
  issueDate: string | null
  publicationDate: string | null
  effectiveDate: string | null
  legalStatus: string
  type: { nameAr: string; code: string } | null
  authority: { nameAr: string; code: string } | null
  hasAmendments: boolean
}

export function TimelineView() {
  const openLegislation = useAppStore((s) => s.openLegislation)
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/legislations?pageSize=100')
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Group by year
  const byYear = useMemo(() => {
    const map = new Map<number, TimelineItem[]>()
    items.forEach((item) => {
      const year = item.year || 0
      if (!map.has(year)) map.set(year, [])
      map.get(year)!.push(item)
    })
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0])
  }, [items])

  const years = byYear.map(([year]) => year)
  const filtered = selectedYear
    ? byYear.filter(([year]) => year === selectedYear)
    : byYear

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-4">
        <Breadcrumb />
        <Skeleton className="h-12 w-1/3" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary mb-2 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#AC4459] to-[#344B61] flex items-center justify-center">
            <Milestone className="h-5 w-5 text-white" />
          </div>
          الخط الزمني للتشريعات
        </h1>
        <p className="text-sm text-muted-foreground">
          استعراض جميع التشريعات اليمنية مرتبة زمنيًا حسب سنة الإصدار
        </p>
      </div>

      {/* Year filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedYear(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedYear === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-primary/10 hover:text-primary border border-border'
          }`}
        >
          الكل
          <span className="mr-1.5 opacity-70 article-number">({items.length.toLocaleString('ar-EG')})</span>
        </button>
        {years.map((year) => {
          const count = byYear.find(([y]) => y === year)?.[1].length || 0
          return (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedYear === year
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-primary/10 hover:text-primary border border-border'
              }`}
            >
              {year > 0 ? formatYear(year) : 'غير محدد'}
              <span className="mr-1.5 opacity-70 article-number">({count.toLocaleString('ar-EG')})</span>
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute right-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-transparent" />

        <div className="space-y-6">
          {filtered.map(([year, yearItems]) => (
            <div key={year} className="relative pr-12">
              {/* Year marker */}
              <div className="absolute right-0 top-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs shadow-md z-10">
                {year > 0 ? formatYear(year) : '?'}
              </div>

              {/* Year header */}
              <div className="mb-3 pb-2 border-b border-border/40">
                <h2 className="text-lg font-bold text-secondary">
                  سنة {year > 0 ? formatYear(year) : 'غير محددة'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {yearItems.length.toLocaleString('ar-EG')} تشريع
                </p>
              </div>

              {/* Legislation cards */}
              <div className="space-y-2">
                {yearItems.map((item, idx) => {
                  const status = LEGAL_STATUS_LABELS[item.legalStatus] || LEGAL_STATUS_LABELS.active
                  return (
                    <button
                      key={item.id}
                      onClick={() => openLegislation(item.slug)}
                      className="group w-full flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3 hover:border-primary/40 hover:shadow-sm card-lift text-right transition-all animate-fade-in-up"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Scale className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-primary/5">
                            {item.type?.nameAr || '—'}
                          </Badge>
                          <Badge variant="outline" className={`text-[9px] py-0 px-1.5 ${status.color}`}>
                            {status.label}
                          </Badge>
                          {item.hasAmendments && (
                            <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-amber-700 bg-amber-50 border-amber-200">
                              معدَّل
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {item.shortTitle || item.officialTitle}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          {item.authority?.nameAr && (
                            <span>{item.authority.nameAr}</span>
                          )}
                          {item.publicationDate && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Calendar className="h-2.5 w-2.5" />
                                {formatDate(item.publicationDate)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {items.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-semibold mb-1">لا توجد تشريعات</p>
            <p className="text-sm text-muted-foreground">لم يتم العثور على تشريعات لعرضها</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
