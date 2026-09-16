'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  Scale,
  BookOpen,
  FileText,
  Network,
  History,
  Shield,
  Star,
  Archive,
  TrendingUp,
  Gavel,
  ScrollText,
  ArrowLeft,
  ChevronLeft,
} from 'lucide-react'
import { LEGAL_STATUS_LABELS, formatDate, relativeTime } from '@/lib/constants'

interface Stats {
  counts: {
    legislations: number
    published: number
    articles: number
    amendments: number
    relations: number
    attachments: number
    subjects: number
    authorities: number
  }
  recent: any[]
}

const QUICK_LINKS = [
  { label: 'الدستور', target: 'constitution' as const, icon: BookOpen, color: 'from-[#AC4459] to-[#7a2f3e]' },
  { label: 'القوانين', target: 'legislations' as const, icon: Scale, color: 'from-[#344B61] to-[#243446]' },
  { label: 'أحدث التشريعات', target: 'recent' as const, icon: History, color: 'from-[#8b6f47] to-[#5a472f]' },
  { label: 'الأكثر اطلاعًا', target: 'popular' as const, icon: TrendingUp, color: 'from-[#6b8e9e] to-[#3e5e72]' },
  { label: 'الأرشيف', target: 'archive' as const, icon: Archive, color: 'from-[#5a472f] to-[#3e3120]' },
  { label: 'البحث المتقدم', target: 'search' as const, icon: Search, color: 'from-[#7a2f3e] to-[#5a1f2c]' },
]

const SUBJECT_CARDS = [
  { title: 'الشؤون الدستورية', icon: BookOpen, count: 5, color: 'bg-[#AC4459]/10' },
  { title: 'القانون المدني', icon: ScrollText, count: 8, color: 'bg-[#344B61]/10' },
  { title: 'القانون الجنائي', icon: Gavel, count: 3, color: 'bg-[#8b6f47]/10' },
  { title: 'القانون التجاري', icon: FileText, count: 4, color: 'bg-[#6b8e9e]/10' },
  { title: 'القوانين الضريبية', icon: FileText, count: 4, color: 'bg-[#5a472f]/10' },
  { title: 'قانون العمل', icon: ScrollText, count: 2, color: 'bg-[#7a2f3e]/10' },
  { title: 'القانون المصرفي', icon: Network, count: 2, color: 'bg-[#243446]/10' },
  { title: 'الأحوال الشخصية', icon: BookOpen, count: 1, color: 'bg-[#5a1f2c]/10' },
]

