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
