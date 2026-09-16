'use client'

import { useAppStore } from '@/store/app-store'
import { Header } from '@/components/common/header'
import { Footer } from '@/components/common/footer'
import { ReadingProgress } from '@/components/common/reading-progress'
import { HomeView } from '@/components/public/home-view'
import { LegislationsView } from '@/components/public/legislations-view'
import { LegislationDetailView } from '@/components/public/legislation-detail-view'
import { SearchView } from '@/components/public/search-view'
import { NewsView, NewsDetailView, PublicPageView } from '@/components/public/content-views'
import { AccountView } from '@/components/public/account-view'
import { CompareView } from '@/components/public/compare-view'
import { AdminShell } from '@/components/admin/admin-shell'
import { useEffect } from 'react'

const VIEW_SLUG_MAP: Record<string, string> = {
  'legislative-system': 'legislative-system',
  'policies': 'policies-and-guides',
  'about': 'about',
  'contact': 'contact',
  'privacy': 'privacy',
  'terms': 'terms',
}

export default function Home() {
  const view = useAppStore((s) => s.view)
  const slug = useAppStore((s) => s.slug)
  const navigate = useAppStore((s) => s.navigate)

  // If a view requires a specific page slug (e.g. 'legislative-system'), ensure it
  useEffect(() => {
    if (view && VIEW_SLUG_MAP[view] && slug !== VIEW_SLUG_MAP[view]) {
      navigate(view as any, { slug: VIEW_SLUG_MAP[view] })
    }
  }, [view, slug, navigate])

  // Track key changes for logging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.debug('[Navigation]', view)
    }
  }, [view])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {view !== 'admin' && <Header />}
      {view !== 'admin' && view !== 'home' && <ReadingProgress />}
      <main id="main-content" className="flex-1 w-full">
        <ViewRouter view={view} />
      </main>
      {view !== 'admin' && <Footer />}
    </div>
  )
}

function ViewRouter({ view }: { view: string }) {
  switch (view) {
    case 'home':
      return <HomeView />
    case 'legislations':
      return <LegislationsView />
    case 'recent':
      return <LegislationsView preset="recent" />
    case 'popular':
      return <LegislationsView preset="popular" />
    case 'archive':
      return <LegislationsView preset="archive" />
    case 'constitution':
      return <LegislationsView preset="constitution" />
    case 'legislative-system':
    case 'policies':
    case 'about':
    case 'contact':
    case 'privacy':
    case 'terms':
      return <PublicPageView />
    case 'legislation-detail':
      return <LegislationDetailView />
    case 'search':
      return <SearchView />
    case 'news':
      return <NewsView />
    case 'news-detail':
      return <NewsDetailView />
    case 'page':
      return <PublicPageView />
    case 'account':
      return <AccountView />
    case 'compare':
      return <CompareView />
    case 'admin':
      return <AdminShell />
    default:
      return <HomeView />
  }
}
