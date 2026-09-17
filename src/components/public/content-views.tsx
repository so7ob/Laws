'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Newspaper, ChevronLeft, Calendar, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/constants'
import { Breadcrumb } from '@/components/common/breadcrumb'

export function NewsView() {
  const openNews = useAppStore((s) => s.openNews)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary mb-2 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#AC4459] to-[#344B61] flex items-center justify-center">
            <Newspaper className="h-5 w-5 text-white" />
          </div>
          الأخبار
        </h1>
        <p className="text-sm text-muted-foreground">آخر أخبار منصة التشريعات اليمنية</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            لا توجد أخبار منشورة
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((n) => (
            <Card key={n.id} className="hover:border-primary/40 transition-colors cursor-pointer" onClick={() => openNews(n.slug)}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    <Calendar className="h-3 w-3 ml-1" />
                    {formatDate(n.publishedAt)}
                  </Badge>
                </div>
                <h3 className="font-bold text-base mb-2 line-clamp-2 hover:text-primary transition-colors">{n.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{n.summary}</p>
                <div className="flex items-center justify-end text-xs text-primary">
                  اقرأ المزيد
                  <ArrowRight className="h-3 w-3 mr-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export function NewsDetailView() {
  const slug = useAppStore((s) => s.slug)
  const navigate = useAppStore((s) => s.navigate)
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/news?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setItem(d.item)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <p>الخبر غير موجود</p>
        <Button onClick={() => navigate('news')} className="mt-4">العودة للأخبار</Button>
      </div>
    )
  }

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb customCrumbs={[{ label: item.title, icon: Newspaper }]} />
      <div className="flex items-center gap-2 mb-3">
        <Badge className="bg-primary/10 text-primary border-primary/30">
          <Calendar className="h-3 w-3 ml-1" />
          {formatDate(item.publishedAt)}
        </Badge>
      </div>
      <h1 className="text-3xl font-bold text-secondary mb-3">{item.title}</h1>
      {item.summary && <p className="text-base text-muted-foreground mb-6 leading-relaxed border-b-2 border-primary/30 pb-4">{item.summary}</p>}
      <div className="prose prose-sm max-w-none legal-text">{item.body}</div>
    </article>
  )
}

export function PublicPageView() {
  const slug = useAppStore((s) => s.slug)
  const navigate = useAppStore((s) => s.navigate)
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/pages?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setItem(d.item)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <p>الصفحة غير موجودة</p>
        <Button onClick={() => navigate('home')} className="mt-4">العودة للرئيسية</Button>
      </div>
    )
  }

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8">
      <Breadcrumb customCrumbs={[{ label: item.title }]} />
      <h1 className="text-3xl font-bold text-secondary mb-3">{item.title}</h1>
      {item.intro && <p className="text-base text-muted-foreground mb-6 leading-relaxed border-b-2 border-primary/30 pb-4">{item.intro}</p>}
      {item.content && <p className="legal-text text-base mb-8 leading-loose">{item.content}</p>}
      {item.sections && item.sections.length > 0 && (
        <div className="space-y-8">
          {item.sections.map((s: any) => (
            <section key={s.id}>
              <h2 className="text-xl font-bold text-secondary mb-3 flex items-center gap-2">
                <span className="h-1.5 w-6 bg-primary rounded-full" />
                {s.title}
              </h2>
              <p className="legal-text text-sm leading-loose text-foreground/90">{s.body}</p>
            </section>
          ))}
        </div>
      )}
    </article>
  )
}
