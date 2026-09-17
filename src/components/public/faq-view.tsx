'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  HelpCircle,
  Search,
  ChevronDown,
  BookOpen,
  Scale,
  FileText,
  Users,
  Settings,
  Download,
} from 'lucide-react'
import { Breadcrumb } from '@/components/common/breadcrumb'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const FAQS: FAQItem[] = [
  // عام
  {
    question: 'ما هي منصة التشريعات اليمنية؟',
    answer: 'منصة وطنية متكاملة لإدارة التشريعات اليمنية وعرضها والبحث فيها، مع دعم النسخ الزمنية والتعديلات والملاحق والعلاقات القانونية. تهدف إلى توفير مرجعية موثوقة للتشريعات اليمنية النافذة.',
    category: 'عام',
  },
  {
    question: 'هل البيانات المنشورة رسمية؟',
    answer: 'البيانات المعروضة حاليًا هي بيانات تجريبية موسومة بوضوح لأغراض العرض والتطوير. في الإنتاج، ستكون جميع التشريعات موثقة من الجريدة الرسمية ومصادر رسمية معتمدة.',
    category: 'عام',
  },
  {
    question: 'هل استخدام المنصة مجاني؟',
    answer: 'نعم، المنصة متاحة مجانًا لجميع المستخدمين. يمكن لأي شخص البحث في التشريعات وقراءة المواد والاطلاع على النسخ الزمنية دون الحاجة لتسجيل دخول.',
    category: 'عام',
  },

  // بحث
  {
    question: 'كيف أبحث عن تشريع معين؟',
    answer: 'يمكنك البحث من خلال شريط البحث في أعلى الصفحة، أو استخدام البحث المتقدم من قائمة "التشريعات". يدعم البحث العناوين والأرقام والسنوات ونصوص المواد والنسخ والملاحق.',
    category: 'بحث',
  },
  {
    question: 'ما هي أنماط البحث المتاحة؟',
    answer: 'يدعم البحث المتقدم ثلاثة أنماط: "كل الكلمات" (يجب أن تحتوي النتيجة على جميع الكلمات)، "أي كلمة" (يكفي وجود كلمة واحدة)، و"عبارة حرفية" (مطابقة دقيقة للنص).',
    category: 'بحث',
  },
  {
    question: 'هل يمكنني البحث داخل نصوص المواد؟',
    answer: 'نعم، يمكنك البحث على مستوى المواد باستخدام البحث المتقدم واختيار نطاق "المواد". ستظهر النتائج مع مقتطفات نصية تبرز مواضع المطابقة.',
    category: 'بحث',
  },
  {
    question: 'ما هي ميزة "هل تقصد؟"؟',
    answer: 'عند عدم العثور على نتائج لبحثك، تقترح المنصة مصطلحات قانونية مشابهة قد تكون ما تقصده، باستخدام خوارزمية المطابقة الضبابية للنصوص العربية.',
    category: 'بحث',
  },

  // تشريعات
  {
    question: 'ما هي النسخ الزمنية للتشريع؟',
    answer: 'النسخ الزمنية هي إصدارات مختلفة من نص المادة عبر الزمن. كل مادة لها هوية ثابتة لكن نصها قد يتغير بفعل التعديلات. يمكنك عرض النص النافذ في تاريخ معين باستخدام منتقي التاريخ.',
    category: 'تشريعات',
  },
  {
    question: 'كيف أعرف النص النافذ في تاريخ معين؟',
    answer: 'في صفحة تفاصيل التشريع، استخدم زر "عرض النص الحالي" واختر التاريخ المطلوب. ستعرض المنصة النسخة المناسبة من كل مادة بناءً على فترة نفاذها.',
    category: 'تشريعات',
  },
  {
    question: 'ما الفرق بين الحالة القانونية وحالة سير العمل؟',
    answer: 'الحالة القانونية (نافذ، مُعدَّل، مُلغى، مؤرشف) تصف الوضع القانوني للتشريع. حالة سير العمل (مسودة، قيد المراجعة، منشور) تصف المرحلة الإدارية في دورة النشر.',
    category: 'تشريعات',
  },
  {
    question: 'كيف أقارن بين تشريعين؟',
    answer: 'استخدم أداة "مقارنة التشريعات" من قائمة التشريعات. اختر تشريعين واضغط "مقارنة" لعرض جدول مقارنة تفصيلي مع تمييز الفروقات والمواد المتشابهة.',
    category: 'تشريعات',
  },
  {
    question: 'ما هو مولّد الاستشهاد القانوني؟',
    answer: 'أداة تنشئ استشهادات قانونية منسقة بثلاث صيغ: مختصرة، كاملة، وأكاديمية. يمكنك نسخ الاستشهاد واستخدامه في البحوث والأوراق العلمية.',
    category: 'تشريعات',
  },

  // حساب الباحث
  {
    question: 'كيف أنشئ حسابًا؟',
    answer: 'حاليًا تعمل المنصة بحساب تجريبي (reader) لجميع المستخدمين. في الإنتاج، سيكون التسجيل متاحًا مع مصادقة آمنة لحفظ المفضلات والبحوث والملاحظات.',
    category: 'حساب الباحث',
  },
  {
    question: 'ما هي ميزة "شوهد مؤخرًا"؟',
    answer: 'تعرف المنصة التشريعات التي تصفحتها وتعرضها على الصفحة الرئيسية للوصول السريع. يمكنك مسح هذه القائمة من إعدادات حساب الباحث.',
    category: 'حساب الباحث',
  },
  {
    question: 'هل يمكنني حفظ بحوثي؟',
    answer: 'نعم، من حساب الباحث → البحوث المحفوظة، يمكنك حفظ معايير البحث وإعادة تشغيلها لاحقًا بنقرة واحدة.',
    category: 'حساب الباحث',
  },
  {
    question: 'كيف أقيّم تشريعًا؟',
    answer: 'في صفحة تفاصيل التشريع، اضغط زر "قيّم هذا التشريع" واختر "مفيد" أو "يحتاج تحسين" مع تعليق اختياري. تساعد ملاحظاتك في تحسين المنصة.',
    category: 'حساب الباحث',
  },

  // تقني
  {
    question: 'هل تدعم المنصة الوضع الداكن؟',
    answer: 'نعم، يمكنك تبديل المظهر بين الفاتح والداكن من زر التبديل في شريط العلو. يحفظ اختيارك تلقائيًا.',
    category: 'تقني',
  },
  {
    question: 'هل توجد اختصارات لوحة المفاتيح؟',
    answer: 'نعم، اضغط مفتاح "؟" لعرض قائمة الاختصارات الكاملة. تشمل التنقل السريع (g+h للرئيسية، g+s للبحث، إلخ) وتبديل المظهر (t).',
    category: 'تقني',
  },
  {
    question: 'هل يمكنني تصدير نتائج البحث؟',
    answer: 'نعم، بعد إجراء بحث، اضغط زر "تصدير CSV" لتنزيل النتائج بصيغة CSV متوافقة مع Excel، مع دعم كامل للنصوص العربية.',
    category: 'تقني',
  },
  {
    question: 'هل يمكنني طباعة التشريع؟',
    answer: 'نعم، اضغط زر "طباعة" في صفحة تفاصيل التشريع. تم تحسين نمط الطباعة ليشمل رأسًا بالعنوان والتاريخ، مع إخفاء العناصر التفاعلية.',
    category: 'تقني',
  },
  {
    question: 'هل المنصة متجاوبة مع الهاتف؟',
    answer: 'نعم، المنصة مصممة بتقنية Mobile-First وتعمل بشكل كامل على الهواتف والأجهزة اللوحية. تتكيف القوائم والجداول والبطاقات تلقائيًا مع حجم الشاشة.',
    category: 'تقني',
  },
]

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: HelpCircle },
  { id: 'عام', label: 'أسئلة عامة', icon: BookOpen },
  { id: 'بحث', label: 'البحث', icon: Search },
  { id: 'تشريعات', label: 'التشريعات', icon: Scale },
  { id: 'حساب الباحث', label: 'حساب الباحث', icon: Users },
  { id: 'تقني', label: 'تقني', icon: Settings },
]

