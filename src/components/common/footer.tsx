'use client'

import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scale, Mail, Phone, MapPin, FileText, BarChart3, Send, Heart, Github, Twitter, Facebook, Rss } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function Footer() {
  const navigate = useAppStore((s) => s.navigate)
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني')
      return
    }
    toast.success('تم الاشتراك في النشرة البريدية', {
      description: 'ستصلك أحدث التشريعات والأخبار على بريدك الإلكتروني',
    })
    setEmail('')
  }

  return (
    <footer className="mt-auto bg-secondary text-secondary-foreground border-t border-border/30 relative overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 pattern-arabesque opacity-5" />

      <div className="container relative mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand + Newsletter */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-[#AC4459] to-[#AC4459]/70 flex items-center justify-center shadow-md">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-base">
                  منصة التشريعات اليمنية
                </div>
                <div className="text-[11px] opacity-80">
                  مرجعية قانونية موثوقة
                </div>
              </div>
            </div>
            <p className="text-xs opacity-80 leading-relaxed">
              منصة وطنية متكاملة لإدارة التشريعات اليمنية وعرضها والبحث فيها،
              مع دعم النسخ الزمنية والتعديلات والملاحق والعلاقات القانونية.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <div className="text-sm font-semibold mb-2">النشرة البريدية</div>
              <p className="text-xs opacity-70 mb-3">اشترك لتصلك أحدث التشريعات والأخبار</p>
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="بريدك الإلكتروني"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                />
                <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Social */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs opacity-70 ml-2">تابعنا:</span>
              {[Twitter, Facebook, Github, Rss].map((Icon, i) => (
                <button
                  key={i}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                  aria-label="social link"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm mb-3 border-b border-white/10 pb-2">
              روابط سريعة
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'الصفحة الرئيسية', target: 'home' as const },
                { label: 'التشريعات', target: 'legislations' as const },
                { label: 'البحث المتقدم', target: 'search' as const },
                { label: 'إحصاءات المنصة', target: 'stats' as const },
                { label: 'المنظومة التشريعية', target: 'legislative-system' as const },
                { label: 'الأخبار', target: 'news' as const },
              ].map((link) => (
                <li key={link.target}>
                  <button
                    onClick={() => navigate(link.target)}
                    className="opacity-80 hover:opacity-100 hover:text-primary transition-colors text-right link-underline"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Public pages */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm mb-3 border-b border-white/10 pb-2">
              معلومات
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'التعريف بالمنصة', slug: 'about' },
                { label: 'اتصل بنا', slug: 'contact' },
                { label: 'سياسة الخصوصية', slug: 'privacy' },
                { label: 'الشروط والأحكام', slug: 'terms' },
                { label: 'السياسات والأدلة', slug: 'policies-and-guides' },
              ].map((page) => (
                <li key={page.slug}>
                  <button
                    onClick={() => navigate('page', { slug: page.slug })}
                    className="opacity-80 hover:opacity-100 hover:text-primary transition-colors text-right link-underline"
                  >
                    {page.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm mb-3 border-b border-white/10 pb-2">
              تواصل معنا
            </h3>
            <ul className="space-y-2.5 text-sm opacity-90">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>صنعاء، الجمهورية اليمنية</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span dir="ltr">+967 1 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>info@yemen-legislation.ye</span>
              </li>
            </ul>
            <div className="pt-3">
              <button
                onClick={() => navigate('admin')}
                className="text-xs px-3 py-1.5 rounded-md bg-primary/90 text-primary-foreground hover:bg-primary transition-colors inline-flex items-center gap-1.5"
              >
                <FileText className="h-3 w-3" />
                لوحة الإدارة
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs opacity-70">
            © {year.toLocaleString('ar-EG')} منصة التشريعات اليمنية — جميع الحقوق محفوظة
          </p>
          <p className="text-xs opacity-60 flex items-center gap-1.5">
            بيانات تجريبية موسومة بوضوح لأغراض العرض
            <Heart className="h-3 w-3 text-primary" />
          </p>
        </div>
      </div>
    </footer>
  )
}
