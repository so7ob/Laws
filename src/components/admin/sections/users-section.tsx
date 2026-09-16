'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
  Users,
  Search,
  Plus,
  KeyRound,
  RefreshCcw,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import { relativeTime } from '@/lib/constants'
import { arNum, EmptyState, ErrorState, SectionHeader } from '../admin-shared'

interface Resp {
  items: any[]
}

export function UsersSection() {
  const [data, setData] = React.useState<Resp | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [q, setQ] = React.useState('')

  const [debouncedQ, setDebouncedQ] = React.useState('')
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400)
    return () => clearTimeout(t)
  }, [q])

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (debouncedQ) params.set('q', debouncedQ)
    const url = `/api/admin/users${params.toString() ? '?' + params.toString() : ''}`
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل المستخدمين')
        setLoading(false)
      })
  }, [debouncedQ])

  React.useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-4">
      <SectionHeader
        title="إدارة المستخدمين"
        description="استعراض وإدارة حساب مستخدمي المنصة"
        action={
          <>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCcw className={loading ? 'size-4 animate-spin' : 'size-4'} />
              تحديث
            </Button>
            <Button
              size="sm"
              onClick={() => toast.info('قريبًا', { description: 'إضافة مستخدم جديد' })}
            >
              <Plus className="size-4" />
              إضافة مستخدم
            </Button>
          </>
        }
      />

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pr-9"
              placeholder="ابحث باسم المستخدم أو البريد أو الاسم الكامل..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="لا يوجد مستخدمون"
          description="لم يتم العثور على مستخدمين مطابقين."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>البريد</TableHead>
                    <TableHead>الأدوار</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>آخر دخول</TableHead>
                    <TableHead>سجل التدقيق</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{u.fullName}</span>
                          <span className="text-xs text-muted-foreground">@{u.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs" dir="ltr">
                        {u.email || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles && u.roles.length > 0 ? (
                            u.roles.map((r: any, i: number) => (
                              <Badge key={r.id || i} variant="secondary" className="text-[10px]">
                                <Shield className="size-2.5" />
                                {r.nameAr || r.code}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={!!u.isActive}
                          onCheckedChange={(checked) =>
                            toast.success(
                              checked
                                ? 'تم تفعيل المستخدم'
                                : 'تم تعطيل المستخدم',
                              { description: u.fullName },
                            )
                          }
                          aria-label="تفعيل/تعطيل"
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {u.lastLoginAt ? relativeTime(u.lastLoginAt) : 'لم يدخل بعد'}
                      </TableCell>
                      <TableCell className="text-xs tabular-nums">
                        {arNum(u._count?.auditLogs || 0)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() =>
                            toast.info('قريبًا', {
                              description: `إعادة تعيين كلمة مرور: ${u.fullName}`,
                            })
                          }
                        >
                          <KeyRound className="size-3.5" />
                          <span className="hidden sm:inline">إعادة كلمة المرور</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
