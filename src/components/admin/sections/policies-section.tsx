'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Shield,
  ShieldCheck,
  FileEdit,
  Trash2,
  Eye,
  Megaphone,
  Power,
  RefreshCcw,
  Settings2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { arNum, EmptyState, ErrorState, SectionHeader } from '../admin-shared'

interface Resp {
  items: any[]
}

const CATEGORY_META: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  deletion: { label: 'الحذف', icon: Trash2, color: 'bg-rose-100 text-rose-700' },
  editing: { label: 'التحرير', icon: FileEdit, color: 'bg-blue-100 text-blue-700' },
  review: { label: 'المراجعة', icon: Eye, color: 'bg-amber-100 text-amber-700' },
  publishing: { label: 'النشر', icon: Megaphone, color: 'bg-emerald-100 text-emerald-700' },
  activation: { label: 'التفعيل', icon: Power, color: 'bg-secondary/15 text-secondary' },
}

const ENFORCEMENT_LABELS: Record<string, { label: string; color: string }> = {
  mandatory: { label: 'إلزامي', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  configurable: { label: 'قابل للتهيئة', color: 'text-blue-700 bg-blue-50 border-blue-200' },
}

function PolicyCard({ policy }: { policy: any }) {
  const [active, setActive] = React.useState(policy.isActive)
  const meta = CATEGORY_META[policy.category] || {
    label: policy.category,
    icon: Shield,
    color: 'bg-muted text-muted-foreground',
  }
  const Icon = meta.icon
  const en = ENFORCEMENT_LABELS[policy.enforcementLevel] || {
    label: policy.enforcementLevel,
    color: '',
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
            <Icon className="size-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-sm">{policy.nameAr}</h3>
              <Badge variant="outline" className={en.color}>
                {en.label}
              </Badge>
              {policy.isSystem && (
                <Badge variant="secondary" className="gap-1">
                  <ShieldCheck className="size-3" />
                  نظامي
                </Badge>
              )}
            </div>
            <code className="text-xs text-muted-foreground">{policy.code}</code>
            {policy.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {policy.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-1">
            <Switch
              checked={active}
              onCheckedChange={(checked) => {
                setActive(checked)
                toast.success(
                  checked
                    ? 'تم تفعيل السياسة'
                    : 'تم تعطيل السياسة',
                  { description: policy.nameAr },
                )
              }}
            />
            <span className="text-xs text-muted-foreground">
              {active ? 'مفعّلة' : 'معطّلة'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs border-t pt-3">
          <Badge variant="outline" className="gap-1">
            <Users className="size-3" />
            استثناءات: {arNum(policy._count?.exceptions || 0)}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => toast.info('قريبًا', { description: 'إدارة استثناءات السياسة' })}
          >
            <Settings2 className="size-3.5" />
            إدارة الاستثناءات
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function PoliciesSection() {
  const [data, setData] = React.useState<Resp | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetch('/api/admin/policies')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل السياسات')
        setLoading(false)
      })
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  // Group by category
  const grouped = React.useMemo(() => {
    if (!data) return [] as { category: string; items: any[] }[]
    const map = new Map<string, any[]>()
    for (const p of data.items) {
      const arr = map.get(p.category) || []
      arr.push(p)
      map.set(p.category, arr)
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
  }, [data])

  const categoryOrder = ['deletion', 'editing', 'review', 'publishing', 'activation']
  grouped.sort((a, b) => {
    const ai = categoryOrder.indexOf(a.category)
    const bi = categoryOrder.indexOf(b.category)
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
  })

  return (
    <div className="space-y-5">
      <SectionHeader
        title="سياسات العمليات"
        description="ضوابط وإجراءات العمليات على المنصة"
        action={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCcw className={loading ? 'size-4 animate-spin' : 'size-4'} />
            تحديث
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="لا توجد سياسات معرّفة"
          description="لم يتم تهيئة أي سياسات عمليات بعد."
        />
      ) : (
        grouped.map((group) => {
          const meta = CATEGORY_META[group.category] || {
            label: group.category,
            icon: Shield,
            color: 'bg-muted text-muted-foreground',
          }
          const Icon = meta.icon
          return (
            <section key={group.category} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`size-9 rounded-lg flex items-center justify-center ${meta.color}`}>
                  <Icon className="size-4" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary">{meta.label}</h3>
                  <p className="text-xs text-muted-foreground">
                    {arNum(group.items.length)} سياسة
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((p: any) => (
                  <PolicyCard key={p.id} policy={p} />
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
