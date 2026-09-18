'use client'

import * as React from 'react'
import { useAppStore } from '@/store/app-store'
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
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Upload,
  ChevronRight,
  ChevronLeft,
  FileX2,
  RefreshCcw,
} from 'lucide-react'
import { WORKFLOW_STATUS_LABELS, relativeTime } from '@/lib/constants'
import { arNum, EmptyState, ErrorState, SectionHeader } from '../admin-shared'
import { CreateLegislationDialog } from './create-legislation-dialog'

interface Resp {
  items: any[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const PAGE_SIZE = 20

export function LegislationsSection() {
  const openLegislation = useAppStore((s) => s.openLegislation)
  const [data, setData] = React.useState<Resp | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [q, setQ] = React.useState('')
  const [status, setStatus] = React.useState<string>('all')
  const [page, setPage] = React.useState(1)

  // debounce search
  const [debouncedQ, setDebouncedQ] = React.useState('')
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400)
    return () => clearTimeout(t)
  }, [q])

  React.useEffect(() => {
    setPage(1)
  }, [debouncedQ, status])

  React.useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      q: debouncedQ,
    })
    if (status !== 'all') params.set('status', status)
    fetch(`/api/admin/legislations?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل التشريعات')
        setLoading(false)
      })
  }, [page, debouncedQ, status])

  function reload() {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      q: debouncedQ,
    })
    if (status !== 'all') params.set('status', status)
    fetch(`/api/admin/legislations?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل التشريعات')
        setLoading(false)
      })
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="إدارة التشريعات"
        description="استعراض وتصفية التشريعات في المنصة"
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
              variant="outline"
              size="sm"
              onClick={() => toast.info('قريبًا', { description: 'استيراد ملفات تشريعات' })}
            >
              <Upload className="size-4" />
              استيراد
            </Button>
            <CreateLegislationDialog onCreated={reload} />
            </>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pr-9"
              placeholder="ابحث في العنوان أو المعرّف..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="in_review">قيد المراجعة</SelectItem>
              <SelectItem value="approved">معتمد للنشر</SelectItem>
              <SelectItem value="published">منشور</SelectItem>
              <SelectItem value="archived">مؤرشف</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Data */}
      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={FileX2}
          title="لا توجد تشريعات مطابقة"
          description="جرّب تعديل عوامل التصفية أو البحث بكلمات مفتاحية مختلفة."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>السنة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>المواد</TableHead>
                  <TableHead>آخر تحديث</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((l: any) => {
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
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {l.officialTitle}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {l.type?.nameAr || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">{arNum(l.year || 0)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ws.color}>
                          {ws.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {arNum(l._count?.articles || 0)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
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
