'use client'

import * as React from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  LayoutDashboard,
  Scale,
  FileText,
  Upload,
  Trash2,
  FlagTriangleRight,
  ScrollText,
  Shield,
  Users,
  UserCog,
  Settings,
  Home,
  Menu,
  ShieldCheck,
} from 'lucide-react'
import { DashboardSection } from './sections/dashboard-section'
import { LegislationsSection } from './sections/legislations-section'
import { AmendmentsSection } from './sections/amendments-section'
import { ImportsSection } from './sections/imports-section'
import { RecycleSection } from './sections/recycle-section'
import { ReportsSection } from './sections/reports-section'
import { AuditSection } from './sections/audit-section'
import { PoliciesSection } from './sections/policies-section'
import { UsersSection } from './sections/users-section'
import { RolesSection } from './sections/roles-section'
import { SettingsSection } from './sections/settings-section'

type NavItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

type NavGroup = {
  title: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  {
    title: 'لوحة المؤشرات',
    items: [{ id: 'dashboard', label: 'لوحة المعلومات', icon: LayoutDashboard }],
  },
  {
    title: 'المحتوى',
    items: [
      { id: 'legislations', label: 'التشريعات', icon: Scale },
      { id: 'amendments', label: 'وثائق التعديل', icon: FileText },
      { id: 'imports', label: 'الاستيراد', icon: Upload },
      { id: 'recycle', label: 'سلة الحذف', icon: Trash2 },
    ],
  },
  {
    title: 'الجودة والتدقيق',
    items: [
      { id: 'reports', label: 'التقارير', icon: FlagTriangleRight },
      { id: 'audit', label: 'سجل التدقيق', icon: ScrollText },
      { id: 'policies', label: 'السياسات', icon: Shield },
    ],
  },
  {
    title: 'الحسابات',
    items: [
      { id: 'users', label: 'المستخدمون', icon: Users },
      { id: 'roles', label: 'الأدوار', icon: UserCog },
    ],
  },
  {
    title: 'النظام',
    items: [{ id: 'settings', label: 'الإعدادات', icon: Settings }],
  },
]

const SECTION_TITLES: Record<string, string> = {
  dashboard: 'لوحة المعلومات',
  legislations: 'إدارة التشريعات',
  amendments: 'وثائق التعديل',
  imports: 'الاستيراد',
  recycle: 'سلة الحذف',
  reports: 'تقارير الجودة',
  audit: 'سجل التدقيق',
  policies: 'سياسات العمليات',
  users: 'إدارة المستخدمين',
  roles: 'إدارة الأدوار',
  settings: 'إعدادات المنصة',
}

function SidebarContent() {
  const adminSection = useAppStore((s) => s.adminSection)
  const setAdminSection = useAppStore((s) => s.setAdminSection)

  return (
    <nav className="flex flex-col gap-5 p-4" aria-label="التنقل في لوحة الإدارة">
      <div className="flex items-center gap-2 px-2 py-3 border-b">
        <div className="size-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold leading-tight">لوحة الإدارة</p>
          <p className="text-xs text-muted-foreground">منصة التشريعات اليمنية</p>
        </div>
      </div>

      {NAV.map((group) => (
        <div key={group.title} className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground px-2 uppercase tracking-wide">
            {group.title}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = adminSection === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAdminSection(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

function TopBar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const adminSection = useAppStore((s) => s.adminSection)
  const goHome = useAppStore((s) => s.goHome)
  const title = SECTION_TITLES[adminSection] || 'لوحة الإدارة'

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
      <div className="flex items-center gap-3 px-4 h-14">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobile}
          aria-label="فتح القائمة"
        >
          <Menu className="size-5" />
        </Button>
        <h1 className="text-lg font-bold text-secondary flex-1">{title}</h1>
        <Badge variant="secondary" className="gap-1">
          <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
          demo
        </Badge>
        <Button variant="outline" size="sm" onClick={goHome}>
          <Home className="size-4" />
          <span className="hidden sm:inline">عودة للموقع</span>
        </Button>
      </div>
    </header>
  )
}

export function AdminShell() {
  const adminSection = useAppStore((s) => s.adminSection)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const isMobile = useIsMobile()

  function renderSection() {
    switch (adminSection) {
      case 'dashboard':
        return <DashboardSection />
      case 'legislations':
        return <LegislationsSection />
      case 'amendments':
        return <AmendmentsSection />
      case 'imports':
        return <ImportsSection />
      case 'recycle':
        return <RecycleSection />
      case 'reports':
        return <ReportsSection />
      case 'audit':
        return <AuditSection />
      case 'policies':
        return <PoliciesSection />
      case 'users':
        return <UsersSection />
      case 'roles':
        return <RolesSection />
      case 'settings':
        return <SettingsSection />
      default:
        return <DashboardSection />
    }
  }

  function openMobile() {
    setMobileOpen(true)
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-row-reverse">
      {/* Sidebar (right in RTL) */}
      <aside className="hidden md:block w-64 shrink-0 bg-background border-l sticky top-0 h-screen">
        <ScrollArea className="h-full">
          <SidebarContent />
        </ScrollArea>
      </aside>

      {/* Mobile sheet */}
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="w-72 p-0">
            <SheetTitle className="sr-only">القائمة الجانبية</SheetTitle>
            <ScrollArea className="h-full">
              <SidebarContent />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar onOpenMobile={openMobile} />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{renderSection()}</div>
        </main>
      </div>
    </div>
  )
}
