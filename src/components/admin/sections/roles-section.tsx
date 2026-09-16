'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Button,
} from '@/components/ui/button'
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  ChevronLeft,
  RefreshCcw,
  Users,
  KeySquare,
  Check,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { arNum, EmptyState, ErrorState, SectionHeader, BarRow } from '../admin-shared'

interface Resp {
  items: any[]
}

// Mock permission matrix - resources × actions, just placeholder checkmarks
const RESOURCES = ['legislation', 'article', 'amendment', 'attachment', 'relation', 'user', 'role', 'report']
const ACTIONS = ['view', 'create', 'edit', 'delete', 'publish']

function PowerBar({ level, max = 100 }: { level: number; max?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">مستوى القوة</span>
        <span className="font-semibold tabular-nums">{arNum(level)} / {arNum(max)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            level >= 80 ? 'bg-rose-500' : level >= 50 ? 'bg-primary' : 'bg-secondary'
          }`}
          style={{ width: `${Math.min(100, Math.max(2, (level / max) * 100))}%` }}
        />
      </div>
    </div>
  )
}

function PermissionMatrix({ role }: { role: any }) {
  // Placeholder: derive fake "granted" booleans deterministically from role.powerLevel + role.code
  const seed = (role.powerLevel || 0) + (role.code || '').length
  const granted = (r: number, a: number) => {
    const v = (seed + r * 7 + a * 3) % 100
    return v < (role.powerLevel || 0) + 20
  }
  return (
    <div className="space-y-3 mt-3 border-t pt-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">مصفوفة الصلاحيات (تقديرية)</p>
        <Badge variant="outline" className="text-[10px]">
          {arNum(role._count?.permissions || 0)} صلاحية فعلية
        </Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="text-right py-1.5 px-2 font-medium text-muted-foreground">المورد</th>
              {ACTIONS.map((a) => (
                <th key={a} className="text-center py-1.5 px-2 font-medium text-muted-foreground">
                  {a}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RESOURCES.map((res, r) => (
              <tr key={res} className="border-b last:border-0">
                <td className="py-1.5 px-2 font-mono text-xs">{res}</td>
                {ACTIONS.map((a, idx) => {
                  const g = granted(r, idx)
                  return (
                    <td key={a} className="text-center py-1.5 px-2">
                      {g ? (
                        <Check className="size-4 text-emerald-600 inline" />
                      ) : (
                        <X className="size-4 text-muted-foreground/40 inline" />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted-foreground">
        هذه المصفوفة عرض تقديري بصلاحيات محتملة. الصلاحيات الفعلية تُدار من نظام RolePermission.
      </p>
    </div>
  )
}

function RoleCard({ role }: { role: any }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="size-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <Shield className="size-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-sm">{role.nameAr}</h3>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {role.code}
                </Badge>
                {role.isSystem && (
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <ShieldCheck className="size-3" />
                    نظامي
                  </Badge>
                )}
                {role.isProtected && (
                  <Badge variant="outline" className="gap-1 text-[10px] text-amber-700 bg-amber-50 border-amber-200">
                    <Lock className="size-3" />
                    محمي
                  </Badge>
                )}
              </div>
              {role.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{role.description}</p>
              )}
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)}>
              <ChevronLeft
                className={`size-4 transition-transform ${open ? '-rotate-90' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <PowerBar level={role.powerLevel || 0} />

        <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3">
          <div className="flex items-center gap-2">
            <Users className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">المستخدمون:</span>
            <span className="font-semibold tabular-nums">{arNum(role._count?.users || 0)}</span>
          </div>
          <div className="flex items-center gap-2">
            <KeySquare className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">الصلاحيات:</span>
            <span className="font-semibold tabular-nums">{arNum(role._count?.permissions || 0)}</span>
          </div>
        </div>

        <Collapsible open={open}>
          <CollapsibleContent>
            <PermissionMatrix role={role} />
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() =>
                  toast.info('قريبًا', { description: 'تعديل صلاحيات الدور' })
                }
              >
                تعديل الصلاحيات
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() =>
                  toast.info('قريبًا', { description: 'تعديل بيانات الدور' })
                }
              >
                تعديل البيانات
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

export function RolesSection() {
  const [data, setData] = React.useState<Resp | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetch('/api/admin/roles')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل الأدوار')
        setLoading(false)
      })
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-4">
      <SectionHeader
        title="إدارة الأدوار"
        description="الأدوار والصلاحيات على المنصة"
        action={
          <>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCcw className={loading ? 'size-4 animate-spin' : 'size-4'} />
              تحديث
            </Button>
            <Button
              size="sm"
              onClick={() => toast.info('قريبًا', { description: 'إنشاء دور جديد' })}
            >
              <ShieldAlert className="size-4" />
              دور جديد
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="لا توجد أدوار"
          description="لم يتم تهيئة أي أدوار على المنصة بعد."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((r: any) => (
            <RoleCard key={r.id} role={r} />
          ))}
        </div>
      )}
    </div>
  )
}
