# Tasks: Dashboard UI Redesign

## Task Dependency Graph

```
T1 (models) → T2 (query keys) → T3 (mock handlers) → T4 (service) → T5 (KpiCard) → T9 (DashboardPage)
                                                     → T6 (ProgramCard)      → T9
                                                     → T7 (CalendarWidget)   → T9
                                                     → T8 (StackedChart+other panels) → T9
T9 → T10 (CSS) → T11 (verification)
```

---

## T1 — Extend Dashboard data models

- [ ] In `src/models/Dashboard.ts`, add `series: SeriesPoint[]` field to the `Kpi` interface
- [ ] Add `StackedSeriesPoint`, `DashboardProgram`, `DashboardMessage`, `ScheduleEvent` interfaces
- [ ] Extend `DashboardOverview` with `totalChildren`, `childrenByMonth`, `programCategories`, `totalPrograms`

## T2 — Add query keys

- [ ] In `src/lib/query-keys.ts`, add `programs`, `messages`, `schedule` keys under `dashboard`

## T3 — Extend mock handlers

- [ ] In `src/data/mock-server/handlers/dashboard.handlers.ts`:
  - Extend `GET */dashboard/overview` to include `totalChildren`, `childrenByMonth`, `programCategories`, `totalPrograms`, and `series` (6-point sparkline) on each KPI
- [ ] Add `GET */dashboard/programs` handler returning 4 program objects
- [ ] Add `GET */dashboard/messages` handler returning 3–5 message objects
- [ ] Add `GET */dashboard/schedule` handler returning 4–5 upcoming events
- [ ] All new handlers: apply `latency()`, check `getAuthUserId` and return `unauthorized()` if absent

## T4 — Extend dashboard service

- [ ] In `src/features/dashboard/dashboard.service.ts`, add `getPrograms()`, `getMessages()`, `getSchedule()` methods following the existing envelope-unwrap pattern

## T5 — Update KpiCard with sparkline

- [ ] Update `KpiCard` in `src/features/dashboard/components/KpiCard.tsx`:
  - Add a right-side sparkline using an inline SVG (no axes, no labels) that reads `kpi.series`
  - Add `.kpi-card--with-sparkline` layout class and `.kpi-card__sparkline` wrapper
  - Render sparkline only when `series` has ≥ 2 points
- [ ] Update `KpiCardSkeleton` to include the sparkline placeholder area

## T6 — Build new dashboard components

- [ ] Create `src/features/dashboard/components/ProgramCard.tsx`
  - Props: `program: DashboardProgram`
  - Image with error fallback (initial letter placeholder)
  - Name, category badge, age range, session info
- [ ] Create `src/features/dashboard/components/CalendarWidget.tsx`
  - Local state for displayed month/year (default: current)
  - Prev/next navigation
  - 6×7 grid of day cells; today highlighted; other-month days muted
  - Event dot for days that appear in the schedule data (receive `events: ScheduleEvent[]` as prop)
- [ ] Create `src/features/dashboard/components/ScheduleSection.tsx`
  - Props: `events: ScheduleEvent[] | undefined`
  - Colored date badge (day + month abbrev)
  - Time, title, category tag
  - Skeleton loading state
- [ ] Create `src/features/dashboard/components/MessagesPanel.tsx`
  - Props: `messages: DashboardMessage[] | undefined`
  - Avatar (initials), sender name, relative timestamp, preview text
  - "Add Message" button → `toast.success('Coming soon')`
  - Skeleton and EmptyState handling
- [ ] Create `src/features/dashboard/components/StudentList.tsx`
  - Uses users from existing `useUsers` hook (first 5, sorted by name)
  - Search input filtering by name client-side
  - Table: Name, Parent (placeholder), Contract End (use `createdAt` as stand-in), edit/delete icon buttons → toast
  - "See All" links to `/users`
- [ ] Create `src/features/dashboard/components/StackedChildrenChart.tsx`
  - Props: `data: StackedSeriesPoint[], totalChildren: number`
  - Hand-rolled SVG stacked area chart (three filled series)
  - Legend row (Infant, Toddler, School Age)

## T7 — Rebuild DashboardPage layout

- [ ] Replace the current `DashboardPage` layout with the new three-column structure:
  - `.dashboard-layout-3col` wrapper
  - Left/main column: KPI row (3 cards), Top Programs card (donut), Total Children card (stacked chart), Programs grid, Revenue card, Messages panel, Student List
  - Right sidebar column: CalendarWidget, ScheduleSection, Recent Activity
- [ ] Wire all new TanStack Query hooks for programs, messages, schedule
- [ ] Keep existing Revenue (BarChart) and Activity cards; integrate into new layout
- [ ] Change KPI grid from 4 to 3 columns (Students, Teachers, Programs)
- [ ] Top Programs card: use existing `DonutChart` with `programCategories` data + center label overlay

## T8 — Add CSS

- [ ] In `src/styles/pages.css`, add all new classes listed in the design doc:
  - Dashboard three-column layout + responsive breakpoints
  - KPI sparkline layout
  - Program card styles
  - Calendar widget styles
  - Schedule section styles
  - Messages panel styles
  - Student list table styles
  - Stacked chart legend

## T9 — Verification

- [ ] Run `npm run typecheck` — 0 errors
- [ ] Run `npm run lint` — 0 errors
- [ ] Run `npm run test:run` — all tests green
- [ ] Run `npm run build` — build succeeds
- [ ] Manually verify in dev server: all sections render data, loading skeletons appear, calendar navigation works, revenue period toggle works
