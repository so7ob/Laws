<div align="center">

# منصة التشريعات اليمنية

### Yemeni Legislation Platform

[![CI](https://github.com/so7ob/Laws/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/so7ob/Laws/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-burgundy.svg)](LICENSE)

منصة وطنية متكاملة لإدارة التشريعات اليمنية وعرضها والبحث فيها،
مع دعم النسخ الزمنية والتعديلات والملاحق والعلاقات القانونية.

</div>

---

## 📋 نظرة عامة

منصة تشريعية متكاملة تتيح للقارئ الوصول إلى التشريعات اليمنية وقراءة موادها،
وتحديد النص النافذ في تاريخ معين، ورؤية النصوص السابقة والتعديلات والملاحق
والعلاقات ومصادرها. كما تتيح للفريق الإداري إدخال المحتوى واستيراده ومراجعته
واعتماده ونشره وتصحيحه وإدارة حالته وصلاحياته دون فقد التاريخ.

### المميزات الرئيسية

| المجال | الوصف |
|--------|------|
| 🏠 واجهة عامة | رئيسية، قوائم تشريعات، تفاصيل بتبويبات، بحث متقدم، أخبار، معجم مصطلحات، أسئلة شائعة، إحصاءات، خط زمني |
| 🛡️ لوحة إدارة | 13 قسم: تشريعات، تعديلات، تصحيحات، استيراد، سلة حذف، تقارير، تدقيق، سياسات، قاموس مرادفات، مستخدمون، أدوار، إعدادات |
| 📜 النسخ الزمنية | نص نافذ في تاريخ محدد، نسخ سابقة ومقارنة، تعديل مستقبلي |
| 🔍 البحث العربي | حرفي/كل/أي، فلاتر وتجميعات، مقتطفات وروابط مواضع، تصدير CSV |
| 🎨 الهوية البصرية | ألوان خمري `#AC4459` وكحلي `#344B61`، خط Cairo، نمط هندسي متحرك |
| 🌗 الوضع الداكن | تبديل فوري بين المظهرين الفاتح والداكن |
| ⌨️ اختصارات | 13 اختصار لوحة مفاتيح للتنقل السريع |

---

## 🔧 التقنيات المستخدمة

| التقنية | الإصدار | الاستخدام |
|---------|---------|----------|
| [Next.js](https://nextjs.org) | 16.1+ | إطار الواجهة والخادم (App Router) |
| [TypeScript](https://www.typescriptlang.org) | 5 | لغة البرمجة |
| [Prisma](https://www.prisma.io) | 6.19+ | ORM وقاعدة البيانات |
| [SQLite](https://www.sqlite.org) | — | قاعدة البيانات |
| [Tailwind CSS](https://tailwindcss.com) | 4 | تنسيق الواجهة |
| [shadcn/ui](https://ui.shadcn.com) | — | مكتبة المكونات |
| [Bun](https://bun.sh) | — | مدير الحزم ووقتشغيل JavaScript |
| [Zustand](https://github.com/pmndrs/zustand) | 5 | إدارة حالة العميل |
| [Cairo](https://fonts.google.com/cairo) | — | الخط العربي |

---

## 📁 هيكل المشروع

```
.
├── prisma/
│   ├── schema.prisma          # مخطط قاعدة البيانات
│   └── seed/                   # بيانات تجريبية
│       ├── index.ts            # 23 تشريع يمني
│       ├── account-data.ts     # مفضلات وبحوث وملاحظات
│       ├── admin-data.ts       # تقارير وسجلات تدقيق واستيرادات
│       ├── article-versions.ts # نسخ متعددة للمواد
│       └── dict-corrections.ts # قاموس مرادفات ومسودات تصحيح
├── src/
│   ├── app/
│   │   ├── api/                # مسارات API (REST)
│   │   ├── globals.css         # الأنماط العامة + RTL + حركات
│   │   ├── layout.tsx          # التخطيط الجذري (RTL + Cairo)
│   │   └── page.tsx            # الصفحة الوحيدة (موجه العروض)
│   ├── components/
│   │   ├── admin/              # 13 قسم إداري
│   │   ├── common/             # ترويسة، تذييل، مسار تنقل، اختصارات
│   │   └── public/             # 20+ عرض عام
│   ├── lib/
│   │   ├── auth.ts             # تجزئة كلمات المرور
│   │   ├── constants.ts        # ثوابت وتنسيقات
│   │   ├── csv-export.ts       # تصدير CSV
│   │   ├── db.ts               # عميل Prisma
│   │   ├── diff.ts            # مقارنة كلمية للنصوص
│   │   ├── search-suggest.ts  # اقتراحات "هل تقصد؟"
│   │   └── citation.ts        # مولّد استشهادات قانونية
│   └── store/
│       └── app-store.ts        # حالة Zustand (التنقل الداخلي)
├── public/
│   ├── banner-pattern.png     # النمط الهندسي المتحرك
│   └── logo.svg               # الشعار
├── .github/
│   ├── workflows/
│   │   ├── ci.yml             # فحوص: Lint + Build + Type Check
│   │   └── issue-policy.yml   # فحص أسماء الفروع والقضايا
│   ├── ISSUE_TEMPLATE/        # قوالب: Bug + Feature
│   └── pull_request_template.md
├── docs/
│   ├── DEVELOPMENT_WORKFLOW.md # دورة العمل التفصيلية
│   ├── REPOSITORY_IMPORT.md    # سجل الرفع
│   └── audit/                  # مصفوفة المتطلبات والأدلة
├── AGENTS.md                   # تعليمات وكلاء التطوير
├── CONTRIBUTING.md             # دليل المساهمين
└── .env.example                # متغيرات البيئة النموذجية
```

---

## ✅ المتطلبات المسبقة

### النظام الأساسي: Debian 12 (Bookworm)

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# أدوات أساسية
sudo apt install -y curl wget git build-essential python3
```

### Node.js ≥ 20

```bash
# عبر NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# تحقق
node --version  # يجب أن يكون ≥ 20.x
```

### Bun

```bash
# تثبيت Bun
curl -fsSL https://bun.sh/install | bash

# أضف للمسار (أعد تشغيل الطرفية أو)
source ~/.bashrc

# تحقق
bun --version
```

### إضافات اختيارية

| الأداة | الغرض | التثبيت |
|--------|------|---------|
| `gh` (GitHub CLI) | إدارة Issues وPRs | `sudo apt install gh` |
| `jq` | معالجة JSON | `sudo apt install jq` |
| `make` | أتمتة | `sudo apt install make` |

---

## 🚀 الإعداد والتشغيل في التطوير

### 1. استنساخ المستودع

```bash
git clone https://github.com/so7ob/Laws.git
cd Laws
git checkout develop
```

### 2. تثبيت الاعتماديات

```bash
bun install
```

### 3. إعداد متغيرات البيئة

```bash
cp .env.example .env
```

عدّل ملف `.env`:

```env
# مسار قاعدة بيانات SQLite
DATABASE_URL="file:./db/custom.db"

# NextAuth (للتطوير المحلي)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-in-production"
```

### 4. إعداد قاعدة البيانات

```bash
# توليد عميل Prisma
bun run db:generate

# دفع المخطط إلى قاعدة البيانات
bun run db:push
```

### 5. بذر البيانات التجريبية

```bash
bun run seed
```

هذا سينشئ:
- ✅ 23 تشريعًا يمنيًا مع مواد ونسخ وملاحق وعلاقات
- ✅ 6 مستخدمين تجريبيين بأدوار مختلفة
- ✅ 4 أخبار و6 صفحات عامة
- ✅ 14 سياسة عمليات و30 مدخل قاموس مرادفات
- ✅ مفضلات وبحوث وملاحظات ومشاركات تجريبية
- ✅ نسخ متعددة للمواد (تعديل ومستقبلية)
- ✅ تقارير جودة وسجلات تدقيق وعمليات استيراد

### 6. تشغيل خادم التطوير

```bash
bun run dev
```

افتح المتصفح على `http://localhost:3000`

> **ملاحظة:** خادم التطوير يستهلك ذاكرة عالية مع Turbopack. استخدم:
> ```bash
> NODE_OPTIONS="--max-old-space-size=1536" bun run dev
> ```

---

## 📟 الأوامر الموحدة

| الأمر | الوصف |
|-------|------|
| `bun run dev` | تشغيل خادم التطوير (منفذ 3000) |
| `bun run build` | بناء الإنتاج |
| `bun run start` | تشغيل خادم الإنتاج |
| `bun run lint` | فحص الكود (ESLint) |
| `bun run db:push` | دفع مخطط قاعدة البيانات |
| `bun run db:generate` | توليد عميل Prisma |
| `bun run db:migrate` | إنشاء ترحيل جديد |
| `bun run db:reset` | إعادة تعيين قاعدة البيانات |
| `bun run seed` | بذر البيانات التجريبية |

---

## 🧪 فحوص CI/CD

يُشغّل GitHub Actions تلقائيًا عند رفع فروع أو فتح PR إلى `develop`:

### CI Workflow (`.github/workflows/ci.yml`)

| الفحص | الوصف |
|-------|------|
| **Lint** | ESLint على كامل المشروع |
| **Type Check** | `tsc --noEmit` للتحقق من الأنواع |
| **Build** | `next build` للتأكد من نجاح البناء |

### Issue & Branch Policy (`.github/workflows/issue-policy.yml`)

- ✅ اسم الفرع يطابق `type/NNN-description`
- ✅ رقم القضية موجود فعليًا في المستودع
- ✅ وجهة PR هي `develop`

---

## 🔐 حسابات العرض التجريبية

| المستخدم | كلمة المرور | الدور |
|----------|-------------|------|
| `reader` | `Demo1234!` | قارئ / باحث |
| `data.entry` | `Demo1234!` | مُدخل بيانات |
| `reviewer` | `Demo1234!` | مُراجع قانوني |
| `content.mgr` | `Demo1234!` | مدير محتوى |
| `admin` | `Demo1234!` | مدير نظام |
| `super` | `Demo1234!` | مدير أعلى |

> ⚠️ **تحذير:** هذه حسابات تجريبية لأغراض العرض فقط. لا تستخدمها في الإنتاج.

---

## 🎨 الهوية البصرية

| العنصر | القيمة |
|--------|--------|
| اللون الأساسي (الخمري) | `#AC4459` |
| اللون الثانوي (الكحلي) | `#344B61` |
| الخلفية | `#fbf7f5` (فاتح) / `#1a1614` (داكن) |
| الخط | Cairo (عربي) |
| الاتجاه | RTL (من اليمين لليسار) |
| النمط المتحرك | `banner-pattern.png` بحركة 3D دورانية |

---

## 📚 الوثائق

| الملف | المحتوى |
|------|---------|
| [AGENTS.md](AGENTS.md) | تعليمات ملزمة لوكلاء التطوير |
| [CONTRIBUTING.md](CONTRIBUTING.md) | دليل المساهمين |
| [docs/DEVELOPMENT_WORKFLOW.md](docs/DEVELOPMENT_WORKFLOW.md) | دورة العمل التفصيلية |
| [docs/REPOSITORY_IMPORT.md](docs/REPOSITORY_IMPORT.md) | سجل الرفع والاستبعادات |
| [docs/audit/requirements.csv](docs/audit/requirements.csv) | مصفوفة المتطلبات (40 متطلب) |

---

## 🔄 دورة التطوير

هذا المشروع يتبع منهجية GitHub متكاملة:

```
Issue ← فرع من develop ← تطوير ← فحص محلي ← Push ← PR ← فحوص CI ← دمج ← إغلاق
```

اقرأ [AGENTS.md](AGENTS.md) و[CONTRIBUTING.md](CONTRIBUTING.md) للتفاصيل.

---

## 📦 الإنتاج (التشغيل المباشر على Debian 12)

```bash
# بناء الإنتاج
bun run build

# تشغيل خادم الإنتاج
bun run start

# أو مع إعدادات إنتاج
NODE_ENV=production bun run start
```

### إعداد Nginx (اختياري)

```nginx
server {
    listen 80;
    server_name legislation.ye;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### خدمة systemd (اختياري)

```ini
# /etc/systemd/system/legislation.service
[Unit]
Description=Yemeni Legislation Platform
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/legislation
ExecStart=/usr/bin/bun run start
Restart=on-failure
Environment=NODE_ENV=production
Environment=DATABASE_URL=file:/opt/legislation/db/custom.db

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable legislation
sudo systemctl start legislation
```

---

## 🗄️ النسخ الاحتياطي والاستعادة

```bash
# نسخة احتياطية لقاعدة البيانات
cp db/custom.db "backups/custom-$(date +%Y%m%d).db"

# نسخة احتياطية للملفات
tar -czf "backups/files-$(date +%Y%m%d).tar.gz" public/ uploads/

# استعادة
cp backups/custom-20260101.db db/custom.db
bun run db:generate
```

---

## ⚠️ القيود المعروفة

| القيد | الوصف | الحل البديل |
|-------|------|------------|
| SQLite بدلاً من MariaDB | المواصفات الأصلية طلبت MariaDB | يمكن الترحيل عبر تعديل `schema.prisma` |
| Next.js بدلاً من Vite+NestJS | البيئة المتاحة تدعم Next.js فقط | الواجهة والخادم في تطبيق واحد |
| لا عامل مستقل | لا يوجد عامل Node منفصل للاستخراج | المعالجة متزامنة حاليًا |
| لا مصادقة فعلية | الحسابات تجريبية بدون NextAuth | الإدارة متاحة مباشرة للعرض |
| لا OCR عربي | Tesseract غير مثبت في البيئة | الاستخراج يدوي حاليًا |

---

## 📄 الرخصة

هذا المشروع مرخص تحت [MIT License](LICENSE).

---

<div align="center">

**منصة التشريعات اليمنية** — مرجعيتك القانونية الموثوقة

[GitHub](https://github.com/so7ob/Laws) · [Develop](https://github.com/so7ob/Laws/tree/develop) · [Issues](https://github.com/so7ob/Laws/issues)

</div>
