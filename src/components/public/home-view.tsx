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
  Sparkles,
  GitCompare,
  Bookmark,
  Newspaper,
  Quote,
  Layers,
  Clock,
  Users,
  Building2,
  CheckCircle2,
} from 'lucide-react'
import { LEGAL_STATUS_LABELS, formatDate, relativeTime } from '@/lib/constants'
import { RecentlyViewed } from '@/components/public/recently-viewed'

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
  breakdowns?: {
    types: any[]
    years: any[]
    statuses: any[]
    verification: any[]
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

const RESEARCHER_TOOLS = [
  { label: 'حساب الباحث', target: 'account' as const, icon: Bookmark, desc: 'مفضلاتك وبحوثك وملاحظاتك' },
  { label: 'مقارنة التشريعات', target: 'compare' as const, icon: GitCompare, desc: 'قارن تشريعين جنبًا إلى جنب' },
  { label: 'البحث المتقدم', target: 'search' as const, icon: Search, desc: 'بحث في النصوص والمواد والملاحق' },
  { label: 'المنظومة التشريعية', target: 'legislative-system' as const, icon: Network, desc: 'فهم بنية التشريعات اليمنية' },
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

const FEATURED_QUOTES = [
  {
    text: 'الشريعة الإسلامية مصدر جميع التشريعات',
    source: 'دستور الجمهورية اليمنية، المادة الثانية',
    slug: 'constitution-2001',
  },
  {
    text: 'لا جريمة ولا عقوبة إلا بنص قانوني',
    source: 'قانون الجرائم والعقوبات، المادة الأولى',
    slug: 'penal-code-1994',
  },
  {
    text: 'المواطنون جميعهم متساوون في الحقوق والواجبات',
    source: 'دستور الجمهورية اليمنية، المادة السابعة',
    slug: 'constitution-2001',
  },
]

export function HomeView() {
  const navigate = useAppStore((s) => s.navigate)
  const openLegislation = useAppStore((s) => s.openLegislation)
  const [stats, setStats] = useState<Stats | null>(null)
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [heroSearch, setHeroSearch] = useState('')
  const [featuredQuote, setFeaturedQuote] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then((r) => r.json()),
      fetch('/api/news').then((r) => r.json()).catch(() => ({ items: [] })),
    ])
      .then(([s, n]) => {
        setStats(s)
        setNews(n.items || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Rotate featured quote every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedQuote((q) => (q + 1) % FEATURED_QUOTES.length)
    }, 6000)
    return () => clearInterval(interval)
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
        <div className="absolute inset-0 pattern-arabesque opacity-10" />
        {/* Decorative SVG - elegant geometric pattern */}
        <svg className="absolute top-0 right-0 w-32 h-32 opacity-20" viewBox="0 0 128 128" fill="none">
          <path d="M0,0 L128,0 L128,128" stroke="white" strokeWidth="1.5" fill="none"/>
          <path d="M0,0 L96,0 L96,96" stroke="white" strokeWidth="0.5" fill="none" opacity="0.6"/>
          <path d="M0,0 L64,0 L64,64" stroke="white" strokeWidth="0.5" fill="none" opacity="0.4"/>
          <path d="M0,0 L32,0 L32,32" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3"/>
        </svg>
        <svg className="absolute bottom-0 left-0 w-32 h-32 opacity-20 rotate-180" viewBox="0 0 128 128" fill="none">
          <path d="M0,0 L128,0 L128,128" stroke="white" strokeWidth="1.5" fill="none"/>
          <path d="M0,0 L96,0 L96,96" stroke="white" strokeWidth="0.5" fill="none" opacity="0.6"/>
          <path d="M0,0 L64,0 L64,64" stroke="white" strokeWidth="0.5" fill="none" opacity="0.4"/>
          <path d="M0,0 L32,0 L32,32" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3"/>
        </svg>
        {/* Subtle floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 rounded-full bg-white/20 animate-float" />
        <div className="absolute top-40 right-32 w-1.5 h-1.5 rounded-full bg-white/30 animate-float delay-300" />
        <div className="absolute bottom-32 right-20 w-1 h-1 rounded-full bg-white/40 animate-float delay-500" />

        <div className="container relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/15 mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 ml-1.5" />
              المنصة الوطنية المرجعية للتشريعات
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight animate-fade-in-up delay-100">
              منصة التشريعات اليمنية
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-8 leading-relaxed max-w-2xl mx-auto animate-fade-in-up delay-200">
              مرجعية قانونية موثوقة ومرتبة زمنيًا تجمع التشريعات اليمنية النافذة،
              وتدعم البحث المتقدم والنسخ التاريخية والملاحق والعلاقات القانونية.
            </p>
            <form onSubmit={onHeroSearch} className="max-w-2xl mx-auto animate-fade-in-up delay-300">
              <div className="relative group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="search"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="ابحث في نصوص التشريعات... مثل: دستور، قانون العمل، ضريبة الدخل"
                  className="pr-12 pl-32 h-14 text-base bg-white shadow-lg group-focus-within:shadow-xl transition-shadow"
                />
                <Button
                  type="submit"
                  className="absolute left-1.5 top-1.5 bottom-1.5 h-auto"
                  size="sm"
                >
                  <Search className="h-4 w-4 ml-1" />
                  بحث
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['العمل', 'الجنايات', 'الضرائب', 'الجمارك', 'الاستثمار'].map((q, i) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => navigate('search', { query: q })}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 transition-all hover:scale-105 animate-fade-in"
                    style={{ animationDelay: `${400 + i * 50}ms` }}
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
      <section className="border-b border-border/40 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-section-soft" />
        <div className="container relative mx-auto max-w-7xl px-4">
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
                <StatItem label="التشريعات" value={stats.counts.legislations} icon={Scale} delay={0} />
                <StatItem label="المواد" value={stats.counts.articles} icon={FileText} delay={50} />
                <StatItem label="التعديلات" value={stats.counts.amendments} icon={History} delay={100} />
                <StatItem label="العلاقات" value={stats.counts.relations} icon={Network} delay={150} />
                <StatItem label="الملاحق" value={stats.counts.attachments} icon={BookOpen} delay={200} />
                <StatItem label="الموضوعات" value={stats.counts.subjects} icon={Star} delay={250} />
                <StatItem label="الجهات المُصدِرة" value={stats.counts.authorities} icon={Gavel} delay={300} />
                <StatItem label="المنشورة" value={stats.counts.published} icon={TrendingUp} delay={350} />
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map((q, i) => {
            const Icon = q.icon
            return (
              <button
                key={q.target}
                onClick={() => navigate(q.target)}
                className="group rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-card-hover card-lift p-4 text-right animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${q.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-sm font-semibold">{q.label}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Recently Viewed */}
      <section className="container mx-auto max-w-7xl px-4 pb-8">
        <RecentlyViewed />
      </section>

      {/* Featured Quote */}
      <section className="container mx-auto max-w-7xl px-4 pb-8">
        <Card className="relative overflow-hidden border-t-4 border-t-primary">
          <div className="absolute inset-0 pattern-arabesque opacity-30" />
          <CardContent className="relative p-8 md:p-12 text-center">
            <Quote className="h-10 w-10 mx-auto mb-4 text-primary/40" />
            <blockquote className="text-xl md:text-2xl font-medium mb-4 leading-relaxed transition-all duration-500" key={featuredQuote}>
              <span className="gradient-text-shimmer">«{FEATURED_QUOTES[featuredQuote].text}»</span>
            </blockquote>
            <cite className="text-sm text-muted-foreground not-italic">
              — {FEATURED_QUOTES[featuredQuote].source}
            </cite>
            <div className="mt-4 flex justify-center gap-1.5">
              {FEATURED_QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFeaturedQuote(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === featuredQuote ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  }`}
                  aria-label={`اقتباس ${i + 1}`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-primary hover:text-primary/80"
              onClick={() => openLegislation(FEATURED_QUOTES[featuredQuote].slug)}
            >
              اقرأ التشريع كاملًا
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Recent Legislation + Sidebar */}
      <section className="container mx-auto max-w-7xl px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Legislation - takes 2/3 */}
          <div className="lg:col-span-2">
            <div className="flex items-end justify-between mb-6 border-b border-border pb-3">
              <div>
                <h2 className="text-2xl font-bold text-secondary flex items-center gap-2">
                  <div className="h-8 w-1.5 rounded-full bg-primary" />
                  أحدث التشريعات
                </h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {stats?.recent.slice(0, 4).map((leg: any, i: number) => {
                  const status = LEGAL_STATUS_LABELS[leg.legalStatus] || LEGAL_STATUS_LABELS.active
                  return (
                    <button
                      key={leg.id}
                      onClick={() => openLegislation(leg.slug)}
                      className="group rounded-xl border border-border bg-card hover:border-primary/50 card-lift overflow-hidden text-right animate-fade-in-up"
                      style={{ animationDelay: `${i * 75}ms` }}
                    >
                      <div className="h-1.5 bg-gradient-to-l from-[#AC4459] to-[#344B61]" />
                      <div className="p-6">
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
                        <p className="text-xs text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                          {leg.preamble}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-3">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {leg.authority?.nameAr}
                          </span>
                          <span dir="ltr" className="article-number">{leg.year?.toLocaleString('ar-EG')}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar - Researcher tools + news */}
          <div className="space-y-6">
            {/* Researcher Tools */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  أدوات الباحث
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {RESEARCHER_TOOLS.map((t) => {
                  const Icon = t.icon
                  return (
                    <button
                      key={t.target}
                      onClick={() => navigate(t.target)}
                      className="w-full flex items-center gap-3 rounded-md p-2.5 hover:bg-card border border-transparent hover:border-border transition-all text-right group"
                    >
                      <div className="h-9 w-9 rounded-md bg-card border border-border flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{t.label}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{t.desc}</div>
                      </div>
                      <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Latest News */}
            {news.length > 0 && (
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-secondary/10 flex items-center justify-center">
                      <Newspaper className="h-4 w-4 text-secondary" />
                    </div>
                    آخر الأخبار
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('news')}>
                    الكل
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {news.slice(0, 3).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => useAppStore.getState().openNews(n.slug)}
                      className="w-full text-right group"
                    >
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {relativeTime(n.publishedAt)}
                      </div>
                      <div className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                        {n.title}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="bg-section-soft border-y border-border/40 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-3 bg-primary/5 border-primary/20 text-primary">
              <Layers className="h-3 w-3 ml-1" />
              تصفح حسب الموضوع
            </Badge>
            <h2 className="text-2xl font-bold text-secondary">الموضوعات القانونية</h2>
            <p className="text-sm text-muted-foreground mt-2">
              استكشف التشريعات حسب الموضوعات القانونية الرئيسية
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SUBJECT_CARDS.map((s, i) => {
              const Icon = s.icon
              return (
                <button
                  key={s.title}
                  onClick={() => navigate('legislations', {})}
                  className="rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-card card-lift p-4 text-right animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={`h-10 w-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="font-semibold text-sm mb-1">{s.title}</div>
                  <div className="text-xs text-muted-foreground article-number">{s.count} تشريع</div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Workflow / Process Section */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-secondary mb-2">منصة متكاملة لكل المهتمين بالقانون</h2>
          <p className="text-sm text-muted-foreground">
            مصممة لخدمة المواطن والباحث والمختص القانوني والمؤسسات
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ProcessCard
            icon={Users}
            title="للمواطن"
            desc="وصول سهل ومجاني للنصوص القانونية النافذة مع بحث متقدم"
            color="from-[#AC4459]/10 to-[#7a2f3e]/10"
            iconColor="text-[#AC4459]"
          />
          <ProcessCard
            icon={ScrollText}
            title="للباحث"
            desc="نسخ زمنية ومقارنات وملاحظات وبحوث محفوظة"
            color="from-[#344B61]/10 to-[#243446]/10"
            iconColor="text-[#344B61]"
          />
          <ProcessCard
            icon={Gavel}
            title="للمختص القانوني"
            desc="علاقات قانونية موجهة ومصادر موثقة وتتبع تعديلات"
            color="from-[#8b6f47]/10 to-[#5a472f]/10"
            iconColor="text-[#8b6f47]"
          />
          <ProcessCard
            icon={Building2}
            title="للمؤسسات"
            desc="حوكمة كاملة للصلاحيات والسياسات وسجل التدقيق"
            color="from-[#6b8e9e]/10 to-[#3e5e72]/10"
            iconColor="text-[#6b8e9e]"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-br from-secondary to-[#243446] text-white p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 pattern-arabesque opacity-10" />
          <svg className="absolute top-0 right-0 w-32 h-32 opacity-20" viewBox="0 0 128 128" fill="none">
            <path d="M0,0 L128,0 L128,128" stroke="white" strokeWidth="1.5" fill="none"/>
            <path d="M0,0 L96,0 L96,96" stroke="white" strokeWidth="0.5" fill="none" opacity="0.6"/>
            <path d="M0,0 L64,0 L64,64" stroke="white" strokeWidth="0.5" fill="none" opacity="0.4"/>
          </svg>
          <div className="relative grid md:grid-cols-2 gap-6 items-center">
            <div>
              <Badge className="bg-white/10 border-white/20 text-white mb-3">
                <Shield className="h-3 w-3 ml-1" />
                لوحة الإدارة المتكاملة
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                بوابة الإدارة المتكاملة
              </h2>
              <p className="text-white/80 mb-6 leading-relaxed">
                يتيح قسم الإدارة للمختصين إدخال التشريعات واستيرادها ومراجعتها
                واعتمادها ونشرها، مع إدارة الصلاحيات والسياسات والتدقيق والجودة.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => navigate('admin')}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Shield className="h-4 w-4 ml-1.5" />
                  دخول لوحة الإدارة
                </Button>
                <Button
                  onClick={() => navigate('policies')}
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

      {/* Trust / Footer Banner */}
      <section className="container mx-auto max-w-7xl px-4 pb-12">
        <Card className="bg-gradient-to-l from-primary/5 via-transparent to-secondary/5 border-primary/20">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <div>
                <div className="font-bold text-secondary">بيانات موثوقة ومرتبة زمنيًا</div>
                <div className="text-xs text-muted-foreground">جميع التشريعات موسومة تجريبيًا لأغراض العرض</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-card">
                <CheckCircle2 className="h-3 w-3 ml-1 text-emerald-600" />
                تحقق كامل
              </Badge>
              <Badge variant="outline" className="bg-card">
                <History className="h-3 w-3 ml-1 text-amber-600" />
                نسخ زمنية
              </Badge>
              <Badge variant="outline" className="bg-card">
                <Network className="h-3 w-3 ml-1 text-blue-600" />
                علاقات قانونية
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function StatItem({ label, value, icon: Icon, delay = 0 }: { label: string; value: number; icon: any; delay?: number }) {
  return (
    <div className="text-center animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
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
    <div className="rounded-lg bg-white/10 border border-white/20 p-4 text-center backdrop-blur-sm hover:bg-white/15 transition-colors">
      <Icon className="h-6 w-6 mx-auto mb-2 text-white/80" />
      <div className="text-xs">{label}</div>
    </div>
  )
}

function ProcessCard({ icon: Icon, title, desc, color, iconColor }: { icon: any; title: string; desc: string; color: string; iconColor: string }) {
  return (
    <Card className={`card-lift border-border/60 bg-gradient-to-br ${color}`}>
      <CardContent className="p-5">
        <div className="h-12 w-12 rounded-lg bg-card border border-border flex items-center justify-center mb-3">
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <h3 className="font-bold text-base mb-2 text-secondary">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  )
}
