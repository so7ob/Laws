'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  SplitSquareHorizontal,
  Scale,
  ArrowLeftRight,
  FileText,
  Calendar,
  Building2,
  Hash,
  Tag,
  ShieldCheck,
  Files,
  Paperclip,
  GitBranch,
  Network,
  CheckCircle2,
  Loader2,
  Layers,
  ExternalLink,
} from 'lucide-react'
import {
  LEGAL_STATUS_LABELS,
  VERIFICATION_LABELS,
  formatDate,
  formatYear,
} from "@/lib/constants"
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

interface CompareSubject {
  id: string
  nameAr: string
}

interface CompareLegislation {
  id: string
  slug: string
  officialTitle: string
  shortTitle?: string | null
  number?: string | null
  year?: number | null
  issueDate?: string | null
  publicationDate?: string | null
  effectiveDate?: string | null
  legalStatus: string
  verificationLevel: string
  type?: { nameAr: string } | null
  authority?: { nameAr: string } | null
  subjects?: CompareSubject[] | null
  articleCount: number
  attachmentCount: number
  amendmentCount: number
  relationCount: number
}

interface CompareArticle {
  id: string
  publishedNumber: string | null
  sortOrder: number
  currentText: string
  currentVersion?: { effectiveFrom?: string | null; changeType?: string | null } | null
}

interface CompareResponse {
  a: CompareLegislation
  b: CompareLegislation
  articlesA: CompareArticle[]
  articlesB: CompareArticle[]
}

/* ============================================================
 * Row definition for the comparison table
 * ============================================================ */

interface CompareRow {
  icon: typeof FileText
  label: string
  valueA: string
  valueB: string
  rawA?: string
  rawB?: string
}

/* ============================================================
 * Main CompareView Component
 * ============================================================ */

