# Copilot Instructions — منصة التشريعات اليمنية

> اقرأ `AGENTS.md` و`docs/DEVELOPMENT_WORKFLOW.md` للمرجع الكامل.

## قواعد مختصرة

1. **Issue أولًا** قبل أي تغيير شفرة.
2. **فرع من develop**: `type/NNN-description`.
3. **لا تطوّر على develop أو main**.
4. **افحص محليًا**: `bun run lint`.
5. **PR إلى develop** مع رابط القضية.
6. **ادمج بعد نجاح الفحوص**.
7. **أغلق القضية** بعد التحقق.

## التقنية

- Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui
- Prisma + SQLite
- Arabic RTL, Cairo font
- Palette: burgundy #AC4459 + navy #344B61
