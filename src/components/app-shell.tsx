'use client'

import { useAppStore } from '@/store/app-store'
import { Header } from '@/components/common/header'
import { Footer } from '@/components/common/footer'
import { ReadingProgress } from '@/components/common/reading-progress'
import { KeyboardShortcuts } from '@/components/common/keyboard-shortcuts'
import { PageTransition } from '@/components/common/page-transition'
import { HomeView } from '@/components/public/home-view'
import { LoginView } from '@/components/public/login-view'
import { LegislationsView } from '@/components/public/legislations-view'
import { LegislationDetailView } from '@/components/public/legislation-detail-view'
import { SearchView } from '@/components/public/search-view'
import { NewsView, NewsDetailView, PublicPageView } from '@/components/public/content-views'
import { AccountView } from '@/components/public/account-view'
import { CompareView } from '@/components/public/compare-view'
import { StatsView } from '@/components/public/stats-view'
import { TimelineView } from '@/components/public/timeline-view'
import { GlossaryView } from '@/components/public/glossary-view'
import { FAQView } from '@/components/public/faq-view'
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

/**
 * ViewRouter — renders the active view based on the Zustand store state.
 * Shared between '/' and '/l/[slug]' so every route renders the same UI.
 */
export function ViewRouter({ view }: { view: string }) {
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
    case 'stats':
      return <StatsView />
    case 'timeline':
      return <TimelineView />
    case 'glossary':
      return <GlossaryView />
    case 'faq':
      return <FAQView />
    case 'admin':
      return <AdminShell />
    case 'login':
      return <LoginView />
    default:
      return <HomeView />
  }
}

/**
 * AppShell — the root layout shared by all routes.
 *
 * Reads the active view from the Zustand store and renders the matching
 * component inside the standard chrome (Header, Footer, ReadingProgress,
 * KeyboardShortcuts). Routes like '/l/[slug]' call openLegislation() on
 * mount to set the store before this shell renders the detail view.
 */
export function AppShell() {
  const view = useAppStore((s) => s.view)
  const slug = useAppStore((s) => s.slug)
  const navigate = useAppStore((s) => s.navigate)

  // If a view requires a specific page slug (e.g. 'legislative-system'), sync.
  useEffect(() => {
    if (view && VIEW_SLUG_MAP[view] && slug !== VIEW_SLUG_MAP[view]) {
      navigate(view as any, { slug: VIEW_SLUG_MAP[view] })
    }
  }, [view, slug, navigate])

  // Track key changes for debugging.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.debug('[Navigation]', view)
    }
  }, [view])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {view !== 'admin' && view !== 'login' && <Header />}
      {view !== 'admin' && view !== 'home' && view !== 'login' && <ReadingProgress />}
      <main id="main-content" className="flex-1 w-full">
        <PageTransition trigger={view}>
          <ViewRouter view={view} />
        </PageTransition>
      </main>
      {view !== 'admin' && view !== 'login' && <Footer />}
      {view !== 'admin' && view !== 'login' && <KeyboardShortcuts />}
    </div>
  )
}
