'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Keyboard, Home, Search, Scale, User, GitCompare, GitBranch, Shield, Moon, Sun, ArrowUp } from 'lucide-react'

interface Shortcut {
  keys: string[]
  description: string
  icon: React.ComponentType<{ className?: string }>
  action?: () => void
}

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)
  const navigate = useAppStore((s) => s.navigate)
  const goHome = useAppStore((s) => s.goHome)

  const toggleTheme = useCallback(() => {
    if (typeof document === 'undefined') return
    const isDark = document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', !isDark)
    try {
      localStorage.setItem('theme', isDark ? 'light' : 'dark')
    } catch {}
  }, [])

  const shortcuts: Shortcut[] = [
    { keys: ['?'], description: 'عرض اختصارات لوحة المفاتيح', icon: Keyboard },
    { keys: ['/'], description: 'تركيز البحث', icon: Search, action: () => {
      const input = document.querySelector('input[type="search"]') as HTMLInputElement
      input?.focus()
    }},
    { keys: ['g', 'h'], description: 'الذهاب للرئيسية', icon: Home, action: goHome },
    { keys: ['g', 's'], description: 'البحث المتقدم', icon: Search, action: () => navigate('search') },
    { keys: ['g', 'l'], description: 'كل التشريعات', icon: Scale, action: () => navigate('legislations') },
    { keys: ['g', 't'], description: 'الخط الزمني', icon: GitBranch, action: () => navigate('timeline') },
    { keys: ['g', 'a'], description: 'حساب الباحث', icon: User, action: () => navigate('account') },
    { keys: ['g', 'c'], description: 'مقارنة التشريعات', icon: GitCompare, action: () => navigate('compare') },
    { keys: ['g', 'n'], description: 'الأخبار', icon: Scale, action: () => navigate('news') },
    { keys: ['g', 'd'], description: 'لوحة الإدارة', icon: Shield, action: () => navigate('admin') },
    { keys: ['t'], description: 'تبديل المظهر (فاتح/داكن)', icon: Moon, action: toggleTheme },
    { keys: ['↑'], description: 'العودة لأعلى الصفحة', icon: ArrowUp, action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { keys: ['Esc'], description: 'إغلاق النوافذ الحوار', icon: Keyboard },
  ]

  useEffect(() => {
    let lastKey = ''
    let lastKeyTime = 0

    function onKeyDown(e: KeyboardEvent) {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      if (isTyping && e.key !== 'Escape') return

      // Escape closes dialog
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }

      // ? opens shortcuts
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }

      // Single-key shortcuts (only when not typing)
      if (isTyping) return

      if (e.key === '/') {
        e.preventDefault()
        const input = document.querySelector('input[type="search"]') as HTMLInputElement
        input?.focus()
        return
      }

      if (e.key === 't') {
        e.preventDefault()
        toggleTheme()
        return
      }

      // g + key combos
      const now = Date.now()
      if (e.key === 'g' && now - lastKeyTime < 800) {
        // Already in combo mode, ignore
        return
      }
      if (e.key === 'g') {
        lastKey = 'g'
        lastKeyTime = now
        return
      }
      if (lastKey === 'g' && now - lastKeyTime < 800) {
        const shortcut = shortcuts.find((s) => s.keys.length === 2 && s.keys[1] === e.key)
        if (shortcut?.action) {
          e.preventDefault()
          shortcut.action()
        }
        lastKey = ''
        lastKeyTime = 0
        return
      }

      lastKey = ''
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate, goHome, toggleTheme])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            اختصارات لوحة المفاتيح
          </DialogTitle>
          <DialogDescription>
            استخدم هذه الاختصارات للتنقل السريع في المنصة
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {shortcuts.map((s, i) => {
            const Icon = s.icon
            return (
              <div
                key={i}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/60 bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm truncate">{s.description}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {s.keys.map((k, j) => (
                    <kbd
                      key={j}
                      className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md bg-secondary/10 border border-border text-xs font-mono font-semibold text-secondary"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground text-center">
          اضغط <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-muted border border-border text-[10px] font-mono font-semibold">؟</kbd> في أي وقت لعرض هذه القائمة
        </div>
      </DialogContent>
    </Dialog>
  )
}
