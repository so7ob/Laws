'use client'

import * as React from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Scale,
  FileText,
  GitBranch,
  Paperclip,
  Users,
  FlagTriangleRight,
  Upload,
  Trash2,
  BookOpen,
  Activity,
  ChevronLeft,
} from 'lucide-react'
import {
  WORKFLOW_STATUS_LABELS,
  relativeTime,
} from '@/lib/constants'
import { arNum, BarRow } from '../admin-shared'

interface KpiBlock {
  label: string
  total: number
  breakdown?: { label: string; value: number; color?: string }[]
  icon: React.ComponentType<{ className?: string }>
  tint: string
}

interface DashboardData {
  kpis: {
    legislations: { total: number; published: number; draft: number; inReview: number }
    articles: number
    amendments: { total: number; applied: number; pending: number }
    relations: { total: number; pending: number }
    attachments: { total: number; pendingReview: number }
    users: { total: number; active: number }
    reports: { open: number; critical: number }
    imports: { pending: number; completed: number }
    recycleBatches: number
  }
  charts: {
    types: { type: { id: string; nameAr: string; code: string } | null; count: number }[]
    statuses: { status: string; count: number }[]
    years: { year: number; count: number }[]
  }
  recent: {
    legislations: any[]
    auditLogs: any[]
  }
}

