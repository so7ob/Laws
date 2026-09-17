'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Quote, Copy, Check, FileText } from 'lucide-react'
import { generateCitation, CITATION_FORMATS } from '@/lib/citation'
import { toast } from 'sonner'

interface CitationDataInput {
  officialTitle: string
  type?: { nameAr: string; code: string } | null
  number?: string | null
  year?: number | null
  authority?: { nameAr: string; code: string } | null
  issueDate?: string | null
  publicationDate?: string | null
  effectiveDate?: string | null
  officialJournal?: any
}

export function CitationDialog({ data, legislationTitle }: { data: CitationDataInput; legislationTitle: string }) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<'simple' | 'full' | 'academic'>('full')
  const [copied, setCopied] = useState(false)

  const citation = useMemo(() => generateCitation(data, format), [data, format])

  function handleCopy() {
    if (typeof navigator === 'undefined') return
    navigator.clipboard.writeText(citation).then(() => {
      setCopied(true)
      toast.success('تم نسخ الاستشهاد')
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => toast.error('تعذر النسخ'))
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <Quote className="h-4 w-4" />
        <span className="hidden sm:inline">استشهاد</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Quote className="h-4 w-4 text-primary" />
              </div>
              مولّد الاستشهاد القانوني
            </DialogTitle>
            <DialogDescription className="text-xs truncate">
              {legislationTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Format selector */}
            <div>
              <div className="text-sm font-semibold mb-2">اختر صيغة الاستشهاد</div>
              <div className="grid grid-cols-3 gap-2">
                {CITATION_FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id as any)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all text-center ${
                      format === f.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30 hover:bg-muted/30'
                    }`}
                  >
                    <span className="text-sm font-medium">{f.label}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-2">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Citation preview */}
            <div>
              <div className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                الاستشهاد
              </div>
              <div className="relative">
                <div className="bg-muted/40 border border-border rounded-lg p-4 pr-3 border-r-4 border-r-primary min-h-[80px]">
                  <p className="legal-text text-sm leading-relaxed" dir="rtl">
                    {citation}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                className="flex-1"
                variant={copied ? 'default' : 'outline'}
              >
                {copied ? <Check className="h-4 w-4 ml-1.5" /> : <Copy className="h-4 w-4 ml-1.5" />}
                {copied ? 'تم النسخ' : 'نسخ الاستشهاد'}
              </Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                إغلاق
              </Button>
            </div>

            {/* Info note */}
            <div className="text-[11px] text-muted-foreground bg-muted/30 rounded-md p-2.5 flex items-start gap-2">
              <Badge variant="outline" className="text-[9px] py-0 px-1.5 shrink-0">ملاحظة</Badge>
              <span>هذا الاستشهاد مُولّد تلقائيًا. يُنصح بمراجعته قبل الاستخدام في البحوث الأكاديمية.</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
