'use client'

import { useAppStore } from '@/store/app-store'
import { ChevronLeft, Home, Scale, Search, Newspaper, FileText, BookOpen, GitCompare, GitBranch, User, Shield, History, Archive, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Crumb {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
}

const VIEW_LABELS: Record<string, { label: string; icon: any }> = {
  legislations: { label: 'التشريعات', icon: Scale },
  recent: { label: 'أحدث التشريعات', icon: History },
  popular: { label: 'الأكثر اطلاعًا', icon: Star },
  archive: { label: 'الأرشيف', icon: Archive },
  constitution: { label: 'الدستور', icon: BookOpen },
  'legislative-system': { label: 'المنظومة التشريعية', icon: FileText },
  policies: { label: 'السياسات والأدلة', icon: FileText },
  search: { label: 'البحث المتقدم', icon: Search },
  news: { label: 'الأخبار', icon: Newspaper },
  'news-detail': { label: 'الأخبار', icon: Newspaper },
  page: { label: 'صفحة', icon: FileText },
  account: { label: 'حساب الباحث', icon: User },
  compare: { label: 'مقارنة التشريعات', icon: GitCompare },
  stats: { label: 'إحصاءات المنصة', icon: FileText },
  timeline: { label: 'الخط الزمني', icon: GitBranch },
  'legislation-detail': { label: 'تفاصيل التشريع', icon: Scale },
  admin: { label: 'لوحة الإدارة', icon: Shield },
}

export function Breadcrumb({ customCrumbs }: { customCrumbs?: Crumb[] }) {
  const view = useAppStore((s) => s.view)
  const slug = useAppStore((s) => s.slug)
  const goHome = useAppStore((s) => s.goHome)
  const navigate = useAppStore((s) => s.navigate)

  // Don't show breadcrumb on home
  if (view === 'home') return null

  const crumbs: Crumb[] = [
    { label: 'الرئيسية', icon: Home, onClick: goHome },
  ]

  const viewMeta = VIEW_LABELS[view]
  if (viewMeta) {
    crumbs.push({
      label: viewMeta.label,
      icon: viewMeta.icon,
      onClick: view !== 'legislation-detail' && view !== 'news-detail' && view !== 'page'
        ? () => navigate(view as any, slug ? { slug } : {})
        : undefined,
    })
  }

  // Add specific context for detail views
  if (view === 'legislation-detail' && slug) {
    // Will be replaced by customCrumbs if provided
  }

  if (customCrumbs && customCrumbs.length > 0) {
    crumbs.push(...customCrumbs)
  }

  return (
    <nav
      aria-label="مسار التنقل"
      className="flex items-center gap-1 text-sm text-muted-foreground mb-4 flex-wrap"
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        const Icon = crumb.icon
        const clickable = !!crumb.onClick && !isLast
        return (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronLeft className="h-3 w-3 text-muted-foreground/60" />}
            {clickable ? (
              <button
                onClick={crumb.onClick}
                className="flex items-center gap-1.5 hover:text-primary transition-colors link-underline"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span>{crumb.label}</span>
              </button>
            ) : (
              <span
                className={cn(
                  'flex items-center gap-1.5',
                  isLast && 'text-foreground font-medium'
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span className="truncate max-w-[300px]">{crumb.label}</span>
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
