'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileImage,
  FileType2,
  File as FileIcon,
  RefreshCcw,
  FileX2,
  Loader2,
  X,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { relativeTime } from '@/lib/constants'
import { arNum, EmptyState, ErrorState, SectionHeader } from '../admin-shared'

interface Resp {
  items: any[]
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  uploaded: { label: 'مرفوع', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  extracting: { label: 'قيد الاستخراج', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  ready_review: { label: 'جاهز للمراجعة', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  reviewed: { label: 'مُراجَع', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  completed: { label: 'مكتمل', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  failed: { label: 'فشل', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  canceled: { label: 'ملغى', color: 'text-slate-600 bg-slate-50 border-slate-200' },
}

function fileIcon(type: string) {
  const t = (type || '').toLowerCase()
  if (['xls', 'xlsx', 'csv'].includes(t)) return FileSpreadsheet
  if (['zip', 'rar', '7z'].includes(t)) return FileArchive
  if (['pdf'].includes(t)) return FileText
  if (['md', 'markdown'].includes(t)) return FileType2
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(t)) return FileImage
  return FileIcon
}

function formatBytes(bytes: number): string {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

// Extension → fileType mapping. Drives both validation and the API payload.
const ALLOWED_EXTENSIONS = [
  'txt', 'md', 'markdown',
  'pdf', 'doc', 'docx',
  'xls', 'xlsx', 'csv',
  'json', 'html',
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp',
] as const

const ACCEPT_ATTR =
  '.txt,.md,.markdown,.pdf,.doc,.docx,.xls,.xlsx,.csv,.json,.html,.png,.jpg,.jpeg,.gif,.bmp,.webp'

// Formats whose body can be read as text in the browser. For these we
// populate extractionText directly; binary formats stay metadata-only
// (extraction deferred to a server-side worker / OCR pipeline).
const TEXT_EXTRACTABLE = new Set(['txt', 'md', 'markdown', 'csv', 'json', 'html'])

function extOf(name: string): string {
  return (name.split('.').pop() || '').toLowerCase()
}

function fileTypeLabel(t: string): string {
  const map: Record<string, string> = {
    md: 'Markdown',
    markdown: 'Markdown',
    docx: 'Word',
    xls: 'Excel',
    xlsx: 'Excel',
    png: 'PNG',
    jpg: 'JPG',
    jpeg: 'JPG',
    gif: 'GIF',
    bmp: 'BMP',
    webp: 'WebP',
  }
  return map[t] || t.toUpperCase()
}

interface PickedFile {
  file: File
  ext: string
  extractedText?: string
  extracting: boolean
  error?: string
}

function UploadDialog({ onUploaded }: { onUploaded: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [picked, setPicked] = React.useState<PickedFile[]>([])
  const [saving, setSaving] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  async function extractText(file: File, ext: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const text = String(reader.result || '')
        // Cap the extracted text to avoid oversized payloads.
        resolve(text.slice(0, 200_000))
      }
      reader.onerror = () => reject(new Error('تعذّر قراءة الملف'))
      reader.readAsText(file, 'utf-8')
    })
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const incoming: PickedFile[] = []
    for (const f of Array.from(files)) {
      const ext = extOf(f.name)
      if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
        toast.error(`نوع غير مدعوم: ${ext || 'مجهول'}`, {
          description: f.name,
        })
        continue
      }
      incoming.push({ file: f, ext, extracting: false })
    }
    if (incoming.length === 0) return

    // Merge with existing picked files (de-dup by name+size).
    setPicked((prev) => {
      const seen = new Set(prev.map((p) => `${p.file.name}:${p.file.size}`))
      const merged = [...prev]
      for (const p of incoming) {
        const key = `${p.file.name}:${p.file.size}`
        if (!seen.has(key)) {
          merged.push(p)
          seen.add(key)
        }
      }
      return merged
    })

    // Kick off text extraction for text-extractable files (fire-and-forget
    // per file, state updated when each resolves).
    for (const p of incoming) {
      if (TEXT_EXTRACTABLE.has(p.ext)) {
        setPicked((prev) =>
          prev.map((x) => (x === p ? { ...x, extracting: true } : x))
        )
        try {
          const text = await extractText(p.file, p.ext)
          setPicked((prev) =>
            prev.map((x) =>
              x === p ? { ...x, extracting: false, extractedText: text } : x
            )
          )
        } catch (e: any) {
          setPicked((prev) =>
            prev.map((x) =>
              x === p ? { ...x, extracting: false, error: e.message } : x
            )
          )
        }
      }
    }
  }

  function removePicked(idx: number) {
    setPicked((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    if (picked.length === 0) {
      toast.error('اختر ملفًا واحدًا على الأقل')
      return
    }
    // Block submit while any text-extractable file is still being read.
    if (picked.some((p) => p.extracting)) {
      toast.info('جارٍ قراءة الملفات النصية...', {
        description: 'انتظر اكتمال الاستخراج قبل الرفع',
      })
      return
    }
    setSaving(true)
    let ok = 0
    let fail = 0
    try {
      for (const p of picked) {
        const notes = TEXT_EXTRACTABLE.has(p.ext)
          ? p.extractedText
            ? 'استخراج نصي تلقائي (FileReader)'
            : 'صيغة نصية لكن لم يُستخرج النص'
          : 'صيغة ثنائية — الاستخراج معلق على معالجة خادمية/OCR'
        const res = await fetch('/api/admin/imports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: p.file.name,
            fileType: p.ext === 'markdown' ? 'md' : p.ext,
            fileSize: p.file.size,
            text: TEXT_EXTRACTABLE.has(p.ext) ? p.extractedText || '' : '',
            notes,
          }),
        })
        if (res.ok) ok++
        else fail++
      }
      if (ok > 0) {
        toast.success(`تم رفع ${arNum(ok)} ملف`, {
          description:
            fail > 0
              ? `تعذّر رفع ${arNum(fail)} ملف`
              : 'جميع الملفات أُضيفت لقائمة الانتظار',
        })
      } else if (fail > 0) {
        toast.error(`تعذّر رفع ${arNum(fail)} ملف`)
      }
      if (ok > 0) {
        setPicked([])
        setOpen(false)
        onUploaded()
      }
    } catch (e: any) {
      toast.error(e.message || 'فشل الرفع')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setPicked([])
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload className="size-4" />
          رفع ملف جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>رفع ملفات استيراد</DialogTitle>
          <DialogDescription>
            ارفع ملفًا واحدًا أو أكثر لاستيراد تشريع. الصيغ النصية (txt, md, csv,
            json, html) تُستخرج تلقائيًا. الصيغ الثنائية (pdf, docx, xlsx, صور)
            تسجل بياناتها الوصفية بانتظار المعالجة الخادمية.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imp-file">اختر الملفات</Label>
            <input
              ref={inputRef}
              id="imp-file"
              type="file"
              multiple
              accept={ACCEPT_ATTR}
              onChange={(e) => handleFiles(e.target.files)}
              className="block w-full text-sm file:ml-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground">
              الأنواع المدعومة: txt, md, pdf, doc, docx, xls, xlsx, csv, json,
              html, png, jpg, jpeg, gif, bmp, webp
            </p>
          </div>

          {picked.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg border p-2 bg-muted/20">
              {picked.map((p, i) => {
                const Icon = fileIcon(p.ext)
                return (
                  <div
                    key={`${p.file.name}-${i}`}
                    className="flex items-center gap-2 rounded-md bg-background p-2 border"
                  >
                    <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={p.file.name}>
                        {p.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fileTypeLabel(p.ext)} • {formatBytes(p.file.size)}
                        {TEXT_EXTRACTABLE.has(p.ext) && (
                          <span className="mx-1">•</span>
                        )}
                        {TEXT_EXTRACTABLE.has(p.ext) && (
                          <span
                            className={
                              p.extracting
                                ? 'text-amber-600'
                                : p.extractedText
                                ? 'text-emerald-600'
                                : p.error
                                ? 'text-rose-600'
                                : ''
                            }
                          >
                            {p.extracting
                              ? 'جارٍ الاستخراج...'
                              : p.extractedText
                              ? `استُخرج ${arNum(p.extractedText.length)} حرف`
                              : p.error || 'لم يُستخرج'}
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0"
                      onClick={() => removePicked(i)}
                      aria-label={`إزالة ${p.file.name}`}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          {picked.length === 0 && (
            <div className="flex items-center justify-center py-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
              <div className="text-center">
                <Plus className="size-6 mx-auto mb-1 opacity-50" />
                لم تختر أي ملف بعد
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={saving || picked.length === 0}>
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جارٍ الرفع ({arNum(picked.length)})...
              </>
            ) : (
              <>
                <Upload className="size-4" />
                رفع {arNum(picked.length)} ملف
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ImportsSection() {
  const [data, setData] = React.useState<Resp | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState('all')

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    const url = `/api/admin/imports${params.toString() ? '?' + params.toString() : ''}`
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'تعذّر تحميل الاستيراد')
        setLoading(false)
      })
  }, [status])

  React.useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-4">
      <SectionHeader
        title="الاستيراد"
        description="إدارة عمليات استيراد ملفات التشريعات"
        action={
          <>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCcw className={loading ? 'size-4 animate-spin' : 'size-4'} />
              تحديث
            </Button>
            <UploadDialog onUploaded={load} />
          </>
        }
      />

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-sm text-muted-foreground">تصفية حسب الحالة:</span>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="uploaded">مرفوع</SelectItem>
              <SelectItem value="extracting">قيد الاستخراج</SelectItem>
              <SelectItem value="ready_review">جاهز للمراجعة</SelectItem>
              <SelectItem value="reviewed">مُراجَع</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="failed">فشل</SelectItem>
              <SelectItem value="canceled">ملغى</SelectItem>
            </SelectContent>
          </Select>
          {data && (
            <span className="text-xs text-muted-foreground sm:mr-auto">
              الإجمالي: <span className="font-semibold">{arNum(data.items.length)}</span>
            </span>
          )}
        </CardContent>
      </Card>

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
          icon={FileX2}
          title="لا توجد عمليات استيراد"
          description="ارفع ملفًا جديدًا لبدء عملية استيراد تشريع."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((it: any) => {
            const Icon = fileIcon(it.fileType)
            const st = STATUS_LABELS[it.status] || { label: it.status, color: '' }
            return (
              <Card key={it.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1" title={it.fileName}>
                        {it.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {it.fileType?.toUpperCase()} • {formatBytes(it.fileSize)}
                      </p>
                    </div>
                    <Badge variant="outline" className={st.color}>
                      {st.label}
                    </Badge>
                  </div>

                  {it.progress > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">التقدّم</span>
                        <span className="font-medium tabular-nums">{arNum(it.progress)}%</span>
                      </div>
                      <Progress value={it.progress} />
                    </div>
                  )}

                  {it.legislation && (
                    <div className="text-xs">
                      <Badge variant="secondary" className="gap-1">
                        تشريع مرتبط: {it.legislation.officialTitle?.slice(0, 24)}
                      </Badge>
                    </div>
                  )}

                  {it.errorMessage && (
                    <p className="text-xs text-destructive line-clamp-2">{it.errorMessage}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                    <span>{relativeTime(it.createdAt)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        toast.info('قريبًا', { description: 'معالجة سجل الاستيراد' })
                      }
                    >
                      معالجة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
