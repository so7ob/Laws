'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ThumbsUp, ThumbsDown, MessageSquare, Check, X } from 'lucide-react'
import { toast } from 'sonner'

export function LegislationFeedback({ legislationId, legislationTitle }: { legislationId: string; legislationTitle: string }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [rating, setRating] = useState<'up' | 'down' | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!rating) {
      toast.error('يرجى اختيار تقييم')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/account/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legislationId,
          rating,
          content: comment.trim() || undefined,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
        toast.success('شكرًا على ملاحظاتك!', {
          description: 'سيتم مراجعة تقييمك من قبل الفريق المختص',
        })
        setTimeout(() => {
          setDialogOpen(false)
          setSubmitted(false)
          setRating(null)
          setComment('')
        }, 2000)
      } else {
        toast.error('تعذر إرسال التقييم')
      }
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="gap-1.5"
      >
        <MessageSquare className="h-4 w-4" />
        <span className="hidden sm:inline">قيّم هذا التشريع</span>
        <span className="sm:hidden">تقييم</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              تقييم التشريع
            </DialogTitle>
            <DialogDescription className="text-xs">
              {legislationTitle}
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <p className="font-semibold text-base">تم إرسال تقييمك</p>
              <p className="text-sm text-muted-foreground">شكرًا لك على مساهمتك في تحسين المنصة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Rating buttons */}
              <div className="space-y-2">
                <Label>تقييمك</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRating('up')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      rating === 'up'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                        : 'border-border hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                    }`}
                  >
                    <ThumbsUp className={`h-6 w-6 ${rating === 'up' ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">مفيد</span>
                  </button>
                  <button
                    onClick={() => setRating('down')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      rating === 'down'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                        : 'border-border hover:border-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/20'
                    }`}
                  >
                    <ThumbsDown className={`h-6 w-6 ${rating === 'down' ? 'text-rose-600' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">يحتاج تحسين</span>
                  </button>
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label>تعليق (اختياري)</Label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="أخبرنا برأيك في هذا التشريع..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDialogOpen(false)
                    setRating(null)
                    setComment('')
                  }}
                >
                  <X className="h-4 w-4 ml-1.5" />
                  إلغاء
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={!rating || submitting}
                >
                  {submitting ? 'جارٍ الإرسال...' : 'إرسال التقييم'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
