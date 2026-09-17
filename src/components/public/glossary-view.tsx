'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Search,
  ChevronLeft,
  Lightbulb,
  Scale,
  Gavel,
  FileText,
  Building2,
  Users,
  Landmark,
} from 'lucide-react'
import { Breadcrumb } from '@/components/common/breadcrumb'

interface GlossaryTerm {
  term: string
  definition: string
  category: string
  synonyms?: string[]
}

const GLOSSARY: GlossaryTerm[] = [
  // دستوري
  { term: 'الدستور', definition: 'الوثيقة القانونية العليا في الدولة التي تحدد نظام الحكم وحقوق المواطنين وواجباتهم وتنظيم السلطات العامة.', category: 'دستوري', synonyms: ['القانون الأساسي', 'الوثيقة الدائمة'] },
  { term: 'السيادة', definition: 'السلطة العليا للدولة التي تمارسها على إقليمها وشعبها دون تدخل خارجي.', category: 'دستوري' },
  { term: 'السلطة التشريعية', definition: 'السلطة المخولة بإصدار القوانين، وتمثلها مجلس النواب في الجمهورية اليمنية.', category: 'دستوري', synonyms: ['البرلمان', 'مجلس النواب'] },
  { term: 'السلطة التنفيذية', definition: 'السلطة المسؤولة عن تنفيذ القوانين وإدارة شؤون الدولة، ويمثلها رئيس الجمهورية والحكومة.', category: 'دستوري' },
  { term: 'السلطة القضائية', definition: 'السلطة المخولة بالفصل في المنازعات وإقامة العدل، وتضم المحاكم والقضاة.', category: 'دستوري', synonyms: ['القضاء'] },
  { term: 'حقوق الإنسان', definition: 'الحريات والحقوق الأساسية التي يتمتع بها كل فرد بموجب إنسانيته، المكفولة دستوريًا ودوليًا.', category: 'دستوري' },

  // مدني
  { term: 'العقد', definition: 'اتفاق بين طرفين أو أكثر يلتزم بموجبه كل منهما بأداء معين، ويُنظم بقواعد القانون المدني.', category: 'مدني', synonyms: ['اتفاق', 'ميثاق'] },
  { term: 'المسؤولية التقصيرية', definition: 'التزام الشخص بتعويض الضرر الذي يحدثه للغير بخطأ منه، وتقوم على ثلاثة أركان: الخطأ والضرر والعلاقة السببية.', category: 'مدني', synonyms: ['المسؤولية عن الفعل الضار'] },
  { term: 'الملكية', definition: 'حق يخول صاحبه التمتع بالشيء واستغلاله والتصرف فيه ضمن حدود القانون.', category: 'مدني' },
  { term: 'الإثراء بلا سبب', definition: 'اكتساب شخص لثروة على حساب شخص آخر دون سبب قانوني، ويلزم برد ما أثرى به.', category: 'مدني' },
  { term: 'الوكالة', definition: 'عقد بمقتضاه يفوض شخص آخر للقيام بعمل قانوني لحسابه.', category: 'مدني' },

  // جنائي
  { term: 'الجريمة', definition: 'فعل أو امتناع يحدد القانون له عقوبة، ويشترط لقيامها ركن مادي وركن معنوي.', category: 'جنائي' },
  { term: 'العقوبة', definition: 'جزاء يفرضه القانون على مرتكب الجريمة، وتكون أصليًا أو تبعيًا أو تكميليًا.', category: 'جنائي', synonyms: ['جزاء'] },
  { term: 'الشروع في الجريمة', definition: 'بدء تنفيذ الفعل الجنائي مع تخلف النتيجة لسبب لا دخل لإرادة الفاعل فيه.', category: 'جنائي' },
  { term: 'أسباب الإباحة', definition: 'أسباب تجعل الفعل مشروعًا رغم توافر أركان الجريمة، كالدفاع الشرعي وطاعة القانون.', category: 'جنائي' },
  { term: 'الاشتراك في الجريمة', definition: 'مشاركة أكثر من شخص في ارتكاب جريمة واحدة، سواء كفاعلين أصليين أو كشركاء.', category: 'جنائي' },

  // تجاري
  { term: 'التاجر', definition: 'شperson يمارس الأعمال التجارية باسمه ولحسابه الخاص، ويتمتع بالصفة التجارية.', category: 'تجاري' },
  { term: 'الشركة التجارية', definition: 'عقد يلتزم بمقتضاه شريكان بمشاركة في مشروع تجاري وتقاسم أرباحه وخسائره.', category: 'تجاري' },
  { term: 'الإفلاس', definition: 'حالة قانونية يتوقف فيها التاجر عن دفع ديونه التجارية، ويترتب عليها تصفية أمواله.', category: 'تجاري' },
  { term: 'الأوراق التجارية', definition: 'صكوك تمثل التزامات تجارية قابلة للتداول، كالكمبيالة والسند للأمر والشيك.', category: 'تجاري' },

  // إداري
  { term: 'القرار الإداري', definition: 'إفصاح الإدارة عن إرادتها بإحداث أثر قانوني معين، كإنشاء مركز قانوني أو تعديله أو إلغائه.', category: 'إداري' },
  { term: 'المرفق العام', definition: 'مشروع عام تديره الدولة أو أحد أشخاص القانون العام بقصد تقديم خدمة للجمهور.', category: 'إداري' },
  { term: 'الوظيفة العامة', definition: 'مركز قانوني يشغله شخص للقيام بعمل دائم في خدمة مرفق عام تديره الدولة.', category: 'إداري', synonyms: ['الوظيفة الحكومية'] },
  { term: 'نزع الملكية', definition: 'إجراء تتخذه السلطة العامة لحرمان مالك من ملكه للمنفعة العامة مقابل تعويض عادل.', category: 'إداري' },

  // عمالي
  { term: 'عقد العمل', definition: 'اتفاق يلتزم بمقتضاه العامل بالعمل لدى صاحب عمل وتحت إشرافه مقابل أجر.', category: 'عمالي' },
  { term: 'الأجر', definition: 'ما يحصل عليه العامل مقابل عمله، ويحدد بالزمن أو بالإنتاج أو بالمهمة.', category: 'عمالي', synonyms: ['الراتب'] },
  { term: 'الإجازة السنوية', definition: 'فترة راحة مدفوعة الأجر يستحقها العامل سنويًا، لا تقل مدتها عن 30 يومًا.', category: 'عمالي' },
  { term: 'مكافأة نهاية الخدمة', definition: 'تعويض يدفع للعامل عند انتهاء عقد العمل، يحسب على أساس مدة الخدمة والأجر.', category: 'عمالي' },

  // أحوال شخصية
  { term: 'الزواج', definition: 'عقد يحل به الرجل والمرأة العلاقة الزوجية وينشئ بينهما حقوقًا وواجبات متبادلة.', category: 'أحوال شخصية', synonyms: ['النكاح'] },
  { term: 'الطلاق', definition: 'حل رابطة الزواج بإرادة الزوج المنفردة أو بحكم القاضي لأسباب محددة.', category: 'أحوال شخصية' },
  { term: 'الميراث', definition: 'انتقال أموال المتوفى إلى ورثته الشرعيين بعد وفاته وفقا للأنصبة المحددة شرعًا.', category: 'أحوال شخصية', synonyms: ['الإرث'] },
  { term: 'الحضانة', definition: 'حفظ وتربية الطفل ورعايته بعد انفصال والديه، وتكون للأم ثم للأقارب حسب الترتيب الشرعي.', category: 'أحوال شخصية' },
  { term: 'النفقة', definition: 'ما يجب على الشخص إنفاقه على من تلزمه مؤنته شرعًا، كالزوجة والأولاد والوالدين.', category: 'أحوال شخصية' },

  // إجراءات
  { term: 'الاختصاص', definition: 'حدود سلطة المحكمة في نظر دعوى معينة، من حيث نوع الدعوى وقيمتها ومكانها.', category: 'إجرائي' },
  { term: 'الدعوى', definition: 'وسيلة قانونية يلجأ بها الشخص إلى القضاء لحماية حق له أو استرداد حق مغتصب.', category: 'إجرائي' },
  { term: 'الحكم القضائي', definition: 'قرار تصدره المحكمة في نزاع معروض عليها، يكتسب حجية بعد انقضاء مواعيد الطعن.', category: 'إجرائي' },
  { term: 'الطعن', definition: 'وسيلة قانونية لتعديل أو إلغاء حكم قضائي، كالاستئناف والنقض والتماس إعادة النظر.', category: 'إجرائي' },
  { term: 'التنفيذ', definition: 'إجراءات إجبار المحكوم عليه على أداء ما حكم به عليه، عن طريق السلطة العامة.', category: 'إجرائي' },
]

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: BookOpen },
  { id: 'دستوري', label: 'دستوري', icon: Landmark },
  { id: 'مدني', label: 'مدني', icon: Scale },
  { id: 'جنائي', label: 'جنائي', icon: Gavel },
  { id: 'تجاري', label: 'تجاري', icon: FileText },
  { id: 'إداري', label: 'إداري', icon: Building2 },
  { id: 'عمالي', label: 'عمالي', icon: Users },
  { id: 'أحوال شخصية', label: 'أحوال شخصية', icon: Users },
  { id: 'إجرائي', label: 'إجرائي', icon: Gavel },
]

