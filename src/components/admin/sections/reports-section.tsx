'use client'

import * as React from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FlagTriangleRight,
  AlertOctagon,
  AlertTriangle,
  Info,
  Flame,
  CheckCircle2,
  Eye,
  XCircle,
  Cog,
  RefreshCcw,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { relativeTime } from '@/lib/constants'
import { arNum, EmptyState, ErrorState, SectionHeader } from '../admin-shared'

interface Resp {
  items: any[]
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: 'مفتوح', color: 'text-rose-700 bg-rose-50 border-rose-200', icon: FlagTriangleRight },
  processing: { label: 'قيد المعالجة', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Cog },
  ignored: { label: 'متجاهَل', color: 'text-slate-700 bg-slate-50 border-slate-200', icon: XCircle },
  resolved: { label: 'محلول', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
}

const SEVERITY_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  info: { label: 'معلومة', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Info },
  warning: { label: 'تحذير', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: AlertTriangle },
  error: { label: 'خطأ', color: 'text-rose-700 bg-rose-50 border-rose-200', icon: AlertOctagon },
  critical: { label: 'حرج', color: 'text-rose-800 bg-rose-100 border-rose-300', icon: Flame },
}

const REPORT_TYPES: Record<string, string> = {
  missing_source: 'مصدر مفقود',
  incomplete_dates: 'تواريخ ناقصة',
  conflicting_periods: 'فترات متعارضة',
  broken_reference: 'مرجع مكسور',
  unlinked_amendment: 'تعديل غير مرتبط',
  unreviewed_ocr: 'OCR غير مُراجَع',
  missing_publish_data: 'بيانات نشر مفقودة',
}

function ReportCard({ report }: { report: any }) {
  const openLegislation = useAppStore((s) => s.openLegislation)
  const sev = SEVERITY_LABELS[report.severity] || SEVERITY_LABELS.warning
  const st = STATUS_LABELS[report.status] || STATUS_LABELS.open
  const SevIcon = sev.icon
  const StIcon = st.icon

  return (
    <Card className={report.severity === 'critical' ? 'border-rose-300' : ''}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${sev.color}`}>
            <SevIcon className="size-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-sm line-clamp-1">{report.title}</h3>
              <Badge variant="outline" className={sev.color}>
                {sev.label}
              </Badge>
              <Badge variant="outline" className={st.color}>
                <StIcon className="size-3" />
                {st.label}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary">
                {REPORT_TYPES[report.reportType] || report.reportType}
              </Badge>
              <span className="text-muted-foreground">{relativeTime(report.createdAt)}</span>
            </div>
          </div>
        </div>

        {report.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
        )}

        {report.legislation && (
          <button
            className="text-xs text-primary hover:underline flex items-center gap-1"
            onClick={() => openLegislation(report.legislation.slug)}
          >
            <FileText className="size-3" />
            {report.legislation.officialTitle?.slice(0, 60)}
          </button>
        )}

        <div className="flex gap-2 border-t pt-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-28"
            onClick={() =>
              toast.info('جارٍ نقل التقرير للمعالجة', {
                description: report.title,
              })
            }
            disabled={report.status === 'processing'}
          >
            <Cog className="size-4" />
            معالجة
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 min-w-28"
            onClick={() =>
              toast.info('تم تجاهل التقرير', {
                description: report.title,
              })
            }
            disabled={report.status === 'ignored'}
          >
            <Eye className="size-4" />
            تجاهل
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1 min-w-28 bg-emerald-600 hover:bg-emerald-700"
            onClick={() =>
              toast.success('تم حل التقرير', {
                description: report.title,
              })
            }
            disabled={report.status === 'resolved'}
          >
            <CheckCircle2 className="size-4" />
            حل
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ReportsSection() {
  const [data, setData] = React.useState<Resp | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState('all')
  const [severity, setSeverity] = React.useState('all')

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    if (severity !== 'all') params.set('severity', severity)
    const url = `/api/admin/reports${params.toString() ? '?' + params.toString() : ''}`
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل التقارير')
        setLoading(false)
      })
  }, [status, severity])

  React.useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-4">
      <SectionHeader
        title="تقارير الجودة"
        description="استعراض ومعالجة تقارير الجودة والمشكلات المُكتشفة"
        action={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCcw className={loading ? 'size-4 animate-spin' : 'size-4'} />
            تحديث
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm text-muted-foreground">الحالة:</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="open">مفتوح</SelectItem>
                <SelectItem value="processing">قيد المعالجة</SelectItem>
                <SelectItem value="ignored">متجاهَل</SelectItem>
                <SelectItem value="resolved">محلول</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm text-muted-foreground">الخطورة:</span>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="الخطورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="info">معلومة</SelectItem>
                <SelectItem value="warning">تحذير</SelectItem>
                <SelectItem value="error">خطأ</SelectItem>
                <SelectItem value="critical">حرج</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {data && (
            <span className="text-xs text-muted-foreground">
              الإجمالي: <span className="font-semibold">{arNum(data.items.length)}</span>
            </span>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="لا توجد تقارير مطابقة"
          description="كل التقارير الحالية تمت معالجتها أو لا توجد مشكلات مطابقة لعوامل التصفية."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((r: any) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  )
}
