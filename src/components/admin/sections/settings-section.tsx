'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Settings,
  Settings2,
  Search,
  Wrench,
  ShieldCheck,
  Save,
  RefreshCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { relativeTime } from '@/lib/constants'
import { EmptyState, ErrorState, SectionHeader } from '../admin-shared'

interface SettingItem {
  id: string
  key: string
  value: string
  type: string
  category: string
  updatedAt: string
}

interface Resp {
  items: SettingItem[]
}

const CATEGORY_META: Record<string, { label: string; icon: any; color: string }> = {
  general: { label: 'عام', icon: Settings, color: 'bg-secondary/10 text-secondary' },
  operations: { label: 'العمليات', icon: Wrench, color: 'bg-amber-100 text-amber-700' },
  search: { label: 'البحث', icon: Search, color: 'bg-blue-100 text-blue-700' },
  security: { label: 'الأمان', icon: ShieldCheck, color: 'bg-primary/10 text-primary' },
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  string: { label: 'نص', color: 'text-slate-700 bg-slate-50 border-slate-200' },
  number: { label: 'رقم', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  boolean: { label: 'منطقي', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  json: { label: 'JSON', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
}

function SettingRow({
  setting,
  onChange,
}: {
  setting: SettingItem
  onChange: (key: string, value: string) => void
}) {
  const tp = TYPE_LABELS[setting.type] || {
    label: setting.type,
    color: '',
  }
  const isBool = setting.type === 'boolean'
  const isNum = setting.type === 'number'
  const isJson = setting.type === 'json'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_220px] gap-3 sm:items-center py-3 border-b last:border-0">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <code className="text-sm font-mono text-foreground break-all">{setting.key}</code>
          <Badge variant="outline" className={tp.color}>
            {tp.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          آخر تحديث: {relativeTime(setting.updatedAt)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isBool ? (
          <div className="flex items-center gap-2 w-full justify-end">
            <Switch
              checked={setting.value === 'true'}
              onCheckedChange={(checked) => onChange(setting.key, checked ? 'true' : 'false')}
            />
            <span className="text-xs text-muted-foreground">
              {setting.value === 'true' ? 'مفعّل' : 'معطّل'}
            </span>
          </div>
        ) : isJson ? (
          <Textarea
            className="font-mono text-xs h-20"
            value={setting.value}
            onChange={(e) => onChange(setting.key, e.target.value)}
          />
        ) : (
          <Input
            type={isNum ? 'number' : 'text'}
            className="font-mono text-sm"
            value={setting.value}
            onChange={(e) => onChange(setting.key, e.target.value)}
            dir="ltr"
          />
        )}
      </div>
    </div>
  )
}

function SettingsGroup({
  category,
  items,
  values,
  onValueChange,
}: {
  category: string
  items: SettingItem[]
  values: Record<string, string>
  onValueChange: (key: string, value: string) => void
}) {
  const meta = CATEGORY_META[category] || {
    label: category,
    icon: Settings,
    color: 'bg-muted text-muted-foreground',
  }
  const Icon = meta.icon

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className={`size-9 rounded-lg flex items-center justify-center ${meta.color}`}>
            <Icon className="size-4" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{meta.label}</CardTitle>
            <p className="text-xs text-muted-foreground">{items.length} إعداد</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {items.map((s) => (
            <SettingRow
              key={s.id}
              setting={{ ...s, value: values[s.key] ?? s.value }}
              onChange={onValueChange}
            />
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button
            size="sm"
            onClick={() =>
              toast.success('تم حفظ إعدادات ' + meta.label, {
                description: `حُفظت ${items.length} إعداد في هذه المجموعة`,
              })
            }
          >
            <Save className="size-4" />
            حفظ التغييرات
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function SettingsSection() {
  const [data, setData] = React.useState<Resp | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [values, setValues] = React.useState<Record<string, string>>({})

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        const init: Record<string, string> = {}
        for (const it of d.items as SettingItem[]) init[it.key] = it.value
        setValues(init)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل الإعدادات')
        setLoading(false)
      })
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  function onValueChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const grouped = React.useMemo(() => {
    if (!data) return []
    const map = new Map<string, SettingItem[]>()
    for (const s of data.items) {
      const arr = map.get(s.category) || []
      arr.push(s)
      map.set(s.category, arr)
    }
    const order = ['general', 'operations', 'search', 'security']
    return Array.from(map.entries())
      .map(([category, items]) => ({ category, items }))
      .sort((a, b) => {
        const ai = order.indexOf(a.category)
        const bi = order.indexOf(b.category)
        return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
      })
  }, [data])

  return (
    <div className="space-y-4">
      <SectionHeader
        title="إعدادات المنصة"
        description="تهيئة الإعدادات العامة والعمليات والبحث والأمان"
        action={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCcw className={loading ? 'size-4 animate-spin' : 'size-4'} />
            تحديث
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-9 w-1/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Settings2}
          title="لا توجد إعدادات"
          description="لم يتم تهيئة أي إعدادات للمنصة بعد."
        />
      ) : (
        <div className="space-y-5">
          {grouped.map((g) => (
            <SettingsGroup
              key={g.category}
              category={g.category}
              items={g.items}
              values={values}
              onValueChange={onValueChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
