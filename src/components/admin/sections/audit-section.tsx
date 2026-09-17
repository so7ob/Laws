'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ScrollText,
  Search,
  ChevronRight,
  ChevronLeft,
  RefreshCcw,
  FileX2,
} from 'lucide-react'
import { relativeTime } from '@/lib/constants'
import { arNum, EmptyState, ErrorState, SectionHeader, shortId } from '../admin-shared'

interface Resp {
  items: any[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const PAGE_SIZE = 50

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  view: { label: 'عرض', color: 'text-slate-700 bg-slate-50 border-slate-200' },
  create: { label: 'إنشاء', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  edit: { label: 'تعديل', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  delete: { label: 'حذف', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  publish: { label: 'نشر', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  review: { label: 'مراجعة', color: 'text-amber-700 bg-amber-50 border-amber-200' },
}

function formatTimestamp(d: string | Date): string {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return '—'
  try {
    return (
      date.toLocaleDateString('ar-EG-u-nu-arab', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }) +
      ' ' +
      date.toLocaleTimeString('ar-EG-u-nu-arab', {
        hour: '2-digit',
        minute: '2-digit',
      })
    )
  } catch {
    return date.toLocaleString('ar-EG')
  }
}

export function AuditSection() {
  const [data, setData] = React.useState<Resp | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [resource, setResource] = React.useState('')
  const [action, setAction] = React.useState('all')
  const [page, setPage] = React.useState(1)

  const [debouncedResource, setDebouncedResource] = React.useState('')
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedResource(resource.trim()), 400)
    return () => clearTimeout(t)
  }, [resource])

  React.useEffect(() => {
    setPage(1)
  }, [debouncedResource, action])

  React.useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    })
    if (debouncedResource) params.set('resource', debouncedResource)
    if (action !== 'all') params.set('action', action)
    fetch(`/api/admin/audit?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل سجل التدقيق')
        setLoading(false)
      })
  }, [page, debouncedResource, action])

  function reload() {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    })
    if (debouncedResource) params.set('resource', debouncedResource)
    if (action !== 'all') params.set('action', action)
    fetch(`/api/admin/audit?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل سجل التدقيق')
        setLoading(false)
      })
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="سجل التدقيق"
        description="تتبع العمليات والأنشطة على المنصة"
        action={
          <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
            <RefreshCcw className={loading ? 'size-4 animate-spin' : 'size-4'} />
            تحديث
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pr-9"
              placeholder="تصفية حسب المورد (مثال: legislation, user, role)"
              value={resource}
              onChange={(e) => setResource(e.target.value)}
            />
          </div>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="الإجراء" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الإجراءات</SelectItem>
              <SelectItem value="view">عرض</SelectItem>
              <SelectItem value="create">إنشاء</SelectItem>
              <SelectItem value="edit">تعديل</SelectItem>
              <SelectItem value="delete">حذف</SelectItem>
              <SelectItem value="publish">نشر</SelectItem>
              <SelectItem value="review">مراجعة</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Data */}
      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={FileX2}
          title="لا توجد سجلات مطابقة"
          description="جرّب تعديل عوامل التصفية للعثور على سجلات."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التوقيت</TableHead>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>الإجراء</TableHead>
                    <TableHead>المورد</TableHead>
                    <TableHead>المعرّف</TableHead>
                    <TableHead>السبب</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((log: any) => {
                    const ac = ACTION_LABELS[log.action] || {
                      label: log.action,
                      color: '',
                    }
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                          {formatTimestamp(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {log.user?.fullName || '—'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {log.user?.username || 'مستخدم محذوف'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={ac.color}>
                            {ac.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.resource}</TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums" title={log.resourceId || ''}>
                          {shortId(log.resourceId, 10)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[20rem]">
                          <span className="line-clamp-1">{log.reason || '—'}</span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums" dir="ltr">
                          {log.ipAddress || '—'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            الإجمالي: <span className="font-semibold">{arNum(data.total)}</span> • صفحة{' '}
            <span className="font-semibold">{arNum(data.page)}</span> من{' '}
            <span className="font-semibold">{arNum(data.totalPages)}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronRight className="size-4" />
              السابقة
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              التالية
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
