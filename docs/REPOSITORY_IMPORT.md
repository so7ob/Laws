# Repository Import — منصة التشريعات اليمنية

## المكونات المرفوعة

| المكوّن | المسار | الحالة |
|--------|--------|-------|
| الواجهة (Next.js) | `src/app/`, `src/components/` | مرفوع |
| API | `src/app/api/` | مرفوع |
| قاعدة البيانات | `prisma/schema.prisma` | مرفوع |
| البيانات التجريبية | `prisma/seed/` | مرفوع |
| الأصول | `public/` | مرفوع |
| الإعدادات | `.env.example` | مرفوع |
| المنهجية | `AGENTS.md`, `docs/`, `.github/` | مرفوع |

## الاستبعادات وأسبابها

| الملف | السبب |
|-------|-------|
| `node_modules/` | يمكن إعادة التثبيت من `bun.lock` |
| `.env` | يحتوي مسارات بيئة محلية |
| `db/custom.db` | يمكن إنشاؤه عبر `bun run db:push && bun run seed` |
| `.next/` | مخرجات بناء قابلة لإعادة الإنتاج |
| `*.log` | سجلات مؤقتة |
| `upload/` | ملفات مستخدم |
| `download/*.png` | لقطات تطوير |
| `agent-ctx/` | سياق وكلاء التطوير |

## إعداد نسخة جديدة

```bash
git clone https://github.com/so7ob/Laws.git
cd Laws
git checkout develop
bun install
cp .env.example .env
# عدّل DATABASE_URL في .env
bun run db:push
bun run seed
bun run dev
```

## الاعتماديات الخارجية

- **Node.js** ≥ 20
- **Bun** (package manager)
- **Prisma** (ORM + SQLite)
