'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Loader2,
  ListChecks,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react'
import { AMENDMENT_OPERATION_LABELS } from '@/lib/constants'

interface OperationItem {
  id: string
  operationType: string
  targetArticleId: string | null
  sortOrder: number
  oldText: string | null
  newText: string | null
  newArticleNumber: string | null
  reason: string | null
  applied: boolean
  targetArticle: {
    id: string
    publishedNumber: string | null
    legislation: { slug: string; officialTitle: string } | null
  } | null
}

interface AmendmentOperationsDialogProps {
  amendmentId: string
  amendmentTitle: string
}

/**
 * Dialog that fetches and displays the individual operations of an
 * amendment document, with their type, target article, text, and
 * applied status.
 */
export function AmendmentOperationsDialog({
  amendmentId,
  amendmentTitle,
}: AmendmentOperationsDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [operations, setOperations] = React.useState<OperationItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    fetch(`/api/admin/amendments/${amendmentId}/operations`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setOperations(d.items || [])
      })
      .catch((e) => setError(e.message || 'تعذّر تحميل العمليات'))
      .finally(() => setLoading(false))
  }, [open, amendmentId])

  const appliedCount = operations.filter((o) => o.applied).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <ListChecks className="size-3.5" />
          عرض التفاصيل
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            عمليات وثيقة التعديل
          </DialogTitle>
          <DialogDescription className="truncate">
            {amendmentTitle} — {operations.length} عملية
            {operations.length > 0 && (
              <span className="text-emerald-600 mr-2">
                ({appliedCount} مطبّقة)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : operations.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            لا توجد عمليات في هذه الوثيقة
          </div>
        ) : (
          <div className="space-y-3">
            {operations.map((op, idx) => {
              const typeLabel =
                AMENDMENT_OPERATION_LABELS[op.operationType] ||
                op.operationType
              return (
                <div
                  key={op.id}
                  className="rounded-lg border bg-card p-3 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      #{idx + 1}
                    </Badge>
                    <Badge className="bg-primary text-primary-foreground text-xs shrink-0">
                      {typeLabel}
                    </Badge>
                    {op.applied ? (
                      <Badge
                        variant="outline"
                        className="text-emerald-700 bg-emerald-50 border-emerald-200 text-xs shrink-0 gap-1"
                      >
                        <CheckCircle2 className="size-3" />
                        مطبّقة
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-amber-700 bg-amber-50 border-amber-200 text-xs shrink-0 gap-1"
                      >
                        <Circle className="size-3" />
                        غير مطبّقة
                      </Badge>
                    )}
                    {op.targetArticle && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        مادة: {op.targetArticle.publishedNumber || '—'}
                      </Badge>
                    )}
                    {op.newArticleNumber && !op.targetArticle && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        مادة جديدة: {op.newArticleNumber}
                      </Badge>
                    )}
                  </div>

                  {op.reason && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">السبب:</span> {op.reason}
                    </p>
                  )}

                  {op.oldText && (
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground font-medium">
                        النص القديم:
                      </p>
                      <div className="text-xs rounded-md border border-rose-200 bg-rose-50 p-2 line-through text-muted-foreground max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {op.oldText}
                      </div>
                    </div>
                  )}

                  {op.newText && (
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground font-medium">
                        النص الجديد:
                      </p>
                      <div className="text-xs rounded-md border border-emerald-200 bg-emerald-50 p-2 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {op.newText}
                      </div>
                    </div>
                  )}

                  {!op.oldText && !op.newText && !op.reason && (
                    <p className="text-xs text-muted-foreground italic">
                      لا يوجد محتوى نصي إضافي لهذه العملية
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
