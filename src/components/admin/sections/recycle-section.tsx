'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Clock,
  RefreshCcw,
  FileX2,
  Boxes,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { formatDate, relativeTime } from '@/lib/constants'
import { arNum, EmptyState, ErrorState, SectionHeader } from '../admin-shared'

interface Resp {
  items: any[]
  expiredCount: number
}

function RecycleCard({ batch }: { batch: any }) {
  const isExpired = batch.expiresAt && new Date(batch.expiresAt) < new Date()

  return (
    <Card className={isExpired ? 'border-rose-300' : ''}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm">
                {batch.batchName || `دفعة ${batch.id.slice(0, 8)}`}
              </h3>
              {isExpired ? (
                <Badge variant="destructive">منتهية الصلاحية</Badge>
              ) : (
                <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
                  <Clock className="size-3" />
                  بانتظار الإتلاف
                </Badge>
              )}
            </div>
            {batch.reason && (
              <p className="text-xs text-muted-foreground line-clamp-2">{batch.reason}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t pt-3">
          <div>
            <p className="text-muted-foreground mb-0.5">الإجراء</p>
            <p className="font-medium">{batch.executedBy || '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5">عدد العناصر</p>
            <p className="font-medium tabular-nums">{arNum(batch.itemCount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5">الإنشاء</p>
            <p className="font-medium">{relativeTime(batch.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5">تنتهي في</p>
            <p className={`font-medium ${isExpired ? 'text-rose-600' : ''}`}>
              {formatDate(batch.expiresAt)}
            </p>
          </div>
        </div>

        {batch.items && batch.items.length > 0 && (
          <div className="border-t pt-2">
            <p className="text-xs text-muted-foreground mb-1.5">العناصر المحذوفة:</p>
            <ul className="space-y-1 max-h-32 overflow-y-auto pl-1">
              {batch.items.slice(0, 5).map((it: any) => (
                <li key={it.id} className="text-xs flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {it.itemType}
                  </Badge>
                  <span className="line-clamp-1">{it.itemName}</span>
                </li>
              ))}
              {batch.items.length > 5 && (
                <li className="text-xs text-muted-foreground text-center">
                  + {arNum(batch.items.length - 5)} عناصر أخرى
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex gap-2 border-t pt-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <RotateCcw className="size-4" />
                استعادة
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد الاستعادة</AlertDialogTitle>
                <AlertDialogDescription>
                  هل أنت متأكد من استعادة دفعة الحذف «{batch.batchName || batch.id.slice(0, 8)}»؟ سيتم
                  إرجاع جميع العناصر ({arNum(batch.itemCount)}) إلى حالتها السابقة.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() =>
                    toast.success('تمت الاستعادة بنجاح', {
                      description: `استعيد ${arNum(batch.itemCount)} عنصر`,
                    })
                  }
                >
                  <RotateCcw className="size-4" />
                  استعادة
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="flex-1">
                <Trash2 className="size-4" />
                إتلاف
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد الإتلاف الدائم</AlertDialogTitle>
                <AlertDialogDescription>
                  تحذير: لا يمكن التراجع عن هذه العملية. سيتم حذف جميع عناصر الدفعة
                  «{batch.batchName || batch.id.slice(0, 8)}» ({arNum(batch.itemCount)}) نهائيًا.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    toast.success('تم الإتلاف الدائم', {
                      description: `تم حذف ${arNum(batch.itemCount)} عنصر`,
                    })
                  }
                >
                  <Trash2 className="size-4" />
                  إتلاف دائم
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}

export function RecycleSection() {
  const [data, setData] = React.useState<Resp | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    fetch('/api/admin/recycle')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل سلة الحذف')
        setLoading(false)
      })
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-4">
      <SectionHeader
        title="سلة الحذف"
        description="الدفعات المحذوفة مؤقتًا بانتظار الاستعادة أو الإتلاف"
        action={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCcw className={loading ? 'size-4 animate-spin' : 'size-4'} />
            تحديث
          </Button>
        }
      />

      {/* Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="size-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1 text-sm space-y-1">
            <p className="font-semibold text-amber-900">
              سياسة الاحتجاز لمدة ٣٠ يومًا
            </p>
            <p className="text-amber-800">
              يتم الاحتفاظ بالعناصر المحذوفة مؤقتًا لمدة ٣٠ يومًا قبل الإتلاف الدائم. خلال هذه
              الفترة يمكن استعادة العناصر بسهولة. بعد انتهاء المدة سيتم حذفها نهائيًا.
            </p>
            {data && data.expiredCount > 0 && (
              <p className="text-rose-700 font-medium mt-2">
                تنبيه: {arNum(data.expiredCount)} دفعة منتهية الصلاحية بانتظار الإتلاف.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-1/2" />
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
          icon={Boxes}
          title="سلة الحذف فارغة"
          description="لا توجد دفعات محذوفة مؤقتًا. عند حذف عنصر سيظهر هنا لمدة ٣٠ يومًا."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.items.map((b: any) => (
            <RecycleCard key={b.id} batch={b} />
          ))}
        </div>
      )}
    </div>
  )
}
