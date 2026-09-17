'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart3,
  Scale,
  FileText,
  History,
  Network,
  BookOpen,
  TrendingUp,
  Building2,
  Gavel,
  Users,
  Calendar,
  PieChart,
  Activity,
  Award,
  Target,
} from 'lucide-react'
import { Breadcrumb } from '@/components/common/breadcrumb'

interface StatsData {
  counts: {
    legislations: number
    published: number
    articles: number
    amendments: number
    relations: number
    attachments: number
    users: number
    openReports: number
    pendingImports: number
    subjects: number
    authorities: number
  }
  breakdowns: {
    types: { type: any; count: number }[]
    years: { year: number; count: number }[]
    statuses: { status: string; count: number }[]
    verification: { level: string; count: number }[]
  }
  recent: any[]
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500',
  amended: 'bg-amber-500',
  repealed: 'bg-rose-500',
  archived: 'bg-slate-500',
}

const VERIFICATION_COLORS: Record<string, string> = {
  verified: 'bg-emerald-500',
  reviewed: 'bg-blue-500',
  imported: 'bg-amber-500',
  unverified: 'bg-rose-500',
}

export function StatsView() {
  const navigate = useAppStore((s) => s.navigate)
  const openLegislation = useAppStore((s) => s.openLegislation)
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
        <Breadcrumb />
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (!data) return null

  const totalByStatus = data.breakdowns.statuses.reduce((s, x) => s + x.count, 0) || 1
  const totalByVerification = data.breakdowns.verification.reduce((s, x) => s + x.count, 0) || 1
  const maxYear = Math.max(...data.breakdowns.years.map((y) => y.count), 1)
  const maxType = Math.max(...data.breakdowns.types.map((t) => t.count), 1)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Breadcrumb />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary mb-2 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#AC4459] to-[#344B61] flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          إحصاءات المنصة
        </h1>
        <p className="text-sm text-muted-foreground">
          نظرة شاملة على محتوى المنصة وتوزيع التشريعات والبيانات
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        <StatCard icon={Scale} label="التشريعات" value={data.counts.legislations} color="from-[#AC4459]/10 to-[#7a2f3e]/10" iconColor="text-primary" />
        <StatCard icon={FileText} label="المواد" value={data.counts.articles} color="from-[#344B61]/10 to-[#243446]/10" iconColor="text-secondary" />
        <StatCard icon={History} label="التعديلات" value={data.counts.amendments} color="from-[#8b6f47]/10 to-[#5a472f]/10" iconColor="text-[#8b6f47]" />
        <StatCard icon={Network} label="العلاقات" value={data.counts.relations} color="from-[#6b8e9e]/10 to-[#3e5e72]/10" iconColor="text-[#6b8e9e]" />
        <StatCard icon={BookOpen} label="الملاحق" value={data.counts.attachments} color="from-[#AC4459]/10 to-[#344B61]/10" iconColor="text-primary" />
        <StatCard icon={Users} label="المستخدمون" value={data.counts.users} color="from-[#5a472f]/10 to-[#3e3120]/10" iconColor="text-[#5a472f]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Types breakdown - horizontal bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              التشريعات حسب النوع
            </CardTitle>
            <CardDescription>توزيع التشريعات على الأنواع المختلفة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.breakdowns.types.map((t, i) => {
              const pct = Math.round((t.count / maxType) * 100)
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{t.type?.nameAr || 'غير محدد'}</span>
                    <span className="text-muted-foreground article-number">{t.count.toLocaleString('ar-EG')}</span>
                  </div>
                  <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-primary to-secondary rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Status breakdown - donut-like visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              الحالة القانونية
            </CardTitle>
            <CardDescription>توزيع التشريعات حسب الحالة القانونية</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Stacked bar */}
            <div className="flex h-8 rounded-full overflow-hidden mb-4 border border-border">
              {data.breakdowns.statuses.map((s, i) => {
                const pct = (s.count / totalByStatus) * 100
                const color = STATUS_COLORS[s.status] || 'bg-slate-400'
                return (
                  <div
                    key={i}
                    className={`${color} flex items-center justify-center text-xs text-white font-semibold transition-all hover:brightness-110`}
                    style={{ width: `${pct}%` }}
                    title={`${s.status}: ${s.count}`}
                  >
                    {pct > 8 && s.count.toLocaleString('ar-EG')}
                  </div>
                )
              })}
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2">
              {data.breakdowns.statuses.map((s, i) => {
                const color = STATUS_COLORS[s.status] || 'bg-slate-400'
                const label = s.status === 'active' ? 'نافذ' : s.status === 'amended' ? 'مُعدَّل' : s.status === 'repealed' ? 'مُلغى' : s.status === 'archived' ? 'مؤرشف' : s.status
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className={`h-3 w-3 rounded-full ${color}`} />
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold article-number mr-auto">{s.count.toLocaleString('ar-EG')}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Years timeline - vertical bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              التشريعات حسب السنة
            </CardTitle>
            <CardDescription>عدد التشريعات الصادرة في كل سنة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
              {data.breakdowns.years.map((y, i) => {
                const pct = (y.count / maxYear) * 100
                return (
                  <div key={i} className="flex flex-col items-center gap-1 shrink-0 group">
                    <span className="text-xs font-semibold article-number opacity-0 group-hover:opacity-100 transition-opacity">
                      {y.count.toLocaleString('ar-EG')}
                    </span>
                    <div
                      className="w-8 bg-gradient-to-t from-primary to-secondary rounded-t-md transition-all duration-500 hover:from-secondary hover:to-primary cursor-pointer"
                      style={{ height: `${pct}%`, minHeight: '4px' }}
                      title={`${y.year}: ${y.count}`}
                    />
                    <span className="text-[10px] text-muted-foreground article-number rotate-45 origin-top whitespace-nowrap">
                      {y.year?.toLocaleString('ar-EG')}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Verification breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              مستوى التحقق
            </CardTitle>
            <CardDescription>جودة البيانات حسب مستوى التحقق</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-8 rounded-full overflow-hidden mb-4 border border-border">
              {data.breakdowns.verification.map((v, i) => {
                const pct = (v.count / totalByVerification) * 100
                const color = VERIFICATION_COLORS[v.level] || 'bg-slate-400'
                return (
                  <div
                    key={i}
                    className={`${color} flex items-center justify-center text-xs text-white font-semibold transition-all hover:brightness-110`}
                    style={{ width: `${pct}%` }}
                    title={`${v.level}: ${v.count}`}
                  >
                    {pct > 10 && v.count.toLocaleString('ar-EG')}
                  </div>
                )
              })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {data.breakdowns.verification.map((v, i) => {
                const color = VERIFICATION_COLORS[v.level] || 'bg-slate-400'
                const label = v.level === 'verified' ? 'مُتحقق' : v.level === 'reviewed' ? 'مُراجع' : v.level === 'imported' ? 'مستورد' : 'غير مُتحقق'
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className={`h-3 w-3 rounded-full ${color}`} />
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold article-number mr-auto">{v.count.toLocaleString('ar-EG')}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Summary stats */}
        <Card className="bg-gradient-to-br from-secondary to-[#243446] text-white border-0">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Activity className="h-5 w-5" />
              ملخص النشاط
            </CardTitle>
            <CardDescription className="text-white/80">إحصاءات سريعة عن المنصة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow icon={Scale} label="التشريعات المنشورة" value={data.counts.published} total={data.counts.legislations} />
            <SummaryRow icon={Building2} label="الجهات المُصدِرة" value={data.counts.authorities} />
            <SummaryRow icon={Gavel} label="الموضوعات القانونية" value={data.counts.subjects} />
            <SummaryRow icon={TrendingUp} label="التقارير المفتوحة" value={data.counts.openReports} />
            <SummaryRow icon={FileText} label="الاستيرادات المعلّقة" value={data.counts.pendingImports} />
          </CardContent>
        </Card>
      </div>

      {/* Recent legislations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            أحدث التشريعات
          </CardTitle>
          <CardDescription>آخر التشريعات المُضافة للمنصة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.recent.slice(0, 6).map((leg: any, i: number) => (
              <button
                key={leg.id}
                onClick={() => openLegislation(leg.slug)}
                className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 hover:border-primary/40 hover:shadow-sm card-lift text-right transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shrink-0">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {leg.shortTitle || leg.officialTitle}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <Badge variant="outline" className="text-[9px] py-0 px-1.5">{leg.type?.nameAr}</Badge>
                    {leg.year && <span className="article-number">{leg.year.toLocaleString('ar-EG')}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, iconColor }: { icon: any; label: string; value: number; color: string; iconColor: string }) {
  return (
    <Card className={`bg-gradient-to-br ${color} border-border/60 card-lift`}>
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center mb-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="text-2xl font-bold text-secondary article-number">{value.toLocaleString('ar-EG')}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </CardContent>
    </Card>
  )
}

function SummaryRow({ icon: Icon, label, value, total }: { icon: any; label: string; value: number; total?: number }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/10 last:border-b-0">
      <div className="h-8 w-8 rounded-md bg-white/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-white/80" />
      </div>
      <span className="text-sm text-white/90">{label}</span>
      <span className="text-lg font-bold article-number mr-auto">
        {value.toLocaleString('ar-EG')}
        {total !== undefined && (
          <span className="text-xs text-white/60"> / {total.toLocaleString('ar-EG')}</span>
        )}
      </span>
    </div>
  )
}
