import { create } from 'zustand'

export type View =
  | 'home'
  | 'legislations'
  | 'legislation-detail'
  | 'recent'
  | 'popular'
  | 'archive'
  | 'constitution'
  | 'legislative-system'
  | 'search'
  | 'policies'
  | 'news'
  | 'news-detail'
  | 'page'
  | 'admin'
  | 'login'
  | 'account'
  | 'compare'
  | 'stats'
  | 'timeline'
  | 'glossary'
  | 'faq'

interface AuthUser {
  id: string
  username: string
  email: string
  fullName: string
  roles: { code: string; nameAr: string }[]
}

interface AppState {
  view: View
  slug: string | null // legislation slug or page slug
  articleId: string | null
  versionId: string | null
  activeTab: string // tab within detail page
  // admin sub-view
  adminSection: string
  // auth
  authUser: AuthUser | null
  authChecked: boolean
  setAuthUser: (u: AuthUser | null) => void
  setAuthChecked: (c: boolean) => void

  // search
  searchQuery: string

  // filters
  filters: Record<string, any>

  // setters
  setView: (v: View) => void
  openLegislation: (slug: string) => void
  openPage: (slug: string) => void
  openNews: (slug: string) => void
  setAdminSection: (s: string) => void
  setSearchQuery: (q: string) => void
  setFilters: (f: Record<string, any>) => void
  goHome: () => void
  navigate: (view: View, opts?: { slug?: string; articleId?: string; tab?: string; query?: string }) => void
}

export const useAppStore = create<AppState>((set) => ({
  view: 'home',
  slug: null,
  articleId: null,
  versionId: null,
  activeTab: 'articles',
  adminSection: 'dashboard',
  authUser: null,
  authChecked: false,
  setAuthUser: (authUser) => set({ authUser }),
  setAuthChecked: (authChecked) => set({ authChecked }),
  searchQuery: '',
  filters: {},
  setView: (view) => set({ view }),
  openLegislation: (slug) =>
    set({ view: 'legislation-detail', slug, activeTab: 'overview' }),
  openPage: (slug) => set({ view: 'page', slug }),
  openNews: (slug) => set({ view: 'news-detail', slug }),
  setAdminSection: (adminSection) => set({ adminSection }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilters: (filters) => set({ filters }),
  goHome: () => set({ view: 'home', slug: null }),
  navigate: (view, opts) =>
    set({
      view,
      slug: opts?.slug ?? null,
      articleId: opts?.articleId ?? null,
      activeTab: opts?.tab ?? 'overview',
      searchQuery: opts?.query ?? '',
    }),
}))

// Scroll to top on view change
if (typeof window !== 'undefined') {
  const origSetState = useAppStore.setState
  useAppStore.setState = function (state) {
    const result = origSetState(state as any)
    if (state && 'view' in state) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    return result
  }
}