const CATEGORY_COLORS: Record<string, string> = {
  'دستوري': 'bg-[#AC4459]/10 text-[#AC4459] border-[#AC4459]/30',
  'مدني': 'bg-[#344B61]/10 text-[#344B61] border-[#344B61]/30',
  'جنائي': 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/30 dark:text-rose-300',
  'تجاري': 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300',
  'إداري': 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-300',
  'عمالي': 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-300',
  'أحوال شخصية': 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/30 dark:text-purple-300',
  'إجرائي': 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/50 dark:text-slate-300',
}

export function GlossaryView() {
  const navigate = useAppStore((s) => s.navigate)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = useMemo(() => {
    let result = GLOSSARY
    if (activeCategory !== 'all') {
      result = result.filter((t) => t.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (t) =>
          t.term.includes(q) ||
          t.definition.includes(q) ||
          t.synonyms?.some((s) => s.includes(q))
      )
    }
    return result.sort((a, b) => a.term.localeCompare(b.term, 'ar'))
  }, [search, activeCategory])

  // Group by first letter
  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>()
    filtered.forEach((term) => {
      const letter = term.term[0]
      if (!map.has(letter)) map.set(letter, [])
      map.get(letter)!.push(term)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], 'ar'))
  }, [filtered])

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary mb-2 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#AC4459] to-[#344B61] flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          معجم المصطلحات القانونية
        </h1>
        <p className="text-sm text-muted-foreground">
          مرجع شامل للمصطلحات القانونية اليمنية مع تعريفات موجزة وتصنيف حسب التخصص
        </p>
      </div>

      {/* Search + Categories */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في المصطلحات..."
            className="pr-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            const count = cat.id === 'all' ? GLOSSARY.length : GLOSSARY.filter((t) => t.category === cat.id).length
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
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
        <Badge variant="outline" className="gap-1">
          <Lightbulb className="h-3 w-3" />
          {filtered.length.toLocaleString('ar-EG')} مصطلح
        </Badge>
        {activeCategory !== 'all' && (
          <Badge variant="outline" className="gap-1">
            تصنيف: {activeCategory}
          </Badge>
        )}
      </div>

      {/* Terms grouped by letter */}
      {grouped.length > 0 ? (
        <div className="space-y-8">
          {grouped.map(([letter, terms]) => (
            <div key={letter}>
              {/* Letter header */}
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-border/40">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                  {letter}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-secondary">{letter}</h2>
                  <p className="text-xs text-muted-foreground">{terms.length.toLocaleString('ar-EG')} مصطلح</p>
                </div>
              </div>

              {/* Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {terms.map((item, idx) => (
                  <Card
                    key={idx}
                    className="border-border/60 hover:border-primary/30 card-lift group animate-fade-in-up"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                          {item.term}
                        </h3>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${CATEGORY_COLORS[item.category] || ''}`}>
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        {item.definition}
                      </p>
                      {item.synonyms && item.synonyms.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
                          <span className="text-[11px] text-muted-foreground">مرادفات:</span>
                          {item.synonyms.map((syn) => (
                            <span
                              key={syn}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground"
                            >
                              {syn}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-semibold mb-1">لا توجد مصطلحات مطابقة</p>
            <p className="text-sm text-muted-foreground">جرّب تعديل البحث أو التصفية</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