export function HomeView() {
  const navigate = useAppStore((s) => s.navigate)
  const openLegislation = useAppStore((s) => s.openLegislation)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [heroSearch, setHeroSearch] = useState('')

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => {
        setStats(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function onHeroSearch(e: React.FormEvent) {
    e.preventDefault()
    if (heroSearch.trim()) {
      navigate('search', { query: heroSearch.trim() })
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#AC4459]/20 via-transparent to-[#344B61]/20" />
        <div className="container relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/15 mb-6">
              <Star className="h-3.5 w-3.5 ml-1.5" />
              المنصة الوطنية المرجعية للتشريعات
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              منصة التشريعات اليمنية
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-8 leading-relaxed max-w-2xl mx-auto">
              مرجعية قانونية موثوقة ومرتبة زمنيًا تجمع التشريعات اليمنية النافذة،
              وتدعم البحث المتقدم والنسخ التاريخية والملاحق والعلاقات القانونية.
            </p>
            <form onSubmit={onHeroSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="ابحث في نصوص التشريعات... مثل: دستور، قانون العمل، ضريبة الدخل"
                  className="pr-12 pl-32 h-14 text-base bg-white shadow-lg"
                />
                <Button
                  type="submit"
                  className="absolute left-1.5 top-1.5 bottom-1.5 h-auto"
                  size="sm"
                >
                  بحث
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['العمل', 'الجنايات', 'الضرائب', 'الجمارك', 'الاستثمار'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => navigate('search', { query: q })}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-12" preserveAspectRatio="none">
            <path d="M0,80 L0,40 Q360,0 720,40 T1440,40 L1440,80 Z" fill="currentColor" className="text-background"/>
          </svg>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-b border-border/40 bg-card">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 py-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-10 w-16 mx-auto mb-1" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))
            ) : stats ? (
              <>
                <StatItem label="التشريعات" value={stats.counts.legislations} icon={Scale} />
                <StatItem label="المواد" value={stats.counts.articles} icon={FileText} />
                <StatItem label="التعديلات" value={stats.counts.amendments} icon={History} />
                <StatItem label="العلاقات" value={stats.counts.relations} icon={Network} />
                <StatItem label="الملاحق" value={stats.counts.attachments} icon={BookOpen} />
                <StatItem label="الموضوعات" value={stats.counts.subjects} icon={Star} />
                <StatItem label="الجهات المُصدِرة" value={stats.counts.authorities} icon={Gavel} />
                <StatItem label="المنشورة" value={stats.counts.published} icon={TrendingUp} />
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map((q) => {
            const Icon = q.icon
            return (
              <button
                key={q.target}
                onClick={() => navigate(q.target)}
                className="group rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-card-hover transition-all p-4 text-right"
              >
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${q.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-sm font-semibold">{q.label}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Recent Legislation */}
      <section className="container mx-auto max-w-7xl px-4 pb-12">
        <div className="flex items-end justify-between mb-6 border-b border-border pb-3">
          <div>
            <h2 className="text-2xl font-bold text-secondary">أحدث التشريعات</h2>
            <p className="text-sm text-muted-foreground mt-1">
              آخر التشريعات المنشورة على المنصة
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('recent')}>
            عرض الكل
            <ChevronLeft className="h-4 w-4 mr-1" />
          </Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.recent.slice(0, 6).map((leg: any) => {
              const status = LEGAL_STATUS_LABELS[leg.legalStatus] || LEGAL_STATUS_LABELS.active
              return (
                <button
                  key={leg.id}
                  onClick={() => openLegislation(leg.slug)}
                  className="group rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-card-hover transition-all overflow-hidden text-right"
                >
                  <div className="h-2 bg-gradient-to-l from-[#AC4459] to-[#344B61]" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        {leg.type?.nameAr}
                      </Badge>
                      <Badge variant="secondary" className={`text-[11px] ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {leg.officialTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {leg.preamble}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-3">
                      <span>{leg.authority?.nameAr}</span>
                      <span dir="ltr">{leg.year}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* Subjects Grid */}
      <section className="bg-muted/40 border-y border-border/40 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-secondary">تصفح حسب الموضوع</h2>
            <p className="text-sm text-muted-foreground mt-2">
              استكشف التشريعات حسب الموضوعات القانونية
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SUBJECT_CARDS.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.title}
                  onClick={() => navigate('legislations', {})}
                  className="rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-card transition-all p-4 text-right"
                >
                  <div className={`h-10 w-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="font-semibold text-sm mb-1">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.count} تشريع</div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-br from-secondary to-[#243446] text-white p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-10" />
          <div className="relative grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                بوابة الإدارة المتكاملة
              </h2>
              <p className="text-white/80 mb-6 leading-relaxed">
                يتيح قسمم الإدارة للمختصين إدخال التشريعات واستيرادها ومراجعتها
                واعتمادها ونشرها، مع إدارة الصلاحيات والسياسات والتدقيق والجودة.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => navigate('admin')}
                  variant="default"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Shield className="h-4 w-4 ml-1.5" />
                  دخول لوحة الإدارة
                </Button>
                <Button
                  onClick={() => navigate('page', { slug: 'policies-and-guides' })}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  الاطلاع على الأدلة
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AdminMiniCard icon={FileText} label="إدارة المحتوى" />
              <AdminMiniCard icon={History} label="الاستيراد" />
              <AdminMiniCard icon={Shield} label="الصلاحيات" />
              <AdminMiniCard icon={Gavel} label="السياسات" />
              <AdminMiniCard icon={Star} label="الجودة" />
              <AdminMiniCard icon={Archive} label="سلة الحذف" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatItem({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <Icon className="h-4 w-4 text-primary" />
        <div className="text-2xl font-bold text-secondary article-number">{value.toLocaleString('ar-EG')}</div>
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function AdminMiniCard({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="rounded-lg bg-white/10 border border-white/20 p-4 text-center backdrop-blur-sm">
      <Icon className="h-6 w-6 mx-auto mb-2 text-white/80" />
      <div className="text-xs">{label}</div>
    </div>
  )
}
