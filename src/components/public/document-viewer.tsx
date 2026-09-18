'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  X,
  ZoomIn,
  ZoomOut,
  Printer,
  ChevronRight,
  ChevronLeft,
  FileText,
  LayoutGrid,
  Maximize2,
} from 'lucide-react'

interface AttachmentItem {
  id: string
  title: string
  attachmentType: string
  contentType: string // text, table, file
  textContent?: string | null
  tableContent?: string | null // JSON {columns, rows}
}

interface DocumentViewerProps {
  attachments: AttachmentItem[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  attachmentTypeLabels?: Record<string, string>
}

const MIN_FONT = 12
const MAX_FONT = 28
const DEFAULT_FONT = 16

/**
 * Fullscreen document viewer for legislation attachments.
 *
 * Renders text content in a reader-optimised layout with zoom controls,
 * tables in a scrollable formatted view, and file-type attachments in
 * a descriptive document layout. Supports keyboard navigation (Esc,
 * +/-, arrows) and print.
 *
 * Note: the sandbox has no real PDF binary storage; this viewer handles
 * the text/table/file-descriptive formats that the download API also
 * produces. A real PDF.js viewer would slot in here for binary PDFs.
 */
export function DocumentViewer({
  attachments,
  initialIndex,
  open,
  onOpenChange,
  attachmentTypeLabels = {},
}: DocumentViewerProps) {
  const [index, setIndex] = React.useState(initialIndex)
  const [fontSize, setFontSize] = React.useState(DEFAULT_FONT)

  // Reset state when opening with a new initial index.
  React.useEffect(() => {
    if (open) {
      setIndex(initialIndex)
      setFontSize(DEFAULT_FONT)
    }
  }, [open, initialIndex])

  const att = attachments[index]

  function goPrev() {
    setIndex((i) => Math.max(0, i - 1))
  }
  function goNext() {
    setIndex((i) => Math.min(attachments.length - 1, i + 1))
  }
  function zoomIn() {
    setFontSize((s) => Math.min(MAX_FONT, s + 2))
  }
  function zoomOut() {
    setFontSize((s) => Math.max(MIN_FONT, s - 2))
  }
  function handlePrint() {
    if (typeof window !== 'undefined') window.print()
  }

  // Keyboard shortcuts.
  React.useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onOpenChange(false)
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomIn()
      } else if (e.key === '-') {
        e.preventDefault()
        zoomOut()
      } else if (e.key === 'ArrowLeft') {
        // RTL: left arrow = next
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowRight') {
        // RTL: right arrow = prev
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, attachments.length])

  if (!att) return null

  // Parse table content for rendering.
  let table: { columns: string[]; rows: string[][] } | null = null
  if (att.contentType === 'table' && att.tableContent) {
    try {
      table = JSON.parse(att.tableContent)
    } catch {
      table = null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] flex flex-col p-0 gap-0 print:p-0 print:max-h-none print:max-w-none">
        <DialogTitle className="sr-only">{att.title}</DialogTitle>
        <DialogDescription className="sr-only">
          عارض المستندات — {att.attachmentType}
        </DialogDescription>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-background/95 backdrop-blur print:hidden shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Badge className="bg-primary text-primary-foreground shrink-0">
              {attachmentTypeLabels[att.attachmentType] || att.attachmentType}
            </Badge>
            <h2 className="text-sm font-semibold truncate" title={att.title}>
              {att.title}
            </h2>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={zoomOut}
              disabled={fontSize <= MIN_FONT}
              aria-label="تصغير الخط"
              title="تصغير الخط (-)"
            >
              <ZoomOut className="size-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-8 text-center tabular-nums">
              {fontSize}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={zoomIn}
              disabled={fontSize >= MAX_FONT}
              aria-label="تكبير الخط"
              title="تكبير الخط (+)"
            >
              <ZoomIn className="size-4" />
            </Button>
          </div>

          {/* Print */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handlePrint}
            aria-label="طباعة"
            title="طباعة"
          >
            <Printer className="size-4" />
          </Button>

          {/* Navigation */}
          {attachments.length > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={goPrev}
                disabled={index === 0}
                aria-label="السابق"
                title="السابق (→)"
              >
                <ChevronRight className="size-4" />
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {index + 1}/{attachments.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={goNext}
                disabled={index === attachments.length - 1}
                aria-label="التالي"
                title="التالي (←)"
              >
                <ChevronLeft className="size-4" />
              </Button>
            </div>
          )}

          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onOpenChange(false)}
            aria-label="إغلاق"
            title="إغلاق (Esc)"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto bg-muted/10 print:bg-white print:overflow-visible">
          <div
            className="mx-auto max-w-3xl p-8 print:p-0"
            style={{ fontSize: `${fontSize}px` }}
          >
            {att.contentType === 'text' && att.textContent && (
              <div className="legal-text whitespace-pre-wrap leading-loose text-foreground print:whitespace-pre-wrap">
                {att.textContent}
              </div>
            )}

            {att.contentType === 'table' && table && (
              <div className="print:break-inside-auto">
                <TableView table={table} fontSize={fontSize} />
              </div>
            )}

            {att.contentType === 'file' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-12 border-2 border-dashed rounded-lg bg-background/60 print:hidden">
                  <div className="text-center">
                    <Maximize2 className="size-10 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      مرفق رقمي — العرض الوصفي أدناه
                    </p>
                  </div>
                </div>
                {att.textContent ? (
                  <div className="legal-text whitespace-pre-wrap leading-loose text-foreground">
                    {att.textContent}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    لا يوجد محتوى نصي لهذا المرفق. استخدم زر التنزيل للحصول
                    على الوثيقة الوصفية.
                  </p>
                )}
              </div>
            )}

            {att.contentType === 'table' && !table && (
              <p className="text-sm text-destructive">
                خطأ في صيغة بيانات الجدول
              </p>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t bg-background/95 text-[11px] text-muted-foreground flex items-center justify-between print:hidden shrink-0">
          <span className="flex items-center gap-1">
            <FileText className="size-3" />
            استخدم +/- للتكبير، الأسهم للتنقل، Esc للإغلاق
          </span>
          {attachments.length > 1 && (
            <span className="tabular-nums">
              {index + 1} من {attachments.length}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TableView({
  table,
  fontSize,
}: {
  table: { columns: string[]; rows: string[][] }
  fontSize: number
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border print:break-inside-auto">
      <table className="w-full" style={{ fontSize: `${Math.max(11, fontSize - 2)}px` }}>
        <thead className="bg-secondary/10 sticky top-0">
          <tr>
            {table.columns.map((c, i) => (
              <th
                key={i}
                className="text-right p-3 font-semibold border-b border-border"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/30 border-b border-border/40">
              {row.map((cell, j) => (
                <td key={j} className="p-3 border-l border-border/40 last:border-l-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
