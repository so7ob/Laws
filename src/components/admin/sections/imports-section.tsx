'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  File as FileIcon,
  RefreshCcw,
  FileX2,
  Loader2,
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

function UploadDialog({ onUploaded }: { onUploaded: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [fileName, setFileName] = React.useState('')
  const [fileType, setFileType] = React.useState('pdf')
  const [fileSize, setFileSize] = React.useState(0)
  const [saving, setSaving] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFileName(f.name)
    setFileSize(f.size)
    const ext = f.name.split('.').pop()?.toLowerCase() || 'txt'
    setFileType(ext)
  }

  async function handleSubmit() {
    if (!fileName.trim()) {
      toast.error('اختر ملفًا أولاً')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/imports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileType, fileSize }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'فشل الرفع')
      }
      toast.success('تم إنشاء سجل الاستيراد', {
        description: `${fileName} تمت إضافته لقائمة الانتظار`,
      })
      setFileName('')
      setFileSize(0)
      setOpen(false)
      onUploaded()
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
        if (!o) {
          setFileName('')
          setFileSize(0)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload className="size-4" />
          رفع ملف جديد
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>رفع ملف استيراد جديد</DialogTitle>
          <DialogDescription>
            ارفع ملف تشريع خام لاستخراج محتواه. سيتم إنشاء سجل استيراد بحالة «مرفوع».
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imp-file">اختر الملف</Label>
            <input
              ref={inputRef}
              id="imp-file"
              type="file"
              accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.csv,.json,.html"
              onChange={handleFile}
              className="block w-full text-sm file:ml-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer hover:file:bg-primary/90"
            />
            {fileName && (
              <p className="text-xs text-muted-foreground">
                تم اختيار: <span className="font-medium">{fileName}</span> ({formatBytes(fileSize)})
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="imp-name">اسم الملف</Label>
              <Input
                id="imp-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="مثال: law-2024.pdf"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imp-type">النوع</Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger id="imp-type" className="w-full">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="txt">نص</SelectItem>
                  <SelectItem value="doc">Word</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جارٍ الرفع...
              </>
            ) : (
              <>
                <Upload className="size-4" />
                رفع الملف
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
