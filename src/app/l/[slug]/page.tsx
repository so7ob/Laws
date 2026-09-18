'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { AppShell } from '@/components/app-shell'

/**
 * /l/[slug] — stable, shareable URL for a legislation detail page.
 *
 * The app is a single-route SPA driven by a Zustand store; this route
 * acts as a deep-link entry point. On mount it hydrates the store with
 * the slug from the URL (calling openLegislation), then renders the
 * shared AppShell which will display the LegislationDetailView.
 *
 * After hydration the user can navigate normally (back to home, to
 * another legislation, etc.) via the in-app UI; the URL stays on
 * /l/[slug] until they navigate elsewhere via the browser.
 */
export default function LegislationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const openLegislation = useAppStore((s) => s.openLegislation)
  const view = useAppStore((s) => s.view)
  const storeSlug = useAppStore((s) => s.slug)

  useEffect(() => {
    // params is a Promise in Next.js 15+. We only need the slug here.
    let cancelled = false
    params.then(({ slug }) => {
      if (cancelled) return
      // Only navigate if we're not already showing this legislation
      // (avoids resetting internal tab state on re-renders).
      if (view !== 'legislation-detail' || storeSlug !== slug) {
        openLegislation(slug)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return <AppShell />
}