export function CompareView() {
  const openLegislation = useAppStore((s) => s.openLegislation)
  const [legislations, setLegislations] = useState<LegislationLite[]>([])
  const [legislationsLoading, setLegislationsLoading] = useState(true)
  const [slugA, setSlugA] = useState<string>('')
  const [slugB, setSlugB] = useState<string>('')
  const [data, setData] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/legislations?pageSize=100')
      .then((r) => r.json())
      .then((d) => {
        setLegislations(d.items || [])
        setLegislationsLoading(false)
      })
      .catch(() => {
        setLegislationsLoading(false)
        toast.error('تعذّر تحميل قائمة التشريعات')
      })
  }, [])

  const runCompare = useCallback(() => {
    if (!slugA || !slugB) {
      toast.error('الرجاء اختيار تشريعين للمقارنة')
      return
    }
    if (slugA === slugB) {
      toast.error('لا يمكن مقارنة التشريع بنفسه. اختر تشريعين مختلفين.')
      return
    }
    setLoading(true)
    setData(null)
    fetch(`/api/compare?a=${encodeURIComponent(slugA)}&b=${encodeURIComponent(slugB)}`)
      .then((r) => {
        if (!r.ok) throw new Error('فشل تحميل المقارنة')
        return r.json()
      })
      .then((d) => {
        setData(d)
        setLoading(false)
        toast.success('تم إجراء المقارنة بنجاح')
      })
      .catch((e: any) => {
        setLoading(false)
        toast.error(e.message || 'حدث خطأ أثناء المقارنة')
      })
  }, [slugA, slugB])

  const swap = () => {
    setSlugA(slugB)
    setSlugB(slugA)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb />
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground shadow-sm">
              <SplitSquareHorizontal className="size-6" />
            </div>
            <div>
              <h1 className="font-cairo text-2xl font-bold text-foreground sm:text-3xl">
                مقارنة التشريعات
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                اختر تشريعين لإجراء مقارنة شاملة بين خصائصهما وموادهما
              </p>
            </div>
          </div>
        </header>

        {/* Picker Card */}
        <Card className="mb-6 border-border bg-card">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_auto_1fr]">
              {/* Legislation A (right in RTL) */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <span className="size-2 rounded-full bg-primary" />
                  التشريع الأول
                </label>
                <Select value={slugA} onValueChange={setSlugA} disabled={legislationsLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={legislationsLoading ? 'جارٍ التحميل...' : 'اختر التشريع الأول'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {legislations.map((l) => (
                      <SelectItem key={l.id} value={l.slug}>
                        <span className="truncate">{l.officialTitle}</span>
                        {l.year ? (
                          <span className="mr-2 text-xs text-muted-foreground">
                            ({formatYear(l.year)})
                          </span>
                        ) : null}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swap button */}
              <div className="flex justify-center md:pb-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swap}
                  disabled={!slugA || !slugB}
                  className="rounded-full border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="تبديل التشريعين"
                  title="تبديل التشريعين"
                >
                  <ArrowLeftRight className="size-4" />
                </Button>
              </div>

              {/* Legislation B (left in RTL) */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <span className="size-2 rounded-full bg-secondary" />
                  التشريع الثاني
                </label>
                <Select value={slugB} onValueChange={setSlugB} disabled={legislationsLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={legislationsLoading ? 'جارٍ التحميل...' : 'اختر التشريع الثاني'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {legislations.map((l) => (
                      <SelectItem key={l.id} value={l.slug}>
                        <span className="truncate">{l.officialTitle}</span>
                        {l.year ? (
                          <span className="mr-2 text-xs text-muted-foreground">
                            ({formatYear(l.year)})
                          </span>
                        ) : null}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                <Scale className="ml-1 inline size-3.5 align-text-bottom" />
                تظهر الفروقات بين التشريعين مميّزة بخلفية صفراء فاتحة.
              </p>
              <Button
                onClick={runCompare}
                disabled={loading || !slugA || !slugB}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:self-end"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <SplitSquareHorizontal className="size-4" />
                )}
                {loading ? 'جارٍ المقارنة...' : 'مقارنة'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Body: empty state, loading, or comparison */}
        {!data && !loading && (
          <EmptyCompareState />
        )}

        {loading && <LoadingCompare />}

        {data && !loading && (
          <ComparisonResult data={data} openLegislation={openLegislation} />
        )}
      </div>
    </div>
  )
}

/* ============================================================
 * Empty state
 * ============================================================ */

function EmptyCompareState() {
  return (
    <Card className="border-dashed border-2 bg-muted/20">
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <div className="relative flex size-20 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-primary/10" />
          <SplitSquareHorizontal className="size-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-cairo text-xl font-semibold text-foreground">
            اختر تشريعين للمقارنة
          </h3>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            استخدم القائمتين أعلاه لاختيار تشريعين من قاعدة بيانات التشريعات اليمنية، ثم اضغط زر «مقارنة» لعرض الجدول التفصيلي والمواد المتشابهة بينهما.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Badge variant="outline" className="gap-1.5">
            <FileText className="size-3.5" />
            ١٣ خاصية قابلة للمقارنة
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <Layers className="size-3.5" />
            مطابقة المواد حسب الرقم
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <ArrowLeftRight className="size-3.5" />
            تبديل فوري بين التشريعين
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

/* ============================================================
 * Loading state
 * ============================================================ */

function LoadingCompare() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 13 }).map((_, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 py-2">
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

/* ============================================================
 * Comparison result (table + matching articles)
 * ============================================================ */

function ComparisonResult({
  data,
  openLegislation,
}: {
  data: CompareResponse
  openLegislation: (slug: string) => void
}) {
  const { a, b, articlesA, articlesB } = data

  // Build comparison rows
  const rows: CompareRow[] = [
    {
      icon: FileText,
      label: 'العنوان الرسمي',
      valueA: a.officialTitle || '—',
      valueB: b.officialTitle || '—',
    },
    {
      icon: Tag,
      label: 'النوع',
      valueA: a.type?.nameAr || '—',
      valueB: b.type?.nameAr || '—',
    },
    {
      icon: Hash,
      label: 'الرقم / السنة',
      valueA:
        (a.number || '—') + (a.year ? ` / ${formatYear(a.year)}` : ''),
      valueB:
        (b.number || '—') + (b.year ? ` / ${formatYear(b.year)}` : ''),
    },
    {
      icon: Building2,
      label: 'جهة الإصدار',
      valueA: a.authority?.nameAr || '—',
      valueB: b.authority?.nameAr || '—',
    },
    {
      icon: Calendar,
      label: 'تاريخ الإصدار',
      valueA: formatDate(a.issueDate),
      valueB: formatDate(b.issueDate),
      rawA: a.issueDate || '',
      rawB: b.issueDate || '',
    },
    {
      icon: Calendar,
      label: 'تاريخ النشر',
      valueA: formatDate(a.publicationDate),
      valueB: formatDate(b.publicationDate),
      rawA: a.publicationDate || '',
      rawB: b.publicationDate || '',
    },
    {
      icon: Calendar,
      label: 'تاريخ النفاذ',
      valueA: formatDate(a.effectiveDate),
      valueB: formatDate(b.effectiveDate),
      rawA: a.effectiveDate || '',
      rawB: b.effectiveDate || '',
    },
    {
      icon: ShieldCheck,
      label: 'الحالة القانونية',
      valueA: LEGAL_STATUS_LABELS[a.legalStatus]?.label || a.legalStatus || '—',
      valueB: LEGAL_STATUS_LABELS[b.legalStatus]?.label || b.legalStatus || '—',
      rawA: a.legalStatus,
      rawB: b.legalStatus,
    },
    {
      icon: ShieldCheck,
      label: 'مستوى التحقق',
      valueA: VERIFICATION_LABELS[a.verificationLevel]?.label || a.verificationLevel || '—',
      valueB: VERIFICATION_LABELS[b.verificationLevel]?.label || b.verificationLevel || '—',
      rawA: a.verificationLevel,
      rawB: b.verificationLevel,
    },
    {
      icon: FileText,
      label: 'عدد المواد',
      valueA: a.articleCount.toLocaleString('ar-EG'),
      valueB: b.articleCount.toLocaleString('ar-EG'),
      rawA: String(a.articleCount),
      rawB: String(b.articleCount),
    },
    {
      icon: Paperclip,
      label: 'عدد الملاحق',
      valueA: a.attachmentCount.toLocaleString('ar-EG'),
      valueB: b.attachmentCount.toLocaleString('ar-EG'),
      rawA: String(a.attachmentCount),
      rawB: String(b.attachmentCount),
    },
    {
      icon: Files,
      label: 'عدد التعديلات',
      valueA: a.amendmentCount.toLocaleString('ar-EG'),
      valueB: b.amendmentCount.toLocaleString('ar-EG'),
      rawA: String(a.amendmentCount),
      rawB: String(b.amendmentCount),
    },
    {
      icon: GitBranch,
      label: 'عدد العلاقات',
      valueA: a.relationCount.toLocaleString('ar-EG'),
      valueB: b.relationCount.toLocaleString('ar-EG'),
      rawA: String(a.relationCount),
      rawB: String(b.relationCount),
    },
  ]

  // Subjects row (special: join names with comma)
  const subjectsA = (a.subjects || []).map((s) => s.nameAr).join('، ') || '—'
  const subjectsB = (b.subjects || []).map((s) => s.nameAr).join('، ') || '—'
  rows.push({
    icon: Network,
    label: 'الموضوعات',
    valueA: subjectsA,
    valueB: subjectsB,
  })

  // Find matching articles by publishedNumber
  const mapA = new Map<string, CompareArticle>()
  for (const art of articlesA) {
    if (art.publishedNumber) mapA.set(art.publishedNumber, art)
  }
  const matched: { num: string; a: CompareArticle; b: CompareArticle }[] = []
  for (const art of articlesB) {
    if (art.publishedNumber && mapA.has(art.publishedNumber)) {
      matched.push({ num: art.publishedNumber, a: mapA.get(art.publishedNumber)!, b: art })
    }
  }
  // Sort by numeric value of publishedNumber if possible
  matched.sort((x, y) => {
    const nx = parseInt(x.num, 10)
    const ny = parseInt(y.num, 10)
    if (!isNaN(nx) && !isNaN(ny)) return nx - ny
    return x.num.localeCompare(y.num, 'ar')
  })

  // Summary stats
  const diffCount = rows.filter(
    (r) => (r.rawA ?? r.valueA) !== (r.rawB ?? r.valueB)
  ).length

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scale className="size-5" />
            </div>
            <div>
              <p className="font-cairo text-sm font-semibold text-foreground">
                نتيجة المقارنة
              </p>
              <p className="text-xs text-muted-foreground">
                تم العثور على {diffCount.toLocaleString('ar-EG')} اختلاف من أصل{' '}
                {rows.length.toLocaleString('ar-EG')} خاصية
                {matched.length > 0 && (
                  <>
                    {' '}و {matched.length.toLocaleString('ar-EG')} مادة مشتركة بالرقم
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => openLegislation(a.slug)}
            >
              <ExternalLink className="size-4" />
              فتح التشريع الأول
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-secondary/30 text-secondary hover:bg-secondary/10"
              onClick={() => openLegislation(b.slug)}
            >
              <ExternalLink className="size-4" />
              فتح التشريع الثاني
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparison table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/40 pb-3">
          <CardTitle className="font-cairo text-base">
            جدول المقارنة التفصيلي
          </CardTitle>
          <CardDescription className="text-xs">
            الخلايا المظللة بالأصفر الفاتح تشير إلى اختلاف القيم بين التشريعين.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop / tablet: 3-column table */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-[28%] px-4 py-3 text-right font-medium text-muted-foreground">
                    الخاصية
                  </th>
                  <th className="w-[36%] border-r border-l border-border px-4 py-3 text-right">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-primary" />
                      <span className="line-clamp-2 font-cairo font-semibold text-foreground">
                        {a.shortTitle || a.officialTitle}
                      </span>
                    </div>
                  </th>
                  <th className="w-[36%] px-4 py-3 text-right">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-secondary" />
                      <span className="line-clamp-2 font-cairo font-semibold text-foreground">
                        {b.shortTitle || b.officialTitle}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const diff =
                    (row.rawA ?? row.valueA) !== (row.rawB ?? row.valueB)
                  const Icon = row.icon
                  return (
                    <tr
                      key={i}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon className="size-4 shrink-0" />
                          <span className="font-medium text-foreground">
                            {row.label}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`border-r border-l border-border px-4 py-3 align-top ${
                          diff ? 'bg-amber-50/70' : ''
                        }`}
                      >
                        <span className="text-foreground">{row.valueA}</span>
                      </td>
                      <td
                        className={`px-4 py-3 align-top ${
                          diff ? 'bg-amber-50/70' : ''
                        }`}
                      >
                        <span className="text-foreground">{row.valueB}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <div className="divide-y divide-border md:hidden">
            {rows.map((row, i) => {
              const diff = (row.rawA ?? row.valueA) !== (row.rawB ?? row.valueB)
              const Icon = row.icon
              return (
                <div key={i} className="p-4">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <Icon className="size-4 shrink-0" />
                    <span className="font-medium text-foreground">{row.label}</span>
                    {diff && (
                      <Badge variant="outline" className="ml-auto border-amber-300 bg-amber-50 text-amber-700 text-[10px]">
                        اختلاف
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`rounded-md p-2 text-xs ${
                        diff ? 'bg-amber-50/70' : 'bg-muted/40'
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-primary" />
                        الأول
                      </div>
                      <div className="text-foreground">{row.valueA}</div>
                    </div>
                    <div
                      className={`rounded-md p-2 text-xs ${
                        diff ? 'bg-amber-50/70' : 'bg-muted/40'
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-secondary" />
                        الثاني
                      </div>
                      <div className="text-foreground">{row.valueB}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Matching articles section */}
      <Card>
        <CardHeader className="bg-muted/40 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 font-cairo text-base">
                <Layers className="size-4 text-primary" />
                مواد متشابهة
              </CardTitle>
              <CardDescription className="text-xs">
                المواد التي تحمل نفس الرقم المنشور في كلا التشريعين، معروضة جنبًا إلى جنب.
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              {matched.length.toLocaleString('ar-EG')} مادة مطابقة
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          {matched.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Layers className="size-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-cairo text-sm font-medium text-foreground">
                  لا توجد مواد مشتركة بالرقم
                </p>
                <p className="text-xs text-muted-foreground">
                  لا يوجد تطابق في أرقام المواد المنشورة بين التشريعين.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header row */}
              <div className="grid grid-cols-[auto_1fr_1fr] gap-3 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
                <div className="w-12 text-center">المادة</div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary" />
                  {a.shortTitle || 'التشريع الأول'}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-secondary" />
                  {b.shortTitle || 'التشريع الثاني'}
                </div>
              </div>
              {/* Article rows */}
              <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                {matched.map(({ num, a: artA, b: artB }) => {
                  const textA = artA.currentText?.trim() || '—'
                  const textB = artB.currentText?.trim() || '—'
                  const same = textA === textB
                  return (
                    <div
                      key={num}
                      className="grid grid-cols-[auto_1fr_1fr] gap-3 rounded-lg border border-border/60 bg-card p-3"
                    >
                      <div className="flex w-12 items-start justify-center pt-1">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs"
                        >
                          {num}
                        </Badge>
                      </div>
                      <div
                        className={`rounded-md p-2 text-xs leading-relaxed ${
                          same ? 'bg-emerald-50/40' : 'bg-amber-50/40'
                        }`}
                      >
                        <p className="text-foreground">{textA}</p>
                        {artA.currentVersion?.changeType &&
                          artA.currentVersion.changeType !== 'initial' && (
                            <p className="mt-1.5 text-[10px] text-muted-foreground">
                              نوع التغيير:{' '}
                              {artA.currentVersion.changeType}
                            </p>
                          )}
                      </div>
                      <div
                        className={`rounded-md p-2 text-xs leading-relaxed ${
                          same ? 'bg-emerald-50/40' : 'bg-amber-50/40'
                        }`}
                      >
                        <p className="text-foreground">{textB}</p>
                        {artB.currentVersion?.changeType &&
                          artB.currentVersion.changeType !== 'initial' && (
                            <p className="mt-1.5 text-[10px] text-muted-foreground">
                              نوع التغيير:{' '}
                              {artB.currentVersion.changeType}
                            </p>
                          )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CompareView
