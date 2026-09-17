import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// ============ بيانات تجريبية لمنصة التشريعات اليمنية ============

const TYPES = [
  { code: 'constitution', nameAr: 'دستور', nameEn: 'Constitution' },
  { code: 'law', nameAr: 'قانون', nameEn: 'Law' },
  { code: 'decree_law', nameAr: 'مرسوم بقانون', nameEn: 'Decree-Law' },
  { code: 'republican_decree', nameAr: 'قرار جمهوري', nameEn: 'Republican Decree' },
  { code: 'ministerial_decree', nameAr: 'قرار وزاري', nameEn: 'Ministerial Decree' },
  { code: 'regulation', nameAr: 'لائحة', nameEn: 'Regulation' },
  { code: 'bylaw', nameAr: 'نظام', nameEn: 'Bylaw' },
  { code: 'circular', nameAr: 'تعميم', nameEn: 'Circular' },
]

const AUTHORITIES = [
  { code: 'parliament', nameAr: 'مجلس النواب', nameEn: 'House of Representatives' },
  { code: 'presidency', nameAr: 'رئاسة الجمهورية', nameEn: 'Presidency' },
  { code: 'cabinet', nameAr: 'مجلس الوزراء', nameEn: 'Council of Ministers' },
  { code: 'shura', nameAr: 'مجلس الشورى', nameEn: 'Shura Council' },
  { code: 'min_justice', nameAr: 'وزارة العدل', nameEn: 'Ministry of Justice' },
  { code: 'min_finance', nameAr: 'وزارة المالية', nameEn: 'Ministry of Finance' },
  { code: 'min_interior', nameAr: 'وزارة الداخلية', nameEn: 'Ministry of Interior' },
  { code: 'min_education', nameAr: 'وزارة التربية والتعليم', nameEn: 'Ministry of Education' },
  { code: 'min_health', nameAr: 'وزارة الصحة العامة والسكان', nameEn: 'Ministry of Public Health and Population' },
  { code: 'min_trade', nameAr: 'وزارة التجارة والصناعة', nameEn: 'Ministry of Trade and Industry' },
  { code: 'min_agriculture', nameAr: 'وزارة الزراعة والري', nameEn: 'Ministry of Agriculture and Irrigation' },
  { code: 'central_bank', nameAr: 'البنك المركزي اليمني', nameEn: 'Central Bank of Yemen' },
]

const SUBJECTS = [
  { code: 'constitutional', nameAr: 'الشؤون الدستورية', parentCode: null },
  { code: 'civil', nameAr: 'القانون المدني', parentCode: null },
  { code: 'criminal', nameAr: 'القانون الجنائي', parentCode: null },
  { code: 'commercial', nameAr: 'القانون التجاري', parentCode: null },
  { code: 'administrative', nameAr: 'القانون الإداري', parentCode: null },
  { code: 'labor', nameAr: 'قانون العمل', parentCode: null },
  { code: 'family', nameAr: 'قانون الأحوال الشخصية', parentCode: null },
  { code: 'tax', nameAr: 'القوانين الضريبية', parentCode: null },
  { code: 'customs', nameAr: 'القانون الجمركي', parentCode: null },
  { code: 'banking', nameAr: 'القانون المصرفي', parentCode: null },
  { code: 'land', nameAr: 'قانون الأراضي', parentCode: null },
  { code: 'education', nameAr: 'التعليم والثقافة', parentCode: null },
  { code: 'health', nameAr: 'الصحة العامة', parentCode: null },
  { code: 'environment', nameAr: 'البيئة والموارد', parentCode: null },
  { code: 'defense', nameAr: 'الدفاع والأمن', parentCode: null },
  { code: 'foreign', nameAr: 'العلاقات الخارجية', parentCode: null },
  { code: 'economic', nameAr: 'التنمية الاقتصادية', parentCode: null },
  { code: 'social', nameAr: 'الضمان الاجتماعي', parentCode: null },
  { code: 'judicial', nameAr: 'السلطة القضائية', parentCode: null },
  { code: 'municipal', nameAr: 'الإدارة المحلية', parentCode: null },
  // Children
  { code: 'income_tax', nameAr: 'ضريبة الدخل', parentCode: 'tax' },
  { code: 'sales_tax', nameAr: 'ضريبة المبيعات', parentCode: 'tax' },
  { code: 'customs_tariff', nameAr: 'تعرفة جمركية', parentCode: 'customs' },
  { code: 'marriage', nameAr: 'الزواج', parentCode: 'family' },
  { code: 'divorce', nameAr: 'الطلاق', parentCode: 'family' },
  { code: 'inheritance', nameAr: 'الميراث', parentCode: 'family' },
  { code: 'labor_rights', nameAr: 'حقوق العمال', parentCode: 'labor' },
  { code: 'civil_service', nameAr: 'الوظيفة العامة', parentCode: 'administrative' },
  { code: 'free_zones', nameAr: 'المناطق الحرة', parentCode: 'economic' },
  { code: 'investment', nameAr: 'الاستثمار', parentCode: 'economic' },
]

const CLASSIFICATIONS = [
  { code: 'primary', nameAr: 'تشريع أساسي' },
  { code: 'secondary', nameAr: 'تشريع ثانوي' },
  { code: 'procedural', nameAr: 'تشريع إجرائي' },
  { code: 'substantive', nameAr: 'تشريع موضوعي' },
  { code: 'special', nameAr: 'تشريع خاص' },
  { code: 'general', nameAr: 'تشريع عام' },
]

const ROLES = [
  { code: 'reader', nameAr: 'قارئ / باحث', powerLevel: 10, isSystem: true },
  { code: 'data_entry', nameAr: 'مُدخل بيانات', powerLevel: 30, isSystem: true },
  { code: 'legal_reviewer', nameAr: 'مُراجع قانوني', powerLevel: 50, isSystem: true },
  { code: 'content_manager', nameAr: 'مدير محتوى', powerLevel: 70, isSystem: true },
  { code: 'system_admin', nameAr: 'مدير نظام', powerLevel: 90, isSystem: true },
  { code: 'super_admin', nameAr: 'مدير أعلى محمي', powerLevel: 100, isSystem: true, isProtected: true },
]

const POLICIES = [
  { code: 'sep_importer_reviewer', nameAr: 'فصل المستورد عن المراجع', category: 'review', description: 'لا يحق لمن استورد المصدر أن يراجعه' },
  { code: 'sep_preparer_approver', nameAr: 'فصل المُعِد عن المُعتمد', category: 'review', description: 'لا يحق لمن أعد المحتوى أن يعتمد التشريع نفسه' },
  { code: 'sep_reviewer_publisher', nameAr: 'فصل المُراجع عن الناشر', category: 'publishing', description: 'لا يحق لمن شارك في المراجعة أن ينشر التشريع' },
  { code: 'sep_amend_creator_reviewer', nameAr: 'فصل منشئ وثيقة التعديل عن مراجعها', category: 'review', description: 'لا يحق لمنشئ وثيقة التعديل أن يراجعها' },
  { code: 'sep_amend_reviewer_publisher', nameAr: 'فصل مراجع وثيقة التعديل عن ناشرها', category: 'publishing', description: 'لا يحق لمراجع وثيقة التعديل أن ينشرها' },
  { code: 'require_source_review', nameAr: 'اشتراط مراجعة المصدر', category: 'review', description: 'يتطلب نشر التشريع أو الملحق مراجعة المصدر' },
  { code: 'review_approval_order', nameAr: 'اشتراط ترتيب المراجعة والاعتماد والنشر', category: 'publishing', description: 'لا يمكن النشر قبل المراجعة والاعتماد' },
  { code: 'protect_published_history', nameAr: 'حماية المحتوى المنشور والتاريخي', category: 'deletion', description: 'يُمنع حذف المحتوى المنشور أو التاريخي' },
  { code: 'protect_attachments', nameAr: 'حماية الملاحق والتعديلات والعلاقات المراجعة', category: 'editing', description: 'يُمنع تحرير الملاحق خارج المسودة' },
  { code: 'edit_published_via_correction', nameAr: 'تحرير المنشور عبر مسودة تصحيح', category: 'editing', description: 'يتم تعديل المنشور بواسطة مسودة تصحيح زمنية' },
  { code: 'reset_review_on_change', nameAr: 'إعادة المحتوى المراجع للمسودة عند تغييره', category: 'editing', description: 'أي تغيير في المحتوى المراجع يعيده إلى المسودة' },
  { code: 'protect_source_links', nameAr: 'حماية ارتباطات المصادر بعد المراجعة والنشر', category: 'editing', description: 'لا يمكن فك ارتباط المصدر بعد النشر دون معالجة' },
  { code: 'require_active_legislation', nameAr: 'اشتراط نشاط التشريع لمتابعة الدورة', category: 'activation', description: 'يجب أن يكون التشريع نشطًا لمتابعة دورة النشر' },
  { code: 'protect_applied_amendment', nameAr: 'حماية تفعيل عناصر وثيقة تعديل مطبقة', category: 'activation', description: 'لا يمكن تعطيل عناصر وثيقة التعديل المطبقة' },
]

