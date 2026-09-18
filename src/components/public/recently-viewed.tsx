'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, X, History } from 'lucide-react'
import { relativeTime, formatYear } from '@/lib/constants'

interface RecentItem {
  slug: string
  title: string
  type?: string
  year?: number
  viewedAt: string
}

export function RecentlyViewed() {
  const openLegislation = useAppStore((s) => s.openLegislation)
  const [items, setItems] = useState<RecentItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    try {
      const stored = localStorage.getItem('recentlyViewed')
      if (stored) {
        const parsed: RecentItem[] = JSON.parse(stored)
        // Sanitize: drop items without a slug, then deduplicate by slug
        // (keep the most recent entry per slug). This guards against stale
        // localStorage data that may have accumulated duplicate or
        // malformed entries, which would otherwise cause React unique
        // key warnings when rendering the list.
        const seen = new Set<string>()
        const deduped: RecentItem[] = []
        for (const item of parsed) {
          if (!item || !item.slug) continue
          if (seen.has(item.slug)) continue
          seen.add(item.slug)
          deduped.push(item)
        }
        setItems(deduped)
      }
    } catch {}
  }, [])

  function handleRemove(slug: string, e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    const updated = items.filter((i) => i.slug !== slug)
    setItems(updated)
    try {
      localStorage.setItem('recentlyViewed', JSON.stringify(updated))
    } catch {}
  }

  function handleClear() {
    setItems([])
    try {
      localStorage.removeItem('recentlyViewed')
    } catch {}
  }

  if (!mounted || items.length === 0) return null

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
            <History className="h-4 w-4 text-primary" />
          </div>
          شوهد مؤخرًا
          <Badge variant="secondary" className="text-[10px] article-number">
            {items.length.toLocaleString('ar-EG')}
          </Badge>
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={handleClear}>
          مسح الكل
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {items.slice(0, 6).map((item, idx) => (
            <div
              key={`${item.slug}-${idx}`}
              onClick={() => openLegislation(item.slug)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openLegislation(item.slug)
                }
              }}
              className="group relative flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 hover:border-primary/40 hover:shadow-sm card-lift text-right transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {item.title}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                  {item.type && <Badge variant="outline" className="text-[9px] py-0 px-1.5">{item.type}</Badge>}
                  {item.year && <span className="article-number">{formatYear(item.year)}</span>}
                  <span>•</span>
                  <span>{relativeTime(item.viewedAt)}</span>
                </div>
              </div>
              <button
                onClick={(e) => handleRemove(item.slug, e)}
                className="absolute top-1 left-1 h-6 w-6 rounded-full bg-background/80 hover:bg-destructive/10 hover:text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                aria-label="إزالة من القائمة"
                title="إزالة"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
