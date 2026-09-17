'use client'

import * as React from 'react'
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  FileText,
  ChevronLeft,
  CalendarDays,
  UserCheck,
  GitBranch,
  FileX2,
  RefreshCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AMENDMENT_OPERATION_LABELS,
  formatDateShort,
  relativeTime,
} from '@/lib/constants'
import { arNum, EmptyState, ErrorState, SectionHeader } from '../admin-shared'

interface Resp {
  items: any[]
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'مسودة', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  in_review: { label: 'قيد المراجعة', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  approved: { label: 'معتمد', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  applied: { label: 'مطبّق', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  rejected: { label: 'مرفوض', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  archived: { label: 'مؤرشف', color: 'text-slate-600 bg-slate-100 border-slate-200' },
}

function OperationsList({ count, docId }: { count: number; docId: string }) {
  return (
    <div className="space-y-2 mt-3 border-t pt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-muted-foreground">
          قائمة العمليات ({arNum(count)})
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() =>
            toast.info('قريبًا', {
              description: 'عرض تفاصيل العمليات الفردية قيد التطوير',
            })
          }
        >
          عرض التفاصيل
        </Button>
      </div>
      {count === 0 ? (
        <p className="text-xs text-muted-foreground">لا توجد عمليات مسجّلة.</p>
      ) : (
        <ul className="space-y-1.5">
          {Object.keys(AMENDMENT_OPERATION_LABELS).slice(0, Math.min(count, 3)).map((op, i) => (
            <li
              key={op}
              className="flex items-center gap-2 text-xs rounded-md border px-2.5 py-1.5 bg-muted/30"
            >
              <Badge variant="outline" className="text-[10px]">
                #{arNum(i + 1)}
              </Badge>
              <span className="text-muted-foreground">{AMENDMENT_OPERATION_LABELS[op]}</span>
              <span className="text-muted-foreground/70 mr-auto truncate">
                {docId.slice(0, 12)}…
              </span>
            </li>
          ))}
          {count > 3 && (
            <li className="text-xs text-muted-foreground text-center">
              + {arNum(count - 3)} عمليات أخرى
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

function AmendmentCard({ doc }: { doc: any }) {
  const [open, setOpen] = React.useState(false)
  const status = STATUS_LABELS[doc.status] || { label: doc.status, color: '' }
  const target = doc.targetLegislation
  const source = doc.sourceLegislation

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-sm line-clamp-1">{doc.title}</h3>
              <Badge variant="outline" className={status.color}>
                {status.label}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {doc.number && <span>رقم: {doc.number}</span>}
              {doc.year && <span>سنة: {arNum(doc.year)}</span>}
              <span>العمليات: {arNum(doc._count?.operations ?? doc.operationCount ?? 0)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {target && (
                <Badge variant="secondary" className="gap-1">
                  <GitBranch className="size-3" />
                  مستهدف: {(target.shortTitle || target.officialTitle || '').slice(0, 30)}
                </Badge>
              )}
              {source && (
                <Badge variant="outline" className="gap-1">
                  مصدر: {(source.shortTitle || source.officialTitle || '').slice(0, 30)}
                </Badge>
              )}
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronLeft
                className={`size-4 transition-transform ${open ? '-rotate-90' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

          <CollapsibleContent className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 border-t pt-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-0.5">تاريخ الإصدار</p>
                <p className="font-medium">{formatDateShort(doc.issueDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">تاريخ النفاذ</p>
                <p className="font-medium">{formatDateShort(doc.effectiveDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5 flex items-center gap-1">
                  <UserCheck className="size-3" /> المراجِع
                </p>
                <p className="font-medium line-clamp-1">
                  {doc.reviewedBy?.fullName || doc.reviewedBy?.username || '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5 flex items-center gap-1">
                  <UserCheck className="size-3" /> المُطبِّق
                </p>
                <p className="font-medium line-clamp-1">
                  {doc.appliedBy?.fullName || doc.appliedBy?.username || '—'}
                </p>
              </div>
            </div>
            {doc.description && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                <p className="font-medium text-foreground mb-0.5">الوصف:</p>
                <p className="line-clamp-3">{doc.description}</p>
              </div>
            )}
            <OperationsList
              count={doc._count?.operations ?? doc.operationCount ?? 0}
              docId={doc.id}
            />
          </CollapsibleContent>
      </CardContent>
    </Card>
    </Collapsible>
  )
}

export function AmendmentsSection() {
  const [data, setData] = React.useState<Resp | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<string>('all')

  React.useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    const url = `/api/admin/amendments${params.toString() ? '?' + params.toString() : ''}`
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل وثائق التعديل')
        setLoading(false)
      })
  }, [status])

  function reload() {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    const url = `/api/admin/amendments${params.toString() ? '?' + params.toString() : ''}`
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل وثائق التعديل')
        setLoading(false)
      })
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="وثائق التعديل"
        description="استعراض وثائق تعديل التشريعات وحالتها"
        action={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={reload}
              disabled={loading}
            >
              <RefreshCcw className={loading ? 'size-4 animate-spin' : 'size-4'} />
              تحديث
            </Button>
            <Button
              size="sm"
              onClick={() => toast.info('قريبًا', { description: 'إنشاء وثيقة تعديل جديدة' })}
            >
              <FileText className="size-4" />
              وثيقة تعديل جديدة
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-sm text-muted-foreground">تصفية حسب الحالة:</span>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="in_review">قيد المراجعة</SelectItem>
              <SelectItem value="approved">معتمد</SelectItem>
              <SelectItem value="applied">مطبّق</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
              <SelectItem value="archived">مؤرشف</SelectItem>
            </SelectContent>
          </Select>
          {data && (
            <span className="text-xs text-muted-foreground sm:mr-auto">
              الإجمالي: <span className="font-semibold">{arNum(data.items.length)}</span>
            </span>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={FileX2}
          title="لا توجد وثائق تعديل"
          description="لم يتم العثور على وثائق تعديل مطابقة لعوامل التصفية الحالية."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.items.map((doc: any) => (
            <AmendmentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  )
}