const NAV_ITEMS = [
  { label: 'الرئيسية', target: 'home', position: 'header', sortOrder: 1 },
  { label: 'التشريعات', target: 'legislations', position: 'header', sortOrder: 2 },
  { label: 'أحدث التشريعات', target: 'recent', position: 'header', sortOrder: 3 },
  { label: 'الأكثر اطلاعًا', target: 'popular', position: 'header', sortOrder: 4 },
  { label: 'الأرشيف', target: 'archive', position: 'header', sortOrder: 5 },
  { label: 'الدستور', target: 'constitution', position: 'header', sortOrder: 6 },
  { label: 'المنظومة التشريعية', target: 'system', position: 'header', sortOrder: 7 },
  { label: 'البحث المتقدم', target: 'search', position: 'header', sortOrder: 8 },
  { label: 'السياسات والأدلة', target: 'policies', position: 'header', sortOrder: 9 },
  { label: 'الأخبار', target: 'news', position: 'header', sortOrder: 10 },
  { label: 'التعريف', target: 'about', position: 'footer', sortOrder: 1 },
  { label: 'الاتصال', target: 'contact', position: 'footer', sortOrder: 2 },
  { label: 'الخصوصية', target: 'privacy', position: 'footer', sortOrder: 3 },
  { label: 'الشروط', target: 'terms', position: 'footer', sortOrder: 4 },
  { label: 'لوحة الإدارة', target: 'admin', position: 'footer', sortOrder: 5 },
]