export function FAQView() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = useMemo(() => {
    let result = FAQS
    if (activeCategory !== 'all') {
      result = result.filter((f) => f.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (f) => f.question.includes(q) || f.answer.includes(q)
      )
    }
    return result
  }, [search, activeCategory])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb />

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#AC4459] to-[#344B61] flex items-center justify-center mx-auto mb-4 shadow-md">
          <HelpCircle className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-secondary mb-2">
          الأسئلة الشائعة
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          إجابات على أكثر الأسئلة شيوعًا حول منصة التشريعات اليمنية وكيفية استخدامها
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mx-auto mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في الأسئلة..."
          className="pr-10"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          const count = cat.id === 'all' ? FAQS.length : FAQS.filter((f) => f.category === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-primary/10 hover:text-primary border border-border'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
              <span className="opacity-70 article-number">({count.toLocaleString('ar-EG')})</span>
            </button>
          )
        })}
      </div>

      {/* FAQ accordion */}
      {filtered.length > 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-2">
            <Accordion type="single" collapsible className="w-full">
              {filtered.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="border-b border-border/40 last:border-b-0"
                >
                  <AccordionTrigger className="text-right hover:no-underline px-4 py-4 group">
                    <div className="flex items-start gap-3 text-right flex-1">
                      <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground transition-colors">
                        <span className="text-xs font-bold article-number">{(idx + 1).toLocaleString('ar-EG')}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {faq.question}
                        </p>
                        <Badge variant="outline" className="text-[9px] mt-1 py-0 px-1.5">
                          {faq.category}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pr-14">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-semibold mb-1">لا توجد أسئلة مطابقة</p>
            <p className="text-sm text-muted-foreground">جرّب تعديل البحث أو التصفية</p>
          </CardContent>
        </Card>
      )}

      {/* Contact prompt */}
      <Card className="mt-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <p className="text-sm font-semibold mb-1">لم تجد إجابة لسؤالك؟</p>
          <p className="text-xs text-muted-foreground mb-3">
            تواصل معنا وسنرد عليك في أقرب وقت
          </p>
          <button
            onClick={() => useAppStore.getState().navigate('page', { slug: 'contact' })}
            className="text-sm text-primary hover:underline font-medium"
          >
            صفحة الاتصال ←
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
