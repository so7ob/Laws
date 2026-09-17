# AGENTS.md — تعليمات ملزمة لوكلاء التطوير

> **هذا الملف ملزم.** قبل أي تغيير تطويري، اقرأ هذا الملف و`docs/DEVELOPMENT_WORKFLOW.md` والتعليمات المنطبقة على الملفات التي تعدّلها.

## دورة العمل الافتراضية الدائمة

هذه دورة العمل الافتراضية الدائمة لهذا المشروع. اتبعها عند كل طلب تطوير جديد دون انتظار تذكير المستخدم.

1. **اقرأ المنهجية**: ابدأ بقراءة `AGENTS.md` و`docs/DEVELOPMENT_WORKFLOW.md` و`CONTRIBUTING.md`.
2. **استعد حالة العمل**: راجع Issues وPRs المفتوحة والفروع النشطة. لا تنشئ قضية أو فرعًا مكررًا.
3. **Issue أولًا**: ابحث عن قضية قائمة أو أنشئ قضية جديدة قبل أي تغيير شفرة.
4. **فرع للقضية**: أنشئ فرعًا من أحدث `origin/develop` بالصيغة `type/NNN-description` حيث NNN رقم القضية.
5. **طوّر محليًا**: نفّذ معايير القبول، أضف اختبارات سلوك للحالات المهمة.
6. **افحص محليًا**: شغّل `bun run lint` والفحوص المناسبة قبل الرفع.
7. **ارفع الفرع**: `git push -u origin type/NNN-description`.
8. **افتح PR**: من فرع القضية إلى `develop`، مع رابط القضية وملخص التغييرات.
9. **انتظر فحوص GitHub Actions**: تأكد من نجاحها للنسخة الحالية لا لرقم سابق.
10. **ادمج في develop**: عند استيفاء جميع شروط الدمج (الفحوص، لا تعارض، المراجعات).
11. **تحقق من الدمج**: أكد وجود نتيجة الدمج في `origin/develop`.
12. **أغلق القضية**: بعد التحقق من النجاح، أغلق القضية بدليل.

## القواعد الأساسية

- **لا تطوّر مباشرة على `develop` أو `main`.**
- **لا تستخدم `push --force` أو `reset --hard` أو `clean -fd`.**
- **لا ترفع أسرارًا أو ملفات بيئة فعلية.** استخدم `.env.example`.
- **لا تدّعي نجاح اختبار لم تُنفذه أو تجاهلت فشله.**
- **لا تخلط تغييرات غير مرتبطة بالقضية دون مراجعة.**
- **اربط كل PR بقضيته، وتحقق من إغلاق القضية بعد الدمج.**

## أسماء الفروع

```
feat/NNN-feature-name       # ميزة جديدة
fix/NNN-bug-description     # إصلاح خطأ
refactor/NNN-description    # إعادة هيكلة
docs/NNN-description        # توثيق
test/NNN-description        # اختبارات
chore/NNN-description       # صيانة
ci/NNN-description          # إعدادات CI/CD
```

## رسائل Commits

```
feat(scope): description (#NNN)
fix(scope): description (#NNN)
docs(scope): description (#NNN)
```

## التقنية

- Framework: Next.js 16 + TypeScript
- Database: Prisma + SQLite
- UI: Tailwind CSS 4 + shadcn/ui
- Language: Arabic RTL (Cairo font)
- Package Manager: bun

## الأوامر

```bash
bun run dev      # تشغيل خادم التطوير
bun run lint     # فحص الكود
bun run db:push  # دفع مخطط قاعدة البيانات
bun run seed     # بذر البيانات التجريبية
```

## ملاحظة

في بداية جلسة جديدة أو بعد انقطاع، استعد حالة العمل من الملفات ومن Issues والفروع وPRs المفتوحة. لا تعتمد على ذاكرة المحادثة وحدها.
