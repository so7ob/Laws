'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { AppShell } from '@/components/app-shell'

/**
 * /s?q=<phrase> — stable, shareable URL for search.
 *
 * Reads the `q` query parameter on mount and hydrates the Zustand store
 * (navigate to the 'search' view with the given query), then renders the
 * shared AppShell which displays the SearchView.
 *
 * Visiting /s?q=العمل directly opens the search results for "العمل".
 */
export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const navigate = useAppStore((s) => s.navigate)
  const view = useAppStore((s) => s.view)
  const storeQuery = useAppStore((s) => s.searchQuery)

  useEffect(() => {
    let cancelled = false
    searchParams.then(({ q }) => {
      if (cancelled) return
      const query = q || ''
      // Only navigate if we're not already showing this exact search.
      if (view !== 'search' || storeQuery !== query) {
        navigate('search', { query })
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return <AppShell />
}
