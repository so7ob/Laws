'use client'

import Link from 'next/link'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Input } from '@/components/ui/input'
import {
  Search,
  Scale,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  FileText,
  Network,
  History,
  Star,
  Archive,
  Newspaper,
  Settings,
  Shield,
} from 'lucide-react'
import { useState } from 'react'

const NAV_GROUPS = [
  {
    label: 'الرئيسية',
    items: [{ label: 'الصفحة الرئيسية', target: 'home', icon: BookOpen }],
  },
  {
    label: 'التشريعات',
    items: [
      { label: 'كل التشريعات', target: 'legislations', icon: Scale },
      { label: 'أحدث التشريعات', target: 'recent', icon: History },
      { label: 'الأكثر اطلاعًا', target: 'popular', icon: Star },
      { label: 'الأرشيف', target: 'archive', icon: Archive },
      { label: 'الدستور', target: 'constitution', icon: BookOpen },
    ],
  },
  {
    label: 'المنظومة',
    items: [
      { label: 'المنظومة التشريعية', target: 'legislative-system', icon: Network },
      { label: 'السياسات والأدلة', target: 'policies', icon: FileText },
      { label: 'الأخبار', target: 'news', icon: Newspaper },
    ],
  },
]

export function Header() {
  const navigate = useAppStore((s) => s.navigate)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      setSearchQuery(search.trim())
      navigate('search', { query: search.trim() })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-[#AC4459] to-[#344B61] flex items-center justify-center shadow-md">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block text-right">
              <div className="font-bold text-base leading-tight text-secondary">
                منصة التشريعات اليمنية
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                مرجعيتك القانونية الموثوقة
              </div>
            </div>
          </button>

          {/* Search */}
          <form onSubmit={onSearchSubmit} className="flex-1 max-w-xl mx-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث في النصوص القانونية..."
                className="pr-10 pl-4 h-10 bg-background/80"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden lg:block">
            <NavigationMenu dir="rtl">
              <NavigationMenuList>
                {NAV_GROUPS.map((group) => (
                  <NavigationMenuItem key={group.label}>
                    <NavigationMenuTrigger className="text-sm">
                      {group.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[260px] gap-1 p-2">
                        {group.items.map((item) => {
                          const Icon = item.icon
                          return (
                            <li key={item.target}>
                              <button
                                onClick={() => navigate(item.target as any)}
                                className="w-full flex items-center gap-3 rounded-md p-2 hover:bg-accent text-right transition-colors"
                              >
                                <Icon className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-sm">{item.label}</span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
                <NavigationMenuItem>
                  <button
                    onClick={() => navigate('admin')}
                    className={navigationMenuTriggerStyle()}
                  >
                    <Shield className="h-4 w-4 ml-1" />
                    الإدارة
                  </button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="القائمة"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border/40 py-3 space-y-1">
            {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.target}
                  onClick={() => {
                    navigate(item.target as any)
                    setMobileOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-right transition-colors"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            })}
            <button
              onClick={() => {
                navigate('admin')
                setMobileOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-right transition-colors"
            >
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm">لوحة الإدارة</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
