# Contributing — منصة التشريعات اليمنية

> اقرأ `docs/DEVELOPMENT_WORKFLOW.md` للمرجع التفصيلي.

## البدء السريع

```bash
# 1. استنسخ المستودع
git clone https://github.com/so7ob/Laws.git
cd Laws

# 2. انتقل إلى develop
git checkout develop
git pull origin develop

# 3. ثبّت الاعتماديات
bun install

# 4. انسخ ملف البيئة
cp .env.example .env
# عدّل DATABASE_URL حسب بيئتك

# 5. دفع قاعدة البيانات
bun run db:push

# 6. ابذر البيانات التجريبية
bun run seed

# 7. شغّل خادم التطوير
bun run dev
```

## دورة العمل

1. ابحث عن Issue أو أنشئ واحدة.
2. أنشئ فرعًا: `git checkout -b feat/NNN-description` (من develop).
3. طوّر واختبر محليًا.
4. ارفع: `git push -u origin feat/NNN-description`.
5. افتح PR إلى `develop`.
6. انتظر فحوص GitHub Actions.
7. ادمج بعد استيفاء الشروط.

## أسماء الفروع

| النوع | الصيغة | مثال |
|------|--------|------|
| ميزة | `feat/NNN-name` | `feat/123-search-enhancement` |
| إصلاح | `fix/NNN-name` | `fix/124-hydration-warning` |
| توثيق | `docs/NNN-name` | `docs/125-installation-guide` |
| صيانة | `chore/NNN-name` | `chore/126-dependency-update` |

## رسائل Commits

```
feat(scope): وصف مختصر (#NNN)
fix(scope): وصف مختصر (#NNN)
docs(scope): وصف مختصر (#NNN)
```

## الفحوص

```bash
bun run lint        # فحص الكود
bun run db:push     # توافق قاعدة البيانات
bun run dev         # التشغيل
```

## معايير قبول PR

- [ ] Issue مرتبطة وم معايير قبولها منفذة.
- [ ] فرع الوجهة هو `develop`.
- [ ] فحوص GitHub Actions نجحت.
- [ ] لا تعارض دمج.
- [ ] لا أسرار أو ملفات بيئة.
- [ ] اختبارات سلوكية للحالات المهمة.
- [ ] رسائل commits واضحة برقم القضية.
