# Worklog - منصة التشريعات اليمنية (Yemeni Legislation Platform)

## Project Overview
- Next.js 16 with App Router (single `/` route, internal Zustand state navigation)
- Prisma + SQLite
- shadcn/ui components
- RTL Arabic with Cairo font
- Color palette: burgundy #AC4459 + navy #344B61

---

## Phase 12 Status (Bug Fixes from Interactive Review - IN PROGRESS)

### Current Assessment
Based on interactive review dated 17 September 2026, the following issues were identified and fixes were applied:

### Fixes Completed

#### F01 (P0) — Intermittent Runtime Crash / Dev Error Screen
- **Root cause 1**: CSS parsing errors in `globals.css` using invalid `var(--primary/10)` syntax (CSS custom properties don't support `/` division). This caused 500 errors on page load.
- **Root cause 2**: Missing `formatYear` import in `home-view.tsx` causing `ReferenceError` at runtime, crashing client-side rendering.
- **Fix**: 
  - Replaced all `var(--primary/N)` and `var(--secondary/N)` with `rgba(172, 68, 89, N/100)` and `rgba(52, 75, 97, N/100)`
  - Added `formatYear` import to `home-view.tsx` and `timeline-view.tsx`
- **Verification**: Server returns HTTP 200, page loads without "Application error" screen, no console errors

#### F02 (P1) — Button-in-Button Hydration Warning
- **Root cause**: `RecentlyViewed` component had a `<button>` (card) containing another `<button>` (remove), which is invalid HTML and causes React hydration warning.
- **Fix**: Changed outer `<button>` to `<div role="button" tabIndex={0}>` with `onKeyDown` handler for Enter/Space keys, proper `focus-visible` ring, and `aria-label` on remove button.
- **Verification**: No hydration warnings in console

#### F11 (P2) — Raw Markdown in Legal Text
- **Root cause**: Article text content stored with Markdown formatting (`**bold**`) displayed raw to users.
- **Fix**: Added `stripMarkdown()` function in `src/lib/constants.ts` that removes:
  - Bold markers: `**text**` → `text`
  - Italic markers: `*text*` → `text`
  - Headings: `###` → nothing
  - Links, images, code blocks, blockquotes, list markers
  - Applied to all `textContent` and `preamble` displays in legislation-detail-view.tsx
- **Verification**: 0 occurrences of `**` in rendered page

#### F13 (P3) — Year Formatting with Thousands Separator
- **Root cause**: Years formatted with `toLocaleString('ar-EG')` which adds Arabic thousands separator `٬` (e.g., `٢٬٠٠١` instead of `٢٠٠١`).
- **Fix**: Added `formatYear()` function with `useGrouping: false`, replaced all year formatting calls across 8 component files.
- **Verification**: Years display as `٢٠٠٩` (not `٢٬٠٠٩`)

### Remaining Issues (from F01-F14, not yet addressed)

#### F03 (P1) — Admin Operations Show "قريبًا"
- Add legislation form, amendment document form, and policy exceptions management need real implementation
- Currently show toast "قريبًا" instead of working forms

#### F04 (P1) — URL Stays at /
- No routing for legislation detail pages, share links point to home page
- Need URL-based routing or at least proper share links

#### F05 (P1) — Version History Dialog Missing Old Versions
- Article 5 shows only version 2 in the version dialog, but version 1 is accessible via date picker
- Need to show all versions in the dialog

#### F06 (P1) — Effective Date Mixed with Legislation Metadata
- Selecting a date for historical view changes the "effective date" field in the header
- Need to separate "view as of date" from legislation metadata

#### F07 (P2) — Amendment Count Inconsistency
- Header shows 0 amendments but amendments tab shows 1 document
- Count logic needs to be fixed

#### F08 (P1) — Attachment Download Not Working
- Download button for map attachment doesn't produce a file
- Need real file handling

#### F09 (P1) — "مُتحقق" Verification Level Inconsistent
- Shows "verified" but no sources are recorded
- Need to link verification to actual sources

#### F10 (P1) — Import File Types Incomplete
- Missing Markdown, XLSX, PNG, JPEG options
- Single file input doesn't support TXT+PDF combined

#### F12 (P2) — Untranslated UI Elements
- Calendar shows English month/day names
- Some dialog close buttons say "Close"
- Filter chips show internal format like `type: constitution`

#### F14 (P1) — Admin Access Without Authentication
- Admin panel accessible without login in demo mode
- Need to document demo vs production behavior

---

## Unresolved Issues / Risks
1. **Dev server memory**: ~2GB under load, causes intermittent crashes. Using `NODE_OPTIONS=--max-old-space-size=1536`.
2. **Original spec vs. stack adaptation**: Vite/NestJS/MariaDB → Next.js/Prisma/SQLite.
3. **Simplified features**: OCR, real auth, PDF.js viewer use mock data.
4. **Admin API security**: All admin endpoints are currently open.
5. **localStorage dependency**: Recently Viewed, Search History, Settings depend on localStorage.

## Priority Recommendations for Next Phase
1. Implement F03: Real admin forms for legislation, amendment, and policy exceptions
2. Implement F04: URL-based routing for shareable links
3. Implement F05+F06: Fix version history and effective date separation
4. Implement F07: Fix amendment count logic
5. Implement F08: Real file download for attachments
6. Implement F09: Link verification level to actual sources
7. Implement F10: Complete import file types
8. Implement F12: Arabic calendar and UI translation
9. Implement F14: Document demo mode and add authentication

---

Task ID: F14
Agent: main (session continuation)
Task: بوابة مصادقة للإدارة + توثيق الوضع التجريبي (F14)

Work Log:
- راجعت User model والبذرة: 6 مستخدمين تجريبيين بكلمات مرور bcrypt (Demo1234!).
- أنشأت GitHub Issue #21 «بوابة مصادقة للإدارة + توثيق الوضع التجريبي (F14)».
- أنشأت فرع fix/21-admin-auth-gate من develop ونفّذت:
  - src/lib/session.ts: مكتبة جلسة عديمة الحالة بتوقيع HMAC (Web Crypto API، Edge+Node متوافق).
    * createSessionCookieValue, verifySessionCookieValue (async), buildSessionCookieHeader, buildClearSessionCookieHeader.
    * كوكي HttpOnly + SameSite=Lax، Max-Age 7 أيام، Secure في الإنتاج.
  - POST /api/auth/login: يتحقق من بيانات الاعتماد عبر verifyPassword (bcrypt)، يبوّب على isActive/isLocked/lockedUntil، يضبط الكوكي.
  - POST /api/auth/logout: يمسح الكوكي.
  - GET /api/auth/me: يرجع المستخدم الحالي.
  - src/middleware.ts: يبوّب /api/admin/* خلف كوكي جلسة صالح، 401 JSON بدونه.
  - login-view.tsx: بوابة دخول كاملة الشاشة مع تعبئة سريعة للحسابات التجريبية.
  - home-view.tsx: زر «دخول لوحة الإدارة» يفحص /api/auth/me أولًا ويوجّه للدخول.
  - admin-shell TopBar: عرض اسم المستخدم + زر خروج.
  - تخزين authUser/authChecked في متجر التطبيق.
- واجهت عيبين في وقت التشغيل بعد الدمج الأول (PR #22):
  1. Edge runtime لا يدعم Node 'crypto' module → أعدت كتابة session.ts لـ Web Crypto API حصرًا.
  2. /api/auth/me كان يستدعي verifySessionCookieValue دون await → 500. أضفت await.
- أنشأت PR #23 لإصلاح العيبين، نجحت CI، دمجت (097d562).
- تحقق end-to-end بـ agent-browser:
  * زر «دخول لوحة الإدارة» → تظهر شاشة الدخول (لا وصول مباشر للإدارة).
  * تعبئة admin + Demo1234! → الدخول ناجح → لوحة الإدارة تظهر.
  * رأس الإدارة يعرض «مدير نظام تجريبي» + وسم demo.
  * زر «خروج» → يعود للرئيسية.
  * لا أخطاء console.
- تحقق API: 401 بلا كوكي، 200 للدخول، 200 للوحة، 200 لـ /me، 200 للخروج.

Stage Summary:
- الفجوة F14 (الإدارة متاحة بدون مصادقة) معالجة بالكامل.
- Issue #21 مغلقة، PR #22 + PR #23 مدموجان في develop (097d562).
- جميع مسارات /api/admin/* محمية خادمياً خلف كوكي جلسة موقّع.
- واجهة دخول + زر خروج + عرض المستخدم المصادق منفذة.
- مصفوفة المتطلبات: REQ-27-001 (جزء المصادقة والجلسات)، REQ-16-001 (جزء إنفاذ خادمي للـAPI)، REQ-01-004 (جزء الحوكمة).
- الخطوة التالية: F03 (نماذج إنشاء التشريع/التعديل) ثم F04 (روابط مستقرة).

---

Task ID: F03-part1
Agent: main (session continuation)
Task: تفعيل إنشاء التشريع من لوحة الإدارة (F03 / REQ-05-001)

Work Log:
- راجعت worklog.md و RESUME.md و GitHub: develop=8d6b2fc، 13/14 فجوة مصححة، F03 و F04 متبقيتان.
- حددت أن F03 يشمل 10 مواضع «قريبًا» في أقسام الإدارة. ركّزت على أهم تدفق: إنشاء التشريع (REQ-05-001).
- أنشأت GitHub Issue #26 «تفعيل إنشاء التشريع من لوحة الإدارة (F03 / REQ-05-001)».
- أنشأت فرع fix/26-legislation-creation من develop ونفّذت:
  - POST /api/admin/legislations: تحقق من الحقول المطلوبة، توليد slug تلقائي، رفض التكرار بـ409، تحقق المفاتيح الأجنبية، قيم افتراضية (draft/active/unverified)، AuditLog بالـ userId من الجلسة.
  - CreateLegislationDialog: يجلب /api/filters، تحقق عميلي، عرض أخطاء 400/409 عربية، حقول كاملة (عنوان رسمي/مختصر، معرّف، نوع، جهة، رقم، سنة، تاريخ إصدار/نفاذ، ديباجة).
  - استبدال إشعار «قريبًا» على زر «إضافة تشريع جديد» بفتح الحوار.
- نجح bun run lint.
- دفعت الفرع وأنشأت PR #27 إلى develop.
- نجحت فحوص CI: Lint ✓, Type Check ✓, Build ✓, Issue link ✓.
- دمجت PR #27 (squash) إلى develop: commit 64955b1.
- أغلقت Issue #26.
- أعدت main محاذٍا لـ origin/develop وأعدت تشغيل خادم التطوير.
- اختبار API (curl):
  * POST بنوع/جهة صحيحين → 201، slug=قانون-الاختبار، workflowStatus=draft.
  * POST بنفس shortTitle → 409 «المعرّف مستخدم مسبقًا».
  * POST بحقول ناقصة → 400 «العنوان الرسمي مطلوب، النوع مطلوب...».
- تحقق end-to-end بـ agent-browser:
  * دخول admin → الإدارة ← التشريعات.
  * زر «إضافة تشريع جديد» → فتح حوار «إنشاء تشريع جديد» (لا إشعار «قريبًا»).
  * الحوار يعرض: عنوان رسمي*، عنوان مختصر، معرّف، نوع* (combobox)، جهة إصدار* (combobox)، رقم*، سنة، تاريخ إصدار، تاريخ نفاذ، ديباجة.
  * البحث عن «قانون تجريبي» → يظهر التشريع المُنشأ عبر API في القائمة.
  * لا أخطاء console.
  * لقطات شاشة: /tmp/create-dialog-f03.png, /tmp/legislation-list-f03.png.

Stage Summary:
- الفجوة F03 (الجزء 1: إنشاء التشريع) معالجة بالكامل.
- Issue #26 مغلقة، PR #27 مدموج في develop (64955b1).
- إنشاء التشريع يعمل من الواجهة مع تحقق خادمي وعميلي + AuditLog.
- مصفوفة المتطلبات: REQ-05-001 منفذة، REQ-22-001 (جزء الإضافة) منفذ.
- الخطوة التالية: F03 الجزء 2 (وثيقة التعديل) أو F04 (روابط مستقرة).

---

Task ID: F04
Agent: main (session continuation)
Task: روابط مستقرة لصفحات التشريعات (F04 / REQ-19-001)

Work Log:
- راجعت الحالة: develop=1f02df2، 14/15 فجوة مصححة (F03p1 منفذ)، F04 آخر فجوة حرجة.
- حددت أن التطبيق يعتمد على تنقل Zustand بمسار واحد `/`، فلا يمكن مشاركة رابط تشريع مباشرة.
- أنشأت GitHub Issue #30 «روابط مستقرة لصفحات التشريعات (F04 / REQ-19-001)».
- أنشأت فرع fix/30-stable-legislation-urls من develop ونفّذت:
  - استخراج src/components/app-shell.tsx: مكوّن AppShell مشترك (Header + ViewRouter + Footer + ReadingProgress + KeyboardShortcuts).
  - تبسيط src/app/page.tsx إلى `return <AppShell />`.
  - إنشاء src/app/l/[slug]/page.tsx: مسار ديناميكي يستدعي openLegislation(slug) عند التحميل لترطيب المتجر، ثم يعرض AppShell.
  - تحديث ShareDialog ليقبل prop `slug` ويبني الرابط كـ `<origin>/l/<slug>` بدل `window.location.href`.
  - تمرير `slug={data.slug}` إلى ShareDialog في legislation-detail-view.
  - تحديث handleCopyLink لينسخ `<origin>/l/<slug>` المستقر.
- نجح bun run lint (بعد إزالة eslint-disable غير اللازم).
- دفعت الفرع وأنشأت PR #31 إلى develop.
- نجحت فحوص CI: Lint ✓, Type Check ✓, Build ✓, Issue link ✓.
- دمجت PR #31 (squash) إلى develop: commit f05c27e.
- أغلقت Issue #30.
- أعدت main محاذٍا لـ origin/develop وأعدت تشغيل خادم التطوير.
- تحقق end-to-end بـ agent-browser:
  * زيارة /l/constitution-2001 مباشرة → يُحمّل «دستور الجمهورية اليمنية» فورًا.
  * URL يبقى ثابتًا http://localhost:3000/l/constitution-2001.
  * تبويبات التشريع (النظرة العامة، المواد، الملاحق) تظهر.
  * زر «مشاركة» يفتح حوارًا يعرض رابطًا http://localhost:3000/l/constitution-2001 (ليس /).
  * لا أخطاء console.

Stage Summary:
- الفجوة F04 (الروابط غير مستقرة) معالجة بالكامل — آخر فجوة حرجة.
- Issue #30 مغلقة، PR #31 مدموج في develop (f05c27e).
- جميع الفجوات الحرجة الـ14 الأصلية معالجة الآن (F01-F14)، إضافة إلى F03p1.
- مصفوفة المتطلبات: REQ-19-001 منفذة، REQ-20-001 (روابط نتائج البحث) جزئيًا (الروابط للبحث معلقة).
- الخطوة التالية: F03p2 (وثيقة تعديل جديدة) أو تحسينات إضافية (روابط البحث، عارض PDF، إلخ).

---

Task ID: F03-p2
Agent: main (session continuation)
Task: تفعيل إنشاء وثيقة التعديل من لوحة الإدارة (F03-p2 / REQ-08-001)

Work Log:
- راجعت الحالة: develop=0f804cd، F03-p1 منفذ، F03-p2 التالية.
- استعنت بمشروع Rakim المرجعي (https://github.com/so7ob/Rakim/tree/develop) لفهم نمط وثيقة التعديل (AdminAmendmentsPage): وثيقة لها عنوان + تشريع هدف + عمليات متعددة بأنواع.
- أنشأت GitHub Issue #34 «تفعيل إنشاء وثيقة التعديل من لوحة الإدارة (F03-p2 / REQ-08-001)».
- أنشأت فرع fix/34-amendment-creation من develop ونفّذت:
  - POST /api/admin/amendments: تحقق الحقول المطلوبة (title, targetLegislationId)، تحقق مصفوفة عمليات اختيارية ضد 7 أنواع (replace, add, delete_part, repeal, renumber, correct, substitute_phrase)، توليد slug، 409 للتكرار، تحقق المفاتيح الأجنبية، إنشاء في معاملة (وثيقة + عمليات + AuditLog)، status=draft، operationCount=len(operations).
  - CreateAmendmentDialog: يجلب /api/legislations، حقول وثيقة كاملة (عنوان، معرّف، رقم، سنة، تواريخ، تشريع هدف/مصدر، وصف)، جدول عمليات ديناميكي (إضافة/حذف صفوف، نوع + رقم مادة + سبب + نص قديم مشروط + نص جديد)، تحقق عميلي، أخطاء 400/409 عربية.
  - استبدال إشعار «قريبًا» على «وثيقة تعديل جديدة» بفتح الحوار.
- نجح bun run lint.
- دفعت الفرع وأنشأت PR #35 إلى develop.
- نجحت فحوص CI: Lint ✓, Type Check ✓, Build ✓, Issue link ✓.
- دمجت PR #35 (squash) إلى develop: commit 452c562.
- أغلقت Issue #34.
- أعدت main محاذٍا لـ origin/develop وأعدت تشغيل خادم التطوير.
- اختبار API (curl):
  * POST مع target + عملية replace → 201، status=draft، operationCount=1.
- تحقق end-to-end بـ agent-browser:
  * دخول admin → الإدارة ← وثائق التعديل.
  * زر «وثيقة تعديل جديدة» → فتح حوار «إنشاء وثيقة تعديل جديدة» (لا إشعار «قريبًا»).
  * الحوار يعرض: عنوان، معرّف، رقم، سنة، تواريخ، تشريع هدف (combobox)، تشريع مصدر (combobox)، وصف.
  * جدول عمليات مع نوع افتراضي «استبدال — استبدال نص مادة كامل».
  * أزرار «حفظ الوثيقة» و«إلغاء».
  * لا أخطاء console.
  * لقطة شاشة /tmp/amendment-dialog-f03p2.png.

Stage Summary:
- الفجوة F03-p2 (وثيقة تعديل جديدة) معالجة بالكامل.
- Issue #34 مغلقة، PR #35 مدموج في develop (452c562).
- إنشاء وثيقة التعديل يعمل من الواجهة مع عمليات متعددة + معاملة + AuditLog.
- مصفوفة المتطلبات: REQ-08-001 منفذة، REQ-08-002 (الأنواع السبعة) منفذة.
- الخطوة التالية: F03-p3 (استثناءات السياسات) أو تحسينات إضافية.
