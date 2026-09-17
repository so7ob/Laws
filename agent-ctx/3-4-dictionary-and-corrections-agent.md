# Task 3 & 4 — Synonym Dictionary Editor + Corrections Workflow UI

## Goal
Build two new admin sections (`dictionary-section.tsx` and `corrections-section.tsx`)
in the Yemeni Legislation Platform admin panel. Both consume already-existing
API routes under `/api/admin/dictionary` and `/api/admin/corrections`. RTL
Arabic, burgundy `#AC4459` + navy `#344B61` palette (no indigo/blue), using
shadcn/ui + Tailwind 4.

## Scope
- Files live under `/home/z/my-project/src/components/admin/sections/`.
- Reads from existing API routes — no API changes.
- No edits outside the `sections/` folder (parent agent will wire the new
  sections into `admin-shell.tsx`).

## Work log
- Read `worklog.md`, `admin-shared.tsx`, `legislations-section.tsx`,
  `policies-section.tsx`, `amendments-section.tsx`, the `dialog.tsx`,
  `alert-dialog.tsx`, `switch.tsx`, `select.tsx`, `table.tsx` shadcn
  primitives, `/api/admin/dictionary/route.ts`, `/api/admin/corrections/route.ts`,
  `/api/legislations/route.ts`, `/api/legislations/[slug]/versions/route.ts`,
  `/api/legislations/[slug]/attachments/route.ts`, plus the relevant prisma
  models (`SearchDictionary`, `SearchDictionaryEntry`, `CorrectionDraft`).
- Built `dictionary-section.tsx` (~580 lines):
  - SectionHeader + info card explaining version-based editing flow.
  - Horizontal-scroll Versions panel highlighting the current published
    (emerald border) and draft (amber border) versions, each showing
    version number, status badge, and entry count.
  - Draft editor card with: publish confirmation `AlertDialog`, "add entry"
    `Dialog`, draft entries table (canonical | synonym | isActive Switch via
    PUT on toggle | edit button | delete button with `AlertDialog`).
  - Published view (when no draft) with "create draft" button (POST
    `action: 'create_draft'`) and read-only entries table with status
    badges.
  - Search Input filtering entries by canonical or synonym.
  - Empty state with "create new dictionary" button.
  - Add/Edit dialog with canonical Input, synonym Input, isActive Switch,
    validation, toast feedback on success/error.
- Built `corrections-section.tsx` (~620 lines):
  - SectionHeader + info card.
  - 4-card stats strip (total / draft / approved / published) using
    burgundy / slate / navy / emerald palette.
  - Filter bar with status Select (all/draft/approved/published/rejected)
    + legislation Select populated from `/api/legislations?pageSize=100`.
  - Card list per correction: target-type badge (preamble=الديباجة amber,
    article=مادة burgundy, attachment=ملحق navy) + status badge (draft=slate,
    approved=navy, published=emerald, rejected=rose), clickable legislation
    link calling `useAppStore.getState().openLegislation(slug)`, article /
    attachment secondary badges, reason box, effect date (formatDate),
    created/updated (relativeTime), and a Collapsible diff section showing
    the current content (rose background) and proposed content (emerald
    background) side-by-side.
  - Per-status action buttons: draft → اعتماد / تحرير / حذف; approved →
    نشر / رفض; published/rejected → informational message.
  - Add-correction dialog: legislation picker, target type select,
    conditional article picker (`/api/legislations/{slug}/versions`) or
    attachment picker (`/api/legislations/{slug}/attachments`), proposed
    content Textarea (required), reason Input, effect date input.
  - Edit-correction dialog for `proposedContent` + `reason`.
  - Delete `AlertDialog`.
- Lint passes with zero errors. Dev server runs clean (Ready in 693ms).

## Files
- `src/components/admin/sections/dictionary-section.tsx` (NEW)
- `src/components/admin/sections/corrections-section.tsx` (NEW)

## Coordination notes for parent agent
- The new sections export `DictionarySection` and `CorrectionsSection`
  respectively. To wire them into the admin shell, add NAV items (e.g.
  `dictionary`, `corrections`), entries in `SECTION_TITLES`, cases in
  `renderSection()`, and import statements — all inside `admin-shell.tsx`.
- Suggested nav group: "الجودة والتدقيق" (Quality & Audit) alongside
  reports/audit/policies, or a new "البحث والتصحيح" group.
