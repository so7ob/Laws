# Task 6 — Admin Panel (full-stack-developer)

## Goal
Build the admin panel UI for the Yemeni Legislation Platform. The panel mounts when the Zustand
`view === 'admin'`. Internal sub-navigation is handled by `adminSection` on the same store.

## Scope
- Files live under `/home/z/my-project/src/components/admin/`.
- Reads from existing admin API routes (`/api/admin/*`).
- No edits outside `src/components/admin/`.

## Subagent coordination
- Public frontend views already exist (`src/components/public/*`).
- The main `src/app/page.tsx` is still the default placeholder — another agent will assemble it.

## Work log
- Read `worklog.md`, the prisma schema, every `/api/admin/*` route, the shadcn components used
  (`sheet`, `select`, `table`, `card`, `badge`, `button`, `alert-dialog`, `dialog`, `switch`,
  `progress`, `skeleton`, `tabs`).
- Created shared helpers `admin-shared.tsx` with `LoadingGrid`, `EmptyState`, `ErrorState`,
  `SectionHeader`, `arNum`, `StatusBadge` helpers to keep each section DRY.
- Created `admin-shell.tsx` with RTL sticky sidebar (right side), mobile Sheet fallback,
  top bar with back-to-public-site button and demo badge. Renders each section based on
  `useAppStore.adminSection`.
- Created 11 section components matching the spec.

## Files
- `src/components/admin/admin-shared.tsx`
- `src/components/admin/admin-shell.tsx`
- `src/components/admin/sections/dashboard-section.tsx`
- `src/components/admin/sections/legislations-section.tsx`
- `src/components/admin/sections/amendments-section.tsx`
- `src/components/admin/sections/imports-section.tsx`
- `src/components/admin/sections/recycle-section.tsx`
- `src/components/admin/sections/reports-section.tsx`
- `src/components/admin/sections/audit-section.tsx`
- `src/components/admin/sections/policies-section.tsx`
- `src/components/admin/sections/users-section.tsx`
- `src/components/admin/sections/roles-section.tsx`
- `src/components/admin/sections/settings-section.tsx`