// 20+ Yemeni legislations (synthetic, clearly labeled)
const LEGISLATIONS = [
  {
    slug: 'constitution-2001',
    officialTitle: 'دستور الجمهورية اليمنية',
    shortTitle: 'دستور الجمهورية اليمنية',
    typeCode: 'constitution',
    number: '1',
    year: 2001,
    authorityCode: 'parliament',
    issueDate: '2001-02-20',
    publicationDate: '2001-02-28',
    effectiveDate: '2001-02-28',
    legalStatus: 'active',
    workflowStatus: 'published',
    verificationLevel: 'verified',
    preamble: 'نحن ممثلي شعب الجمهورية اليمنية، إيمانًا منهجيًا بالوحدة الوطنية، ومسؤولية تاريخية تجاه الأجيال، نضع هذا الدستور استجابةً لإرادة الشعب ومصلحته العليا، حرصًا على بناء دولة النظام والقانون، وتحقيق التنمية الشاملة، وحماية الحقوق والحريات.',
    hasAmendments: true,
    subjects: ['constitutional'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'civil-code-1996',
    officialTitle: 'القانون المدني',
    shortTitle: 'القانون المدني',
    typeCode: 'law',
    number: '14',
    year: 1996,
    authorityCode: 'parliament',
    issueDate: '1996-03-02',
    publicationDate: '1996-03-15',
    effectiveDate: '1996-07-15',
    legalStatus: 'active',
    workflowStatus: 'published',
    verificationLevel: 'verified',
    preamble: 'يُنظِّم هذا القانون المعاملات المدنية بين الأفراد، ويحدد الحقوق والالتزامات المترتبة عليها، ويؤكد أحكام الملكية والعقود والمسؤولية التقصيرية، مستندًا إلى الشريعة الإسلامية كمصدر رئيس للتشريع.',
    hasAmendments: true,
    subjects: ['civil'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'penal-code-1994',
    officialTitle: 'قانون الجرائم والعقوبات',
    shortTitle: 'قانون العقوبات',
    typeCode: 'law',
    number: '12',
    year: 1994,
    authorityCode: 'parliament',
    issueDate: '1994-04-25',
    publicationDate: '1994-05-10',
    effectiveDate: '1994-10-10',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'verified',
    preamble: 'يحدد هذا القانون الجرائم والعقوبات المقررة لها، ويُحدد قواعد المسؤولية الجنائية وأسباب الإباحة وأحكام العقوبات، مستندًا إلى أحكام الشريعة الإسلامية الغراء.',
    hasAmendments: true,
    subjects: ['criminal'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'commercial-code-1991',
    officialTitle: 'القانون التجاري',
    shortTitle: 'القانون التجاري',
    typeCode: 'law',
    number: '34',
    year: 1991,
    authorityCode: 'parliament',
    issueDate: '1991-06-15',
    publicationDate: '1991-07-01',
    effectiveDate: '1992-01-01',
    legalStatus: 'active',
    workflowStatus: 'published',
    verificationLevel: 'reviewed',
    preamble: 'يُنظِّم هذا القانون الأعمال التجارية والتجار والشركات التجارية والأوراق التجارية، ويحدد الإجراءات والقواعد الخاصة بالمعاملات التجارية.',
    hasAmendments: true,
    subjects: ['commercial', 'banking'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'labor-law-1995',
    officialTitle: 'قانون العمل',
    shortTitle: 'قانون العمل',
    typeCode: 'law',
    number: '5',
    year: 1995,
    authorityCode: 'parliament',
    issueDate: '1995-04-10',
    publicationDate: '1995-05-01',
    effectiveDate: '1995-11-01',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'verified',
    preamble: 'يُنظِّم هذا القانون علاقات العمل بين أصحاب العمل والعمال، ويحدد الحقوق والواجبات المتبادلة، وينظم عقد العمل وأجور العمال وساعات العمل والإجازات ووسائل السلامة المهنية.',
    hasAmendments: true,
    subjects: ['labor'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'personal-status-law-1992',
    officialTitle: 'قانون الأحوال الشخصية',
    shortTitle: 'قانون الأحوال الشخصية',
    typeCode: 'law',
    number: '20',
    year: 1992,
    authorityCode: 'parliament',
    issueDate: '1992-03-28',
    publicationDate: '1992-04-15',
    effectiveDate: '1992-10-15',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'verified',
    preamble: 'يُنظِّم هذا القانون أحوال الشخصية من حيث الزواج والطلاق والنفس والنفقة والميراث والوصاية والحضانة، مستندًا إلى أحكام الشريعة الإسلامية.',
    hasAmendments: true,
    subjects: ['family'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'income-tax-law-1999',
    officialTitle: 'قانون ضريبة الدخل',
    shortTitle: 'قانون ضريبة الدخل',
    typeCode: 'law',
    number: '17',
    year: 1999,
    authorityCode: 'parliament',
    issueDate: '1999-04-15',
    publicationDate: '1999-05-01',
    effectiveDate: '1999-12-01',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'reviewed',
    preamble: 'يُحدد هذا القانون الأحكام المتعلقة بضريبة الدخل على الأشخاص الطبيعيين والاعتباريين، وقواعد حساب الدخل الخاضع للضريبة، ومعدلات الضريبة وإجراءات تحصيلها.',
    hasAmendments: true,
    subjects: ['tax', 'income_tax'],
    classifications: ['primary', 'procedural'],
  },
  {
    slug: 'sales-tax-law-2005',
    officialTitle: 'قانون ضريبة المبيعات',
    shortTitle: 'قانون ضريبة المبيعات',
    typeCode: 'law',
    number: '19',
    year: 2005,
    authorityCode: 'parliament',
    issueDate: '2005-08-15',
    publicationDate: '2005-09-01',
    effectiveDate: '2006-01-01',
    legalStatus: 'active',
    workflowStatus: 'published',
    verificationLevel: 'reviewed',
    preamble: 'يُفرض هذا القانون ضريبة على استهلاك السلع والخدمات، ويحدد الإجراءات المتعلقة بتحصيلها، وآلية احتسابها ومعدلاتها والإعفاءات منها.',
    hasAmendments: false,
    subjects: ['tax', 'sales_tax'],
    classifications: ['primary', 'procedural'],
  },
  {
    slug: 'customs-law-1986',
    officialTitle: 'قانون الجمارك',
    shortTitle: 'قانون الجمارك',
    typeCode: 'law',
    number: '32',
    year: 1986,
    authorityCode: 'parliament',
    issueDate: '1986-09-10',
    publicationDate: '1986-10-01',
    effectiveDate: '1987-01-01',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'verified',
    preamble: 'يُنظِّم هذا القانون العمليات الجمركية والتعرفة الجمركية والإجراءات المتعلقة باستيراد وتصدير البضائع، ويحدد المخالفات والغرامات الجمركية.',
    hasAmendments: true,
    subjects: ['customs', 'customs_tariff'],
    classifications: ['primary', 'procedural'],
  },
  {
    slug: 'central-bank-law-2012',
    officialTitle: 'قانون البنك المركزي اليمني',
    shortTitle: 'قانون البنك المركزي',
    typeCode: 'law',
    number: '14',
    year: 2012,
    authorityCode: 'parliament',
    issueDate: '2012-04-20',
    publicationDate: '2012-05-10',
    effectiveDate: '2012-11-10',
    legalStatus: 'active',
    workflowStatus: 'published',
    verificationLevel: 'verified',
    preamble: 'يُنظِّم هذا القانون عمل البنك المركزي اليمني وأهدافه ووظائه في إصدار النقد وضبط السياسة النقدية والإشراف على الجهاز المصرفي وإدارة الاحتياطيات الخارجية.',
    hasAmendments: true,
    subjects: ['banking'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'banking-law-2000',
    officialTitle: 'قانون البنوك',
    shortTitle: 'قانون البنوك',
    typeCode: 'law',
    number: '15',
    year: 2000,
    authorityCode: 'parliament',
    issueDate: '2000-06-20',
    publicationDate: '2000-07-15',
    effectiveDate: '2001-01-15',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'reviewed',
    preamble: 'يُنظِّم هذا القانون عمل البنوك التجارية الإسلامية والتقليدية في الجمهورية اليمنية، ويرخص لها بممارسة النشاط المصرفي وفقًا لأحكام الشريعة الإسلامية والقوانين النافذة.',
    hasAmendments: true,
    subjects: ['banking', 'commercial'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'land-law-1995',
    officialTitle: 'قانون الأراضي',
    shortTitle: 'قانون الأراضي',
    typeCode: 'law',
    number: '21',
    year: 1995,
    authorityCode: 'parliament',
    issueDate: '1995-04-05',
    publicationDate: '1995-05-20',
    effectiveDate: '1995-12-01',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'reviewed',
    preamble: 'يُنظِّم هذا القانون ملكية الأراضي وحيازتها وتسجيلها، ويحدد أحكام نقل الملكية وإثبات الحقوق العينية العقارية.',
    hasAmendments: true,
    subjects: ['land', 'civil'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'investment-law-2002',
    officialTitle: 'قانون الاستثمار',
    shortTitle: 'قانون الاستثمار',
    typeCode: 'law',
    number: '22',
    year: 2002,
    authorityCode: 'parliament',
    issueDate: '2002-09-15',
    publicationDate: '2002-10-01',
    effectiveDate: '2003-04-01',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'reviewed',
    preamble: 'يهدف هذا القانون إلى تشجيع الاستثمار في القطاعات ذات الأولوية، وتحفيز رؤوس الأموال المحلية والأجنبية للاستثمار في الجمهورية اليمنية، وتقديم الإعفاءات والمزايا للمستثمرين.',
    hasAmendments: true,
    subjects: ['economic', 'investment'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'free-zones-law-1999',
    officialTitle: 'قانون المناطق الحرة',
    shortTitle: 'قانون المناطق الحرة',
    typeCode: 'law',
    number: '4',
    year: 1999,
    authorityCode: 'parliament',
    issueDate: '1999-02-01',
    publicationDate: '1999-02-20',
    effectiveDate: '1999-09-01',
    legalStatus: 'active',
    workflowStatus: 'published',
    verificationLevel: 'reviewed',
    preamble: 'يُنظِّم هذا القانون إنشاء المناطق الحرة وإدارتها في الجمهورية اليمنية، ويحدد الإعفاءات والمزايا الممنوحة للمشروعات القائمة فيها.',
    hasAmendments: false,
    subjects: ['economic', 'free_zones', 'customs'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'civil-service-law-1991',
    officialTitle: 'قانون الخدمة المدنية',
    shortTitle: 'قانون الخدمة المدنية',
    typeCode: 'law',
    number: '19',
    year: 1991,
    authorityCode: 'parliament',
    issueDate: '1991-07-15',
    publicationDate: '1991-08-10',
    effectiveDate: '1992-01-01',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'verified',
    preamble: 'يُنظِّم هذا القانون شؤون موظفي الدولة في الجمهورية اليمنية، ويحدد أحكام التعيين والترقية والنقل والندب والإعارة والندب، وحقوق وواجبات الموظفين العموميين.',
    hasAmendments: true,
    subjects: ['administrative', 'civil_service'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'local-authority-law-2000',
    officialTitle: 'قانون السلطة المحلية',
    shortTitle: 'قانون السلطة المحلية',
    typeCode: 'law',
    number: '4',
    year: 2000,
    authorityCode: 'parliament',
    issueDate: '2000-02-26',
    publicationDate: '2000-03-15',
    effectiveDate: '2001-02-15',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'verified',
    preamble: 'يُنظِّم هذا القانون السلطة المحلية في الجمهورية اليمنية، ويحدد اختصاصات المجالس المحلية وأجهزتها التنفيذية، وآليات تنفيذ الصلاحيات المنقولة إليها.',
    hasAmendments: true,
    subjects: ['administrative', 'municipal'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'education-law-1992',
    officialTitle: 'قانون التعليم العام',
    shortTitle: 'قانون التعليم العام',
    typeCode: 'law',
    number: '24',
    year: 1992,
    authorityCode: 'parliament',
    issueDate: '1992-10-15',
    publicationDate: '1992-11-01',
    effectiveDate: '1993-09-01',
    legalStatus: 'active',
    workflowStatus: 'published',
    verificationLevel: 'reviewed',
    preamble: 'يُحدد هذا القانون أحكام التعليم العام في الجمهورية اليمنية، ويؤكد على إلزامية التعليم الأساسي ومجانيته، ويُنظِّم شؤون المعلمين والمناهج والإدارة المدرسية.',
    hasAmendments: false,
    subjects: ['education'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'public-health-law-2009',
    officialTitle: 'قانون الصحة العامة',
    shortTitle: 'قانون الصحة العامة',
    typeCode: 'law',
    number: '7',
    year: 2009,
    authorityCode: 'parliament',
    issueDate: '2009-02-15',
    publicationDate: '2009-03-01',
    effectiveDate: '2009-09-01',
    legalStatus: 'active',
    workflowStatus: 'published',
    verificationLevel: 'reviewed',
    preamble: 'يُنظِّم هذا القانون شؤون الصحة العامة في الجمهورية اليمنية، وحقوق المرضى، ومسؤوليات مزاولي المهن الصحية، ويحدد أحكام الرقابة الصحية على الأغذية والدواء.',
    hasAmendments: false,
    subjects: ['health'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'environment-law-1995',
    officialTitle: 'قانون حماية البيئة',
    shortTitle: 'قانون البيئة',
    typeCode: 'law',
    number: '26',
    year: 1995,
    authorityCode: 'parliament',
    issueDate: '1995-10-22',
    publicationDate: '1995-11-15',
    effectiveDate: '1996-05-01',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'reviewed',
    preamble: 'يهدف هذا القانون إلى حماية البيئة وصون توازنها الطبيعي، ومنع التلوث بكافة أشكاله، وتنمية الموارد الطبيعية وحمايتها من الاستنزاف.',
    hasAmendments: true,
    subjects: ['environment'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'judicial-authority-law-1991',
    officialTitle: 'قانون السلطة القضائية',
    shortTitle: 'قانون السلطة القضائية',
    typeCode: 'law',
    number: '1',
    year: 1991,
    authorityCode: 'parliament',
    issueDate: '1991-03-15',
    publicationDate: '1991-04-01',
    effectiveDate: '1991-10-01',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'verified',
    preamble: 'يُنظِّم هذا القانون السلطة القضائية في الجمهورية اليمنية، ويكفل استقلال القضاء وحيدة القضاة، ويُحدد اختصاصات المحاكم وشروط التعيين فيها.',
    hasAmendments: true,
    subjects: ['judicial', 'administrative'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'social-security-law-1996',
    officialTitle: 'قانون التأمينات الاجتماعية',
    shortTitle: 'قانون التأمينات الاجتماعية',
    typeCode: 'law',
    number: '26',
    year: 1996,
    authorityCode: 'parliament',
    issueDate: '1996-12-01',
    publicationDate: '1996-12-20',
    effectiveDate: '1997-06-01',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'reviewed',
    preamble: 'يُنظِّم هذا القانون التأمينات الاجتماعية، ويحدد فئات المشمولين بأحكامه، وأنواع التأمينات الممنوحة، وقواعد الاشتراك والاستحقاق وصرف المعاشات والتعويضات.',
    hasAmendments: true,
    subjects: ['social', 'labor'],
    classifications: ['primary', 'substantive'],
  },
  {
    slug: 'traffic-law-1998',
    officialTitle: 'قانون المرور',
    shortTitle: 'قانون المرور',
    typeCode: 'law',
    number: '14',
    year: 1998,
    authorityCode: 'parliament',
    issueDate: '1998-06-15',
    publicationDate: '1998-07-01',
    effectiveDate: '1999-01-01',
    legalStatus: 'amended',
    workflowStatus: 'published',
    verificationLevel: 'reviewed',
    preamble: 'يُنظِّم هذا القانون حركة المرور في الجمهورية اليمنية، ويحدد أحكام رخص القيادة وتسجيل المركبات والمخالفات المرورية والعقوبات المقررة لها.',
    hasAmendments: true,
    subjects: ['administrative'],
    classifications: ['primary', 'procedural'],
  },
  {
    slug: 'consumer-protection-law-2008',
    officialTitle: 'قانون حماية المستهلك',
    shortTitle: 'قانون حماية المستهلك',
    typeCode: 'law',
    number: '14',
    year: 2008,
    authorityCode: 'parliament',
    issueDate: '2008-05-12',
    publicationDate: '2008-06-01',
    effectiveDate: '2009-01-01',
    legalStatus: 'active',
    workflowStatus: 'published',
    verificationLevel: 'reviewed',
    preamble: 'يهدف هذا القانون إلى حماية المستهلك من الغش والتدليس، وضمان جودة السلع والخدمات، وتنظيم ممارسة الإعلان التجاري وحماية المنافسة ومنع الاحتكار.',
    hasAmendments: false,
    subjects: ['commercial', 'administrative'],
    classifications: ['primary', 'substantive'],
  },
]

// Sample articles for several legislations
const ARTICLES = {
  'constitution-2001': [
    { num: '1', title: 'الجمهورية اليمنية', text: 'الجمهورية اليمنية دولة عربية إسلامية مستقلة ذات سيادة، وهي وحدة لا تجزأ، لا يجوز التنازل عن أي جزء منها، والشعب اليمني جزء من الأمة العربية والإسلامية.' },
    { num: '2', title: 'الشريعة الإسلامية', text: 'الإسلام دين الدولة، واللغة العربية لغتها الرسمية، والشريعة الإسلامية مصدر جميع التشريعات.' },
    { num: '3', title: 'الشعب صاحب السيادة', text: 'الشعب مالك السلطة ومصدرها، يمارسها مباشرة عن طريق الاستفتاء وانتخابات الرئاسة ومجلس النواب، وبطريق غير مباشر عبر استفتاءات شعبية.' },
    { num: '4', title: 'الشريعة مصدر التشريع', text: 'الشعب مالك السلطة ومصدرها، يمارسها بشكل مباشر وبشكل غير مباشر بالاستفتاء والانتخابات العامة.' },
    { num: '5', title: 'الاقتصاد الوطني', text: 'يقوم الاقتصاد الوطني على أساس التنمية المستدامة، ويُعنى بالتنمية المتوازنة بين مناطق الجمهورية، وتنويع مصادر الدخل.' },
    { num: '6', title: 'الملكية', text: 'الملكية الخاصة محمية، ولا يمكن مصادرة ممتلكات أحد إلا بحكم قضائي، والملكية العامة لها حماية خاصة.' },
    { num: '7', title: 'المساواة', text: 'المواطنون جميعهم متساوون في الحقوق والواجبات العامة، لا تمييز بينهم بسبب الجنس أو اللون أو الأصل أو اللغة أو المهنة أو المركز الاجتماعي.' },
    { num: '8', title: 'الحقوق الأساسية', text: 'تكفل الدولة حقوق الإنسان السياسية والمدنية والاقتصادية والاجتماعية والثقافية، وفقاً للعهود والمواثيق الدولية المصادق عليها.' },
    { num: '9', title: 'الحق في الحياة', text: 'الحق في الحياة مكفول، ولا يجوز المساس بحياة الإنسان إلا في الحدود التي يقررها القانون.' },
    { num: '10', title: 'حرية التعبير', text: 'حرية الرأي والتفكير والتعبير مكفولة بالقانون، ولكل مواطن الحق في التعبير عن رأيه بالقول أو الكتابة أو التصوير أو غير ذلك من وسائل التعبير.' },
  ],
  'civil-code-1996': [
    { num: '1', title: 'النطاق', text: 'يُحدد هذا القانون أحكام المعاملات المدنية، والحقوق المالية للأفراد، وما يترتب عليها من التزامات بين الأشخاص الطبيعيين والاعتباريين.' },
    { num: '2', title: 'القانون الأكثر صلة', text: 'إذا تعارضت قواعد القانون الدولي الخاص، يُطبَّق القانون الأكثر صلة بالنزاع، ويُحكم القاضي اليمني في الأحوال الشخصية بموجب الشريعة الإسلامية.' },
    { num: '3', title: 'الإثبات', text: 'يُثبت الالتزام بكافة وسائل الإثبات المقبولة شرعًا وقانونًا، وللقاضي سلطة تقديرية في قبول الدليل.' },
    { num: '4', title: 'الأهلية', text: 'يكون كل شخص أهلاً للالتزام ما لم تُسلب أهليته أو يُعدم بها بسبب عدم العقل أو عدم التمييز بسبب الصغر أو الجنون أو العته.' },
    { num: '5', title: 'عقد البيع', text: 'البيع عقد يلتزم بمقتضاه البائع أن ينقل للمشتري ملكية شيء مملوك له أو حق مالي في مقابل ثمن معلوم.' },
    { num: '6', title: 'أحكام الإيجار', text: 'الإيجار عقد يلتزم المؤجر بمقتضاه أن يمكن المستأجر من الانتفاع بشيء معين مدة معلومة في مقابل أجر معلوم.' },
    { num: '7', title: 'المسؤولية التقصيرية', text: 'كل خطأ سبب ضررًا للغير يُلزم من ارتكبه بالتعويض، ويشترط لقيام المسؤولية وجود خطأ وضرر وعلاقة سببية بينهما.' },
    { num: '8', title: 'العقد الملزم للجانبين', text: 'في العقود الملزمة للجانبين، إذا التزم أحد الطرفين بجزء من العقد وجب على الطرف الآخر الالتزام بما يقابله، ولا يجوز للمطالب أن يحبس التنفيذ.' },
    { num: '9', title: 'فسخ العقد', text: 'في العقود الملزمة للجانبين، إذا لم يوفِ أحد الطرفين بالتزامه جاز للطرف الآخر بعد إنذاره أن يطلب فسخ العقد أو تنفيذه مع التعويض.' },
    { num: '10', title: 'الإثراء بلا سبب', text: 'كل شخص ولو غير مميز يُثرى دون سبب مشروع على حساب شخص آخر يلزمه في حدود ما أثري به أن يرد له ما فوّضه عليه.' },
  ],
  'penal-code-1994': [
    { num: '1', title: 'مبدأ الشرعية', text: 'لا جريمة ولا عقوبة إلا بنص قانوني، ولا يجوز تطبيق أحكام هذا القانون بأثر رجعي إلا ما كان منها أصلح للمتهم.' },
    { num: '2', title: 'الركن المادي', text: 'تتكون الجريمة من ركن مادي وركن معنوي، فإذا انتفى أحدهما انتفت الجريمة، ويتحقق الركن المادي بالسلوك الإجرامي والنتيجة وعلاقة السببية.' },
    { num: '3', title: 'العمد والخطأ', text: 'تكون الجريمة عمدية إذا اقترن الفعل بقصد جنائي، وتكون غير عمدية إذا اقترن بخطأ أو إهمال أو رعونة.' },
    { num: '4', title: 'أسباب الإباحة', text: 'لا جريمة إذا وقع الفعل بقصد دفع ضرر محدق لم يكن للمرتكب سبب لإحباطه، وفي حدود الضرورة الشرعية والقانونية.' },
    { num: '5', title: 'الشروع في الجريمة', text: 'الشروع في الجريمة يبدأ ببدء تنفيذ الفعل الجنائي وإذا توقف الفعل أو خابت أثره لسبب لا دخل لإرادة الفاعل فيه.' },
    { num: '6', title: 'الاشتراك في الجريمة', text: 'يُعد فاعلاً للجريمة كل من ارتكبها أو اشترك فيها مباشرة، ويُعد شريكاً كل من ساعد أو حرض أو وافق على ارتكابها.' },
    { num: '7', title: 'العقوبات الأصلية', text: 'العقوبات الأصلية هي: الإعدام، السجن المؤبد، السجن المدد، الحبس، الغرامة، الاعتناف، الوضع تحت مراقبة الشرطة.' },
    { num: '8', title: 'العقوبات التبعية', text: 'العقوبات التبعية هي: الحرمان من الحقوق السياسية والمدنية، والحرمان من مزاولة المهنة، والمصادرة، وإغلاق المحل.' },
    { num: '9', title: 'ظروف التشديد', text: 'تُشدد العقوبة إذا اقترنت الجريمة بسبق الإصرار، أو مع سبق الإصرار والترصد، أو في زمن الحرب أو الكوارث.' },
    { num: '10', title: 'ظروف التخفيف', text: 'يُخفف الحكم إذا توفرت أسباب تخفيفية، كأن يكون الفاعل محرضًا أو صغيرًا، أو إذا بادر بالتبليغ قبل العلم بالجريمة.' },
  ],
  'labor-law-1995': [
    { num: '1', title: 'نطاق التطبيق', text: 'تسري أحكام هذا القانون على العمال وأصحاب العمال في القطاعين العام والخاص والمختلط والتعاوني، فيما لم ينظمه قانون خاص.' },
    { num: '2', title: 'تعاريف', text: 'يُقصد بالعامل كل شخص طبيعي يعمل لصالح صاحب عمل وتحت إشرافه أو إدارته مقابل أجر، ويُقصد بصاحب العمال كل شخص طبيعي أو اعتباري يشغل عاملًا واحدًا أو أكثر.' },
    { num: '3', title: 'عقد العمل', text: 'يُعقد عقد العمل لمدة غير محددة أو محددة، ويجب أن يكون مكتوبًا، ويُحدد فيه الأجر ومواقيت العمل والإجازات والواجبات.' },
    { num: '4', title: 'ساعات العمل', text: 'لا يجوز تشغيل العامل تشغيلًا فعليًا أكثر من ثماني ساعات في اليوم أو ثمان وأربعين ساعة في الأسبوع، مع فترة راحة لا تقل عن ساعة.' },
    { num: '5', title: 'الإجازات', text: 'يستحق العامل إجازة سنوية مدفوعة الأجر لا تقل عن 30 يومًا، وإجازة مرضية وفق ما يحدده القانون، وإجازات رسمية وأعياد.' },
    { num: '6', title: 'الأجر', text: 'يستحق العامل أجرًا مقابل عمله، ويجب أن لا يقل عن الحد الأدنى المعتمد من الدولة، ويُدفع في موعد أقصاه نهاية الشهر.' },
    { num: '7', title: 'السلامة المهنية', text: 'يلتزم صاحب العمل بتوفير وسائل السلامة والصحة المهنية في مواقع العمل، ومنع العمال من تشغيلهم في ظروف خطرة دون حماية.' },
    { num: '8', title: 'تشغيل النساء', text: 'لا يجوز تشغيل النساء في الأعمال الشاقة أو الضارة صحيًا، ويُمنع تشغيلهن في فترة الليل إلا في الأعمال المحددة قانونًا.' },
    { num: '9', title: 'تشغيل الأحداث', text: 'لا يجوز تشغيل الأحداث دون سن السادسة عشرة، ومن هم دون الثامنة عشرة إلا في أعمال معينة وفقاً لشروط القانون.' },
    { num: '10', title: 'إنهاء عقد العمل', text: 'لا يجوز فصل العامل تعسفيًا، ويجب أن يكون الفصل لسبب مشروع، مع منحه مكافأة نهاية الخدمة وفق أحكام هذا القانون.' },
  ],
}

// Attachments per legislation
const ATTACHMENTS = {
  'labor-law-1995': [
    {
      title: 'لائحة تنفيذية لقانون العمل',
      type: 'executive_regulation',
      contentType: 'text',
      status: 'published',
      text: 'تحدد هذه اللائحة التنفيذية قواعد تطبيق قانون العمل، وأحكام التفتيش على مواقع العمل، وإجراءات تسوية المنازعات العمالية.',
    },
    {
      title: 'جدول المهن الخطرة',
      type: 'table',
      contentType: 'table',
      status: 'published',
      tableContent: JSON.stringify({
        columns: ['الرقم', 'المهنة', 'درجة الخطورة', 'الشروط الصحية'],
        rows: [
          ['1', 'التعدين تحت الأرض', 'عالية', 'فحص دوري كل 3 أشهر'],
          ['2', 'صهر المعادن', 'عالية', 'تهوية صناعية وفحص سنوي'],
          ['3', 'الصباغة الكيميائية', 'متوسطة', 'أجهزة تنفس وفحص سنوي'],
          ['4', 'تشغيل الضغط العالي', 'عالية', 'فحص طبي قبل وأثناء العمل'],
        ],
      }),
    },
  ],
  'customs-law-1986': [
    {
      title: 'التعرفة الجمركية الموحدة',
      type: 'tariff',
      contentType: 'table',
      status: 'published',
      tableContent: JSON.stringify({
        columns: ['البند', 'البيان', 'وحدة القياس', 'النسبة %'],
        rows: [
          ['0101', 'خيول حية للسباق', 'رأس', '5'],
          ['0201', 'لحوم أبقار طازجة', 'كغ', '15'],
          ['0301', 'أسماك طازجة', 'كغ', '0'],
          ['0401', 'حليب غير مركز', 'لتر', '5'],
          ['1006', 'أرز شعير', 'كغ', '0'],
          ['1701', 'سكر قصب خام', 'كغ', '10'],
        ],
      }),
    },
  ],
  'income-tax-law-1999': [
    {
      title: 'نموذج إقرار ضريبة الدخل السنوي',
      type: 'form',
      contentType: 'file',
      status: 'published',
    },
    {
      title: 'جدول الشرائح الضريبية',
      type: 'tariff',
      contentType: 'table',
      status: 'published',
      tableContent: JSON.stringify({
        columns: ['الشريحة', 'الدخل السنوي (ريال)', 'النسبة %', 'الحد الأدنى'],
        rows: [
          ['1', 'حتى 240,000', '0%', 'معفو'],
          ['2', '240,001 - 480,000', '5%', '12,000'],
          ['3', '480,001 - 1,200,000', '10%', '32,000'],
          ['4', '1,200,001 - 2,400,000', '15%', '92,000'],
          ['5', 'أكثر من 2,400,000', '20%', '272,000'],
        ],
      }),
    },
  ],
  'constitution-2001': [
    {
      title: 'خريطة تقسيمات الجمهورية اليمنية',
      type: 'map',
      contentType: 'file',
      status: 'published',
    },
  ],
}

// Relations between legislations
const RELATIONS = [
  { from: 'income-tax-law-1999', to: 'constitution-2001', type: 'based_on', status: 'published' },
  { from: 'sales-tax-law-2005', to: 'constitution-2001', type: 'based_on', status: 'published' },
  { from: 'customs-law-1986', to: 'free-zones-law-1999', type: 'refers_to', status: 'published' },
  { from: 'labor-law-1995', to: 'social-security-law-1996', type: 'refers_to', status: 'published' },
  { from: 'commercial-code-1991', to: 'civil-code-1996', type: 'refers_to', status: 'published' },
  { from: 'banking-law-2000', to: 'commercial-code-1991', type: 'based_on', status: 'published' },
  { from: 'central-bank-law-2012', to: 'banking-law-2000', type: 'implements', status: 'published' },
  { from: 'penal-code-1994', to: 'constitution-2001', type: 'based_on', status: 'published' },
  { from: 'consumer-protection-law-2008', to: 'commercial-code-1991', type: 'refers_to', status: 'published' },
  { from: 'traffic-law-1998', to: 'penal-code-1994', type: 'refers_to', status: 'published' },
  { from: 'judicial-authority-law-1991', to: 'constitution-2001', type: 'implements', status: 'published' },
  { from: 'local-authority-law-2000', to: 'civil-service-law-1991', type: 'refers_to', status: 'published' },
  { from: 'environment-law-1995', to: 'public-health-law-2009', type: 'related_subject', status: 'published' },
  { from: 'investment-law-2002', to: 'free-zones-law-1999', type: 'related_subject', status: 'published' },
]

// Amendment documents
const AMENDMENTS = [
  {
    slug: 'amend-constitution-2003',
    title: 'تعديل بعض مواد دستور الجمهورية اليمنية',
    number: '1',
    year: 2003,
    targetSlug: 'constitution-2001',
    sourceSlug: null,
    status: 'applied',
    issueDate: '2003-04-15',
    effectiveDate: '2003-05-15',
    description: 'تعديل بعض مواد دستور الجمهورية اليمنية بشأن تمديد ولاية رئيس الجمهورية ومجلس النواب.',
    operations: [
      { type: 'replace', articleNum: '5', newText: 'يقوم الاقتصاد الوطني على أساس التنمية المستدامة، ويُعنى بالتنمية المتوازنة بين مناطق الجمهورية، وتنويع مصادر الدخل، وتشجيع الاستثمار المحلي والأجنبي.' },
      { type: 'add', newArticleNum: '143', newText: 'يجوز لمجلس النواب اقتراح تعديل الدستور، ويشترط موافقة أغلبية الأعضاء.' },
    ],
  },
  {
    slug: 'amend-penal-2004',
    title: 'تعديل بعض مواد قانون الجرائم والعقوبات',
    number: '24',
    year: 2004,
    targetSlug: 'penal-code-1994',
    sourceSlug: null,
    status: 'applied',
    issueDate: '2004-02-10',
    effectiveDate: '2004-08-10',
    description: 'تعديل بعض مواد قانون الجرائم والعقوبات لمعالجة الجرائم الإلكترونية وجرائم الإرهاب.',
    operations: [
      { type: 'replace', articleNum: '7', newText: 'العقوبات الأصلية هي: الإعدام، السجن المؤبد، السجن المدد، الحبس، الغرامة، الاعتناف، الوضع تحت مراقبة الشرطة، ومنع الإقامة.' },
      { type: 'add', newArticleNum: '239', newText: 'يُعاقب بالسجن مدة لا تقل عن خمس سنوات كل من ارتكب جريمة من جرائم تقنية المعلومات أو الاحتيال الإلكتروني.' },
    ],
  },
  {
    slug: 'amend-labor-2009',
    title: 'تعديل بعض مواد قانون العمل',
    number: '7',
    year: 2009,
    targetSlug: 'labor-law-1995',
    sourceSlug: null,
    status: 'applied',
    issueDate: '2009-03-01',
    effectiveDate: '2009-09-01',
    description: 'تعديل بعض مواد قانون العمل بشأن الأجور والإجازات السنوية.',
    operations: [
      { type: 'replace', articleNum: '5', newText: 'يستحق العامل إجازة سنوية مدفوعة الأجر لا تقل عن 30 يومًا، وإجازة مرضية وفق ما يحدده القانون، وإجازات رسمية وأعياد، وإجازة وضع للأم العاملة مدتها 70 يومًا.' },
    ],
  },
]

const NEWS_ARTICLES = [
  {
    slug: 'news-2024-q3-update',
    title: 'منصة التشريعات اليمنية تطلق النسخة التجريبية',
    summary: 'يتم إطلاق منصة التشريعات اليمنية بصيغة تجريبية لتسهيل البحث في القوانين اليمنية.',
    body: 'يُسعدنا الإعلان عن إطلاق النسخة التجريبية من منصة التشريعات اليمنية، التي تهدف إلى تسهيل وصول المواطنين والباحثين والمختصين إلى نصوص التشريعات اليمنية بمختلف أنواعها. تأتي هذه المنصة استجابة لحاجة المجتمع اليمني إلى مرجعية قانونية موثوقة ومرتبة زمنيًا.',
    publishedAt: '2024-09-01',
    status: 'published',
  },
  {
    slug: 'news-2024-penal-amendment',
    title: 'تعديلات على قانون الجرائم والعقوبات تُغطي الجرائم الإلكترونية',
    summary: 'صدر تعديل على قانون العقوبات يُغطي الجرائم الإلكترونية وجرائم تقنية المعلومات.',
    body: 'في إطار مواكبة التطور التكنولوجي، تم تعديل بعض مواد قانون الجرائم والعقوبات ليشمل الجرائم الإلكترونية، ويُعاقب كل من يقوم بالاحتيال الإلكتروني أو اختراق الأنظمة والشبكات.',
    publishedAt: '2024-08-15',
    status: 'published',
  },
  {
    slug: 'news-2024-tax-reform',
    title: 'إعلان موعد سريان تعديلات ضريبة الدخل',
    summary: 'تُعلن وزارة المالية عن سريان تعديلات ضريبة الدخل اعتبارًا من العام المالي القادم.',
    body: 'في إطار إصلاح المنظومة الضريبية، أعلنت وزارة المالية عن سريان تعديلات قانون ضريبة الدخل اعتبارًا من العام المالي القادم، وتشمل التعديلات تعديل الشرائح الضريبية وزيادة حد الإعفاء.',
    publishedAt: '2024-07-20',
    status: 'published',
  },
  {
    slug: 'news-2024-environment-initiative',
    title: 'إطلاق مبادرة حماية البيئة في المناطق الصناعية',
    summary: 'تعاون بين وزارتي البيئة والصناعة لحماية المناطق الصناعية.',
    body: 'تم إطلاق مبادرة وطنية لحماية البيئة في المناطق الصناعية، بالتعاون بين وزارتي الصناعة والبيئة، وتشمل المبادرة مراقبة الانبعاثات ومعالجة المخلفات.',
    publishedAt: '2024-06-10',
    status: 'published',
  },
]

const PUBLIC_PAGES = [
  {
    slug: 'about',
    title: 'التعريف بالمنصة',
    intro: 'منصة التشريعات اليمنية هي منصة وطنية متكاملة لإدارة التشريعات وعرضها والبحث فيها.',
    content: 'تهدف المنصة إلى توفير مرجعية موثوقة للتشريعات اليمنية، وتسهيل وصول المواطنين والباحثين والمؤسسات إلى النصوص القانونية النافذة، مع دعم النسخ الزمنية والتعديلات والملاحق.',
    status: 'published',
    sections: [
      { title: 'الرؤية', body: 'نسعى إلى بناء منظومة تشريعية شفافة يسهل الوصول إليها وتُحفظ فيها حقوق المواطن.' },
      { title: 'الرسالة', body: 'توفير مرجعية قانونية موثوقة ومرتبة زمنيًا لكل التشريعات اليمنية النافذة.' },
      { title: 'الأهداف', body: 'تسهيل البحث في التشريعات، حفظ النسخ التاريخية، دعم القرارات القانونية، وتعزيز الشفافية.' },
    ],
  },
  {
    slug: 'contact',
    title: 'اتصل بنا',
    intro: 'يمكنكم التواصل مع فريق منصة التشريعات اليمنية عبر القنوات التالية.',
    content: 'يُسرّنا تلقي ملاحظاتكم واقتراحاتكم لتطوير المنصة وتحسين خدماتها.',
    status: 'published',
    sections: [
      { title: 'العنوان', body: 'صنعاء، الجمهورية اليمنية' },
      { title: 'الهاتف', body: '+967 1 000 000' },
      { title: 'البريد الإلكتروني', body: 'info@yemen-legislation.ye' },
    ],
  },
  {
    slug: 'privacy',
    title: 'سياسة الخصوصية',
    intro: 'نلتزم بحماية خصوصية المستخدمين وبياناتهم الشخصية.',
    content: 'تحدد هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لبيانات المستخدمين على المنصة.',
    status: 'published',
    sections: [
      { title: 'جمع البيانات', body: 'نجمع فقط البيانات الضرورية لتقديم خدمات المنصة، ولا نشاركها مع أطراف ثالثة.' },
      { title: 'استخدام الكوكيز', body: 'نستخدم ملفات تعريف الارتباط لتحسين تجربة المستخدم وتحليل الأداء.' },
      { title: 'حقوق المستخدم', body: 'يحق للمستخدم طلب الاطلاع على بياناته أو تصحيحها أو حذفها وفقًا للقانون.' },
    ],
  },
  {
    slug: 'terms',
    title: 'الشروط والأحكام',
    intro: 'تحدد هذه الشروط قواعد استخدام منصة التشريعات اليمنية.',
    content: 'باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط والأحكام.',
    status: 'published',
    sections: [
      { title: 'استخدام المحتوى', body: 'المحتوى المنشور على المنصة مخصص للاستخدام العام، ويجب الإشارة إلى المصدر عند الاستخدام.' },
      { title: 'المسؤولية', body: 'لا تتحمل المنصة مسؤولية أي قرارات تتخذ بناءً على المحتوى المنشور، ويُنصح باستشارة مختص قانوني.' },
      { title: 'الملكية الفكرية', body: 'النصوص القانونية ملكية عامة، أما تصميم المنصة وتنظيمها فمحمي بحقوق الملكية الفكرية.' },
    ],
  },
  {
    slug: 'policies-and-guides',
    title: 'السياسات والأدلة',
    intro: 'تتضمن هذه الصفحة قائمة بالسياسات والأدلة المتعلقة باستخدام المنصة.',
    content: 'يُمكنكم الاطلاع على السياسات والأدلة التالية لفهم كيفية استخدام المنصة بفعالية.',
    status: 'published',
    sections: [
      { title: 'دليل البحث المتقدم', body: 'يُتيح البحث المتقدم البحث في النصوص والنسخ والملاحق والإحالات وفق معايير متعددة.' },
      { title: 'دليل الاستيراد', body: 'يُتيح الاستيراد رفع ملفات PDF أو TXT أو DOCX لاستخراج النصوص وإنشاء تشريع جديد.' },
      { title: 'سياسة المراجعة', body: 'تتطلب جميع التشريعات المنشورة المراجعة من قبل مختص قانوني قبل النشر.' },
    ],
  },
  {
    slug: 'legislative-system',
    title: 'المنظومة التشريعية',
    intro: 'تضم المنظومة التشريعية اليمنية مجموعة من القوانين واللوائح المنظمة لمختلف المجالات.',
    content: 'تتشكل المنظومة التشريعية في الجمهورية اليمنية من عدة مستويات من التشريعات، بدءًا من الدستور، مرورًا بالقوانين الصادرة من مجلس النواب، وانتهاءً بالقرارات واللوائح التنفيذية.',
    status: 'published',
    sections: [
      { title: 'الدستور', body: 'الدستور هو الوثيقة العليا في البلاد، وتُستمد منه جميع التشريعات، ويحدد نظام الحكم وحقوق المواطنين.' },
      { title: 'القوانين', body: 'تُصدر القوانين من مجلس النواب، وتُنظم مختلف المجالات المدنية والجنائية والتجارية والإدارية.' },
      { title: 'القرارات الجمهورية', body: 'تُصدر القرارات الجمهورية من رئيس الجمهورية، وتُنظم المسائل التنفيذية والإدارية.' },
      { title: 'اللوائح التنفيذية', body: 'تُصدر اللوائح التنفيذية من الوزارات المختصة، وتُحدد تفاصيل تطبيق القوانين.' },
    ],
  },
]

// Demo users
const USERS = [
  { username: 'reader', email: 'reader@yemen-legislation.ye', fullName: 'قارئ تجريبي', password: 'Demo1234!', roleCodes: ['reader'] },
  { username: 'data.entry', email: 'data@yemen-legislation.ye', fullName: 'مُدخل بيانات تجريبي', password: 'Demo1234!', roleCodes: ['data_entry'] },
  { username: 'reviewer', email: 'reviewer@yemen-legislation.ye', fullName: 'مُراجع قانوني تجريبي', password: 'Demo1234!', roleCodes: ['legal_reviewer'] },
  { username: 'content.mgr', email: 'content@yemen-legislation.ye', fullName: 'مدير محتوى تجريبي', password: 'Demo1234!', roleCodes: ['content_manager'] },
  { username: 'admin', email: 'admin@yemen-legislation.ye', fullName: 'مدير نظام تجريبي', password: 'Demo1234!', roleCodes: ['system_admin'] },
  { username: 'super', email: 'super@yemen-legislation.ye', fullName: 'مدير أعلى محمي', password: 'Demo1234!', roleCodes: ['super_admin'] },
]

const PLATFORM_SETTINGS = [
  { key: 'platform.name', value: 'منصة التشريعات اليمنية', type: 'string', category: 'general' },
  { key: 'platform.tagline', value: 'مرجعيتك القانونية الموثوقة', type: 'string', category: 'general' },
  { key: 'platform.description', value: 'منصة وطنية متكاملة لإدارة التشريعات اليمنية وعرضها والبحث فيها، مع دعم النسخ الزمنية والتعديلات والملاحق والعلاقات القانونية.', type: 'string', category: 'general' },
  { key: 'recycle.retention_days', value: '30', type: 'number', category: 'operations' },
  { key: 'search.results_per_page', value: '20', type: 'number', category: 'search' },
  { key: 'session.timeout_minutes', value: '30', type: 'number', category: 'security' },
  { key: 'login.max_attempts', value: '5', type: 'number', category: 'security' },
  { key: 'login.lock_minutes', value: '15', type: 'number', category: 'security' },
]

async function main() {
  console.log('🌱 Seeding Yemeni Legislation Platform...')

  // 1. Types
  for (const t of TYPES) {
    await db.legislationType.upsert({
      where: { code: t.code },
      update: { nameAr: t.nameAr, nameEn: t.nameEn },
      create: { code: t.code, nameAr: t.nameAr, nameEn: t.nameEn },
    })
  }
  console.log(`✓ Created ${TYPES.length} legislation types`)

  // 2. Authorities
  for (const a of AUTHORITIES) {
    await db.issuingAuthority.upsert({
      where: { code: a.code },
      update: { nameAr: a.nameAr, nameEn: a.nameEn },
      create: { code: a.code, nameAr: a.nameAr, nameEn: a.nameEn },
    })
  }
  console.log(`✓ Created ${AUTHORITIES.length} issuing authorities`)

  // 3. Subjects (with hierarchy)
  for (const s of SUBJECTS) {
    let parentId: string | undefined
    if (s.parentCode) {
      const parent = await db.subject.findUnique({ where: { code: s.parentCode } })
      if (parent) parentId = parent.id
    }
    await db.subject.upsert({
      where: { code: s.code },
      update: { nameAr: s.nameAr, parentSubjectId: parentId },
      create: { code: s.code, nameAr: s.nameAr, parentSubjectId: parentId },
    })
  }
  console.log(`✓ Created ${SUBJECTS.length} subjects`)

  // 4. Classifications
  for (const c of CLASSIFICATIONS) {
    await db.classification.upsert({
      where: { code: c.code },
      update: { nameAr: c.nameAr },
      create: { code: c.code, nameAr: c.nameAr },
    })
  }
  console.log(`✓ Created ${CLASSIFICATIONS.length} classifications`)

  // 5. Permissions
  const PERM_MATRIX = [
    { resource: 'legislation', actions: ['view', 'create', 'edit', 'delete', 'review', 'publish', 'archive', 'export'] },
    { resource: 'article', actions: ['view', 'create', 'edit', 'delete', 'review', 'reset', 'publish'] },
    { resource: 'attachment', actions: ['view', 'create', 'edit', 'delete', 'review', 'reset', 'publish'] },
    { resource: 'amendment', actions: ['view', 'create', 'edit', 'review', 'apply', 'reject'] },
    { resource: 'relation', actions: ['view', 'create', 'edit', 'review', 'publish', 'reject'] },
    { resource: 'source', actions: ['view', 'upload', 'verify', 'delete', 'download'] },
    { resource: 'user', actions: ['view', 'create', 'edit', 'activate', 'delete', 'reset'] },
    { resource: 'role', actions: ['view', 'create', 'edit', 'assign', 'delete'] },
    { resource: 'policy', actions: ['view', 'toggle', 'manage_exceptions'] },
    { resource: 'import', actions: ['view', 'upload', 'review', 'apply', 'cancel'] },
    { resource: 'recycle_bin', actions: ['view', 'restore', 'destroy'] },
    { resource: 'audit_log', actions: ['view'] },
    { resource: 'settings', actions: ['view', 'edit'] },
  ]
  let permCount = 0
  for (const m of PERM_MATRIX) {
    for (const action of m.actions) {
      const code = `${m.resource}.${action}`
      await db.permission.upsert({
        where: { code },
        update: { resource: m.resource, action, description: `${action} ${m.resource}` },
        create: { code, resource: m.resource, action, description: `${action} ${m.resource}` },
      })
      permCount++
    }
  }
  console.log(`✓ Created ${permCount} permissions`)

  // 6. Roles
  for (const r of ROLES) {
    await db.role.upsert({
      where: { code: r.code },
      update: { nameAr: r.nameAr, powerLevel: r.powerLevel, isSystem: r.isSystem, isProtected: r.isProtected || false },
      create: { code: r.code, nameAr: r.nameAr, powerLevel: r.powerLevel, isSystem: r.isSystem, isProtected: r.isProtected || false },
    })
  }
  console.log(`✓ Created ${ROLES.length} roles`)

  // 7. Users
  for (const u of USERS) {
    const passwordHash = await hashPassword(u.password)
    const user = await db.user.upsert({
      where: { username: u.username },
      update: { email: u.email, fullName: u.fullName, passwordHash },
      create: { username: u.username, email: u.email, fullName: u.fullName, passwordHash, isActive: true },
    })
    for (const roleCode of u.roleCodes) {
      const role = await db.role.findUnique({ where: { code: roleCode } })
      if (role) {
        await db.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId: role.id } },
          update: {},
          create: { userId: user.id, roleId: role.id },
        })
      }
    }
  }
  console.log(`✓ Created ${USERS.length} demo users`)

  // 8. Policies
  for (const p of POLICIES) {
    await db.operationPolicy.upsert({
      where: { code: p.code },
      update: { nameAr: p.nameAr, description: p.description, category: p.category },
      create: { code: p.code, nameAr: p.nameAr, description: p.description, category: p.category, isActive: true },
    })
  }
  console.log(`✓ Created ${POLICIES.length} operation policies`)

  // 9. Platform settings
  for (const s of PLATFORM_SETTINGS) {
    await db.platformSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, type: s.type, category: s.category },
      create: { key: s.key, value: s.value, type: s.type, category: s.category },
    })
  }
  console.log(`✓ Created ${PLATFORM_SETTINGS.length} platform settings`)

  // 10. Nav items
  for (const n of NAV_ITEMS) {
    const existing = await db.navItem.findFirst({ where: { target: n.target, position: n.position } })
    if (!existing) {
      await db.navItem.create({ data: { label: n.label, target: n.target, position: n.position, sortOrder: n.sortOrder, isVisible: true } })
    }
  }
  console.log(`✓ Created ${NAV_ITEMS.length} nav items`)

  // 11. Legislations
  let legCount = 0
  const legMap: Record<string, string> = {}
  for (const leg of LEGISLATIONS) {
    const type = await db.legislationType.findUnique({ where: { code: leg.typeCode } })
    const auth = await db.issuingAuthority.findUnique({ where: { code: leg.authorityCode } })
    if (!type || !auth) continue

    const existing = await db.legislation.findUnique({ where: { slug: leg.slug } })
    if (existing) {
      legMap[leg.slug] = existing.id
      continue
    }

    const created = await db.legislation.create({
      data: {
        slug: leg.slug,
        officialTitle: leg.officialTitle,
        shortTitle: leg.shortTitle || leg.officialTitle,
        typeId: type.id,
        number: leg.number,
        year: leg.year,
        authorityId: auth.id,
        issueDate: leg.issueDate ? new Date(leg.issueDate) : null,
        publicationDate: leg.publicationDate ? new Date(leg.publicationDate) : null,
        effectiveDate: leg.effectiveDate ? new Date(leg.effectiveDate) : null,
        registryDate: new Date(),
        legalStatus: leg.legalStatus,
        workflowStatus: leg.workflowStatus,
        verificationLevel: leg.verificationLevel,
        preamble: leg.preamble,
        isPreamble: !!leg.preamble,
        hasAmendments: leg.hasAmendments,
      },
    })
    legMap[leg.slug] = created.id

    // Link subjects
    for (const subjCode of leg.subjects) {
      const subj = await db.subject.findUnique({ where: { code: subjCode } })
      if (subj) {
        await db.legislationSubject.create({
          data: { legislationId: created.id, subjectId: subj.id },
        }).catch(() => {})
      }
    }
    // Link classifications
    for (const classCode of leg.classifications) {
      const cls = await db.classification.findUnique({ where: { code: classCode } })
      if (cls) {
        await db.legislationClassification.create({
          data: { legislationId: created.id, classificationId: cls.id },
        }).catch(() => {})
      }
    }
    legCount++
  }
  console.log(`✓ Created ${legCount} legislations`)

  // 12. Articles
  let articleCount = 0
  for (const [slug, articles] of Object.entries(ARTICLES)) {
    const legId = legMap[slug]
    if (!legId) continue
    for (let i = 0; i < articles.length; i++) {
      const a = articles[i] as { num: string; title: string; text: string }
      const existing = await db.article.findFirst({
        where: { legislationId: legId, publishedNumber: a.num },
      })
      if (existing) continue
      const art = await db.article.create({
        data: {
          legislationId: legId,
          publishedNumber: a.num,
          sortOrder: i + 1,
        },
      })
      await db.articleVersion.create({
        data: {
          articleId: art.id,
          versionNo: 1,
          textContent: `${a.title ? `**${a.title}** — ` : ''}${a.text}`,
          rawText: a.text,
          effectiveFrom: new Date(LEGISLATIONS.find(l => l.slug === slug)!.effectiveDate || '1990-01-01'),
          changeType: 'initial',
          isCurrent: true,
        },
      })
      articleCount++
    }
  }
  console.log(`✓ Created ${articleCount} articles`)

  // 13. Attachments
  let attachCount = 0
  for (const [slug, atts] of Object.entries(ATTACHMENTS)) {
    const legId = legMap[slug]
    if (!legId) continue
    for (let i = 0; i < atts.length; i++) {
      const att = atts[i] as any
      const existing = await db.attachment.findFirst({
        where: { legislationId: legId, title: att.title },
      })
      if (existing) continue
      await db.attachment.create({
        data: {
          legislationId: legId,
          title: att.title,
          attachmentType: att.type,
          contentType: att.contentType,
          status: att.status || 'draft',
          textContent: att.text || null,
          tableContent: att.tableContent || null,
          sortOrder: i + 1,
        },
      })
      attachCount++
    }
  }
  console.log(`✓ Created ${attachCount} attachments`)

  // 14. Relations
  let relCount = 0
  for (const r of RELATIONS) {
    const fromId = legMap[r.from]
    const toId = legMap[r.to]
    if (!fromId || !toId) continue
    const existing = await db.relation.findFirst({
      where: { fromLegislationId: fromId, toLegislationId: toId, relationType: r.type },
    })
    if (existing) continue
    await db.relation.create({
      data: {
        fromLegislationId: fromId,
        toLegislationId: toId,
        relationType: r.type,
        status: r.status,
      },
    })
    relCount++
  }
  console.log(`✓ Created ${relCount} relations`)

  // 15. Amendments
  let amendCount = 0
  for (const amd of AMENDMENTS) {
    const targetId = legMap[amd.targetSlug]
    if (!targetId) continue
    const existing = await db.amendmentDocument.findUnique({ where: { slug: amd.slug } })
    if (existing) continue

    const doc = await db.amendmentDocument.create({
      data: {
        slug: amd.slug,
        title: amd.title,
        number: amd.number,
        year: amd.year,
        targetLegislationId: targetId,
        operationCount: amd.operations.length,
        status: amd.status,
        issueDate: amd.issueDate ? new Date(amd.issueDate) : null,
        effectiveDate: amd.effectiveDate ? new Date(amd.effectiveDate) : null,
        description: amd.description,
      },
    })

    for (let i = 0; i < amd.operations.length; i++) {
      const op = amd.operations[i]
      let targetArticleId: string | undefined
      if (op.articleNum) {
        const article = await db.article.findFirst({
          where: { legislationId: targetId, publishedNumber: op.articleNum },
        })
        if (article) targetArticleId = article.id
      }
      await db.amendmentOperation.create({
        data: {
          documentId: doc.id,
          operationType: op.type,
          targetArticleId: targetArticleId || null,
          sortOrder: i + 1,
          oldText: 'oldText' in op ? op.oldText : null,
          newText: op.newText,
          newArticleNumber: 'newArticleNum' in op ? op.newArticleNum : null,
          effectDate: amd.effectiveDate ? new Date(amd.effectiveDate) : null,
          applied: amd.status === 'applied',
        },
      })
    }
    amendCount++
  }
  console.log(`✓ Created ${amendCount} amendment documents`)

  // 16. News
  for (const n of NEWS_ARTICLES) {
    const existing = await db.newsArticle.findUnique({ where: { slug: n.slug } })
    if (existing) continue
    await db.newsArticle.create({
      data: {
        slug: n.slug,
        title: n.title,
        summary: n.summary,
        body: n.body,
        publishedAt: n.publishedAt ? new Date(n.publishedAt) : null,
        status: n.status,
      },
    })
  }
  console.log(`✓ Created ${NEWS_ARTICLES.length} news articles`)

  // 17. Public pages
  for (const p of PUBLIC_PAGES) {
    const existing = await db.publicPage.findUnique({ where: { slug: p.slug } })
    if (existing) {
      // Delete old sections and recreate
      await db.publicPageSection.deleteMany({ where: { pageId: existing.id } })
      await db.publicPage.update({
        where: { id: existing.id },
        data: { title: p.title, intro: p.intro, content: p.content, status: p.status },
      })
      for (let i = 0; i < p.sections.length; i++) {
        const sec = p.sections[i]
        await db.publicPageSection.create({
          data: {
            pageId: existing.id,
            title: sec.title,
            body: sec.body,
            sortOrder: i + 1,
          },
        })
      }
      continue
    }
    const page = await db.publicPage.create({
      data: {
        slug: p.slug,
        title: p.title,
        intro: p.intro,
        content: p.content,
        status: p.status,
      },
    })
    for (let i = 0; i < p.sections.length; i++) {
      const sec = p.sections[i]
      await db.publicPageSection.create({
        data: {
          pageId: page.id,
          title: sec.title,
          body: sec.body,
          sortOrder: i + 1,
        },
      })
    }
  }
  console.log(`✓ Created ${PUBLIC_PAGES.length} public pages`)

  // 18. Audit log entries
  const adminUser = await db.user.findUnique({ where: { username: 'admin' } })
  if (adminUser) {
    await db.auditLog.createMany({
      data: [
        { userId: adminUser.id, action: 'create', resource: 'legislation', resourceId: legMap['constitution-2001'], operation: 'seed', reason: 'seed_data', ipAddress: '127.0.0.1' },
        { userId: adminUser.id, action: 'publish', resource: 'legislation', resourceId: legMap['labor-law-1995'], operation: 'seed', reason: 'seed_data', ipAddress: '127.0.0.1' },
        { userId: adminUser.id, action: 'create', resource: 'role', operation: 'seed', reason: 'seed_data', ipAddress: '127.0.0.1' },
      ],
    })
  }

  console.log('🌱 Seeding completed successfully!')
  console.log(`   • ${LEGISLATIONS.length} legislations`)
  console.log(`   • ${Object.values(ARTICLES).reduce((s, l) => s + l.length, 0)} articles`)
  console.log(`   • ${Object.values(ATTACHMENTS).reduce((s, l) => s + l.length, 0)} attachments`)
  console.log(`   • ${RELATIONS.length} relations`)
  console.log(`   • ${AMENDMENTS.length} amendment documents`)
  console.log(`   • ${USERS.length} demo users`)
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