function KpiCard({ block }: { block: KpiBlock }) {
  const Icon = block.icon
  return (
    <Card className="group hover:shadow-md transition-shadow overflow-hidden relative">
      <CardContent className="p-4 space-y-3 relative z-10">
        <div className="flex items-start justify-between">
          <div className={`${block.tint} size-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className="size-5" />
          </div>
          <div className="text-3xl font-bold tabular-nums leading-none">
            {arNum(block.total)}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{block.label}</p>
          {block.breakdown && (
            <div className="flex flex-wrap gap-1.5 text-xs">
              {block.breakdown.map((b) => (
                <Badge key={b.label} variant="outline" className={b.color}>
                  {b.label}: {arNum(b.value)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      {/* Decorative bottom accent line */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-l from-primary/30 via-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  )
}

function RecentLegislationsTable({ items }: { items: any[] }) {
  const openLegislation = useAppStore((s) => s.openLegislation)
  if (!items.length) {
    return (
      <div className="text-sm text-muted-foreground py-6 text-center">
        لا توجد تشريعات حديثة بعد.
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>العنوان</TableHead>
          <TableHead>النوع</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>السنة</TableHead>
          <TableHead>آخر تحديث</TableHead>
          <TableHead className="w-8"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((l: any) => {
          const ws = WORKFLOW_STATUS_LABELS[l.workflowStatus] || {
            label: l.workflowStatus,
            color: '',
          }
          return (
            <TableRow key={l.id}>
              <TableCell className="max-w-xs">
                <button
                  className="text-right font-medium hover:text-primary line-clamp-1"
                  onClick={() => openLegislation(l.slug)}
                >
                  {l.shortTitle || l.officialTitle}
                </button>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{l.type?.nameAr || '—'}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={ws.color}>
                  {ws.label}
                </Badge>
              </TableCell>
              <TableCell className="tabular-nums">{arNum(l.year || 0)}</TableCell>
              <TableCell className="text-muted-foreground">
                {relativeTime(l.updatedAt)}
              </TableCell>
              <TableCell>
                <ChevronLeft
                  className="size-4 text-muted-foreground cursor-pointer hover:text-primary"
                  onClick={() => openLegislation(l.slug)}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

function RecentAuditList({ items }: { items: any[] }) {
  if (!items.length) {
    return (
      <div className="text-sm text-muted-foreground py-6 text-center">
        لا توجد سجلات تدقيق حديثة.
      </div>
    )
  }
  return (
    <ul className="space-y-2 max-h-96 overflow-y-auto pl-1">
      {items.map((log: any) => (
        <li
          key={log.id}
          className="flex items-start gap-3 rounded-md border bg-card px-3 py-2 text-sm"
        >
          <div className="size-7 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Activity className="size-3.5 text-secondary" />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium">
                {log.user?.fullName || log.user?.username || 'مستخدم محذوف'}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {log.action}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {log.resource}
              </span>
            </div>
            {log.reason && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {log.reason}
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {relativeTime(log.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function DashboardSection() {
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setLoading(true)
    setError(null)
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل لوحة المعلومات')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="py-10 text-center text-destructive font-medium">
          {error || 'تعذّر تحميل لوحة المعلومات'}
        </CardContent>
      </Card>
    )
  }

  const k = data.kpis
  const kpiBlocks: KpiBlock[] = [
    {
      label: 'التشريعات',
      total: k.legislations.total,
      icon: Scale,
      tint: 'bg-primary/10 text-primary',
      breakdown: [
        { label: 'منشور', value: k.legislations.published, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
        { label: 'مسودة', value: k.legislations.draft, color: 'text-slate-700 bg-slate-50 border-slate-200' },
        { label: 'مراجعة', value: k.legislations.inReview, color: 'text-blue-700 bg-blue-50 border-blue-200' },
      ],
    },
    { label: 'المواد', total: k.articles, icon: BookOpen, tint: 'bg-secondary/10 text-secondary' },
    {
      label: 'التعديلات',
      total: k.amendments.total,
      icon: FileText,
      tint: 'bg-amber-100 text-amber-700',
      breakdown: [
        { label: 'مطبّق', value: k.amendments.applied, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
        { label: 'معلّق', value: k.amendments.pending, color: 'text-amber-700 bg-amber-50 border-amber-200' },
      ],
    },
    {
      label: 'العلاقات',
      total: k.relations.total,
      icon: GitBranch,
      tint: 'bg-secondary/10 text-secondary',
      breakdown: [
        { label: 'معلّقة', value: k.relations.pending, color: 'text-amber-700 bg-amber-50 border-amber-200' },
      ],
    },
    {
      label: 'الملاحق',
      total: k.attachments.total,
      icon: Paperclip,
      tint: 'bg-primary/10 text-primary',
      breakdown: [
        { label: 'بانتظار المراجعة', value: k.attachments.pendingReview, color: 'text-amber-700 bg-amber-50 border-amber-200' },
      ],
    },
    {
      label: 'المستخدمون',
      total: k.users.total,
      icon: Users,
      tint: 'bg-secondary/10 text-secondary',
      breakdown: [
        { label: 'نشط', value: k.users.active, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      ],
    },
    {
      label: 'التقارير',
      total: k.reports.open,
      icon: FlagTriangleRight,
      tint: 'bg-rose-100 text-rose-700',
      breakdown: [
        { label: 'حرجة', value: k.reports.critical, color: 'text-rose-700 bg-rose-50 border-rose-200' },
      ],
    },
    {
      label: 'الاستيراد',
      total: k.imports.pending + k.imports.completed,
      icon: Upload,
      tint: 'bg-secondary/10 text-secondary',
      breakdown: [
        { label: 'معلّق', value: k.imports.pending, color: 'text-amber-700 bg-amber-50 border-amber-200' },
        { label: 'مكتمل', value: k.imports.completed, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      ],
    },
    { label: 'سلة الحذف', total: k.recycleBatches, icon: Trash2, tint: 'bg-slate-100 text-slate-700' },
  ]

  const typeMax = Math.max(1, ...data.charts.types.map((t) => t.count))
  const yearMax = Math.max(1, ...data.charts.years.map((y) => y.count))

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <section>
        <h2 className="text-base font-semibold mb-3 text-secondary">المؤشرات الرئيسية</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {kpiBlocks.map((b) => (
            <KpiCard key={b.label} block={b} />
          ))}
        </div>
      </section>

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">التشريعات حسب النوع</CardTitle>
            <CardDescription>توزيع المحتوى حسب نوع التشريع</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.charts.types.length === 0 && (
              <p className="text-sm text-muted-foreground">لا توجد بيانات.</p>
            )}
            {data.charts.types.map((t) => (
              <BarRow
                key={t.type?.id || 'unknown'}
                label={t.type?.nameAr || 'غير محدد'}
                value={t.count}
                max={typeMax}
                color="bg-primary"
              />
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">حالة سير العمل</CardTitle>
            <CardDescription>توزيع التشريعات حسب الحالة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.charts.statuses.length === 0 && (
              <p className="text-sm text-muted-foreground">لا توجد بيانات.</p>
            )}
            {data.charts.statuses.map((s) => {
              const ws = WORKFLOW_STATUS_LABELS[s.status] || {
                label: s.status,
                color: '',
              }
              return (
                <div
                  key={s.status}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <Badge variant="outline" className={ws.color}>
                    {ws.label}
                  </Badge>
                  <span className="text-lg font-bold tabular-nums">{arNum(s.count)}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">التشريعات حسب السنة</CardTitle>
            <CardDescription>آخر ١٢ سنة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 max-h-72 overflow-y-auto pl-1">
            {data.charts.years.length === 0 && (
              <p className="text-sm text-muted-foreground">لا توجد بيانات.</p>
            )}
            {data.charts.years.map((y) => (
              <BarRow
                key={y.year}
                label={arNum(y.year)}
                value={y.count}
                max={yearMax}
                color="bg-secondary"
              />
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Recent */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">أحدث التشريعات</CardTitle>
            <CardDescription>آخر ٨ تشريعات مضافة</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentLegislationsTable items={data.recent.legislations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">سجل التدقيق الأخير</CardTitle>
            <CardDescription>آخر ١٠ عمليات</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentAuditList items={data.recent.auditLogs} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
