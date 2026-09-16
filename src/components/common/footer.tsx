'use client'

import { useAppStore } from '@/store/app-store'
import { Scale, Mail, Phone, MapPin, FileText } from 'lucide-react'

export function Footer() {
  const navigate = useAppStore((s) => s.navigate)
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-secondary text-secondary-foreground border-t border-border/30">
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#AC4459] to-[#AC4459]/70 flex items-center justify-center">
                <Scale className="h-5 w-5 text-white" />
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
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm mb-3 border-b border-white/10 pb-2">
              روابط سريعة
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('home')}
                  className="opacity-80 hover:opacity-100 hover:underline"
                >
                  الصفحة الرئيسية
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('legislations')}
                  className="opacity-80 hover:opacity-100 hover:underline"
                >
                  التشريعات
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('search')}
                  className="opacity-80 hover:opacity-100 hover:underline"
                >
                  البحث المتقدم
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('legislative-system')}
                  className="opacity-80 hover:opacity-100 hover:underline"
                >
                  المنظومة التشريعية
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('news')}
                  className="opacity-80 hover:opacity-100 hover:underline"
                >
                  الأخبار
                </button>
              </li>
            </ul>
          </div>

          {/* Public pages */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm mb-3 border-b border-white/10 pb-2">
              معلومات
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('page', { slug: 'about' })}
                  className="opacity-80 hover:opacity-100 hover:underline"
                >
                  التعريف بالمنصة
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('page', { slug: 'contact' })}
                  className="opacity-80 hover:opacity-100 hover:underline"
                >
                  اتصل بنا
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('page', { slug: 'privacy' })}
                  className="opacity-80 hover:opacity-100 hover:underline"
                >
                  سياسة الخصوصية
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('page', { slug: 'terms' })}
                  className="opacity-80 hover:opacity-100 hover:underline"
                >
                  الشروط والأحكام
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('page', { slug: 'policies-and-guides' })}
                  className="opacity-80 hover:opacity-100 hover:underline"
                >
                  السياسات والأدلة
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm mb-3 border-b border-white/10 pb-2">
              تواصل معنا
            </h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>صنعاء، الجمهورية اليمنية</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span dir="ltr">+967 1 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@yemen-legislation.ye</span>
              </li>
              <li className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => navigate('admin')}
                  className="text-xs px-3 py-1.5 rounded-md bg-primary/90 text-primary-foreground hover:bg-primary"
                >
                  لوحة الإدارة
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs opacity-70">
            © {year} منصة التشريعات اليمنية — جميع الحقوق محفوظة
          </p>
          <p className="text-xs opacity-60">
            بيانات تجريبية موسومة بوضوح لأغراض العرض
          </p>
        </div>
      </div>
    </footer>
  )
}
