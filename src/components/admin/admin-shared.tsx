'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Format a number using Arabic-Indic digits
export function arNum(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  try {
    return n.toLocaleString('ar-EG')
  } catch {
    return String(n)
  }
}

// Generic loading grid of skeleton cards
export function LoadingGrid({
  count = 6,
  cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}: {
  count?: number
  cols?: string
}) {
  return (
    <div className={cn('grid gap-4', cols)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Table-style loading skeleton (rows)
export function LoadingRows({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-5', c === 0 ? 'flex-1' : 'w-20')} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  title = 'لا توجد بيانات',
  description,
  icon: Icon,
  action,
}: {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-16 flex flex-col items-center justify-center text-center gap-4">
        {Icon && (
          <div className="size-14 rounded-full bg-muted flex items-center justify-center">
            <Icon className="size-7 text-muted-foreground" />
          </div>
        )}
        <div className="space-y-1">
          <p className="text-lg font-semibold">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
          )}
        </div>
        {action}
      </CardContent>
    </Card>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="py-10 flex flex-col items-center justify-center text-center gap-2">
        <p className="text-base font-semibold text-destructive">تعذّر تحميل البيانات</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-secondary">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}

// Color a badge for a workflow / legal status using the constants color classes.
export function StatusBadge({
  label,
  color,
  className,
}: {
  label: string
  color?: string
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn(color, className)}>
      {label}
    </Badge>
  )
}

// Simple horizontal bar chart row, no recharts.
export function BarRow({
  label,
  value,
  max,
  color = 'bg-primary',
}: {
  label: string
  value: number
  max: number
  color?: string
}) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-28 shrink-0 truncate text-muted-foreground">{label}</div>
      <div className="flex-1 h-6 bg-muted/50 rounded overflow-hidden">
        <div
          className={cn('h-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-10 text-end font-semibold tabular-nums">{arNum(value)}</div>
    </div>
  )
}

// Truncate an id for display
export function shortId(id: string | null | undefined, len = 10): string {
  if (!id) return '—'
  return id.length > len ? id.slice(0, len) + '…' : id
}
