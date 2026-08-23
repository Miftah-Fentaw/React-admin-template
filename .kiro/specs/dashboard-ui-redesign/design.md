# Design: Dashboard UI Redesign

## Overview

The redesign transforms the existing e-commerce dashboard into a richer three-column layout. New sections (calendar, schedule, programs, messages, student list, stacked children chart, and KPI sparklines) are added following the strict layering invariants already in place. Existing sections (Revenue, Activity) are retained and adapted.

## Architecture

No new feature domain is introduced. All new data flows through the existing `dashboard` feature slice:

```
DashboardPage
  └── useQuery(queryKeys.dashboard.*)
        └── dashboardService.*
              └── apiClient.get(...)
                    └── MSW handler → mock response
```

## Data Models (`src/models/Dashboard.ts` additions)

```ts
// Extend Kpi to include sparkline series
export interface Kpi {
  // ... existing fields ...
  /** 6-point sparkline series for mini trend chart */
  series: SeriesPoint[]
}

// Stacked series for children chart
export interface StackedSeriesPoint {
  label: string
  infant: number
  toddler: number
  schoolAge: number
}

export interface DashboardProgram {
  id: string
  name: string
  category: string
  ageRange: string
  sessionCount: number
  dateRange: string
  startTime: string
  price: number
  imageUrl: string
}

export interface DashboardMessage {
  id: string
  senderName: string
  timestamp: string   // ISO string
  preview: string
}

export interface ScheduleEvent {
  id: string
  date: string        // ISO string
  time: string        // "HH:MM AM/PM"
  title: string
  category: string
  colorToken: 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4'
}

export interface DashboardOverview {
  // ... existing fields ...
  totalChildren: number
  childrenByMonth: StackedSeriesPoint[]
  programCategories: { label: string; value: number }[]
  totalPrograms: number
}
```

## Service (`dashboard.service.ts` additions)

```ts
getPrograms(): Promise<DashboardProgram[]>
getMessages(): Promise<DashboardMessage[]>
getSchedule(): Promise<ScheduleEvent[]>
```

## Query Keys (`lib/query-keys.ts` additions)

```ts
dashboard: {
  overview: [...],
  activity: [...],
  programs: ['dashboard', 'programs'],
  messages: ['dashboard', 'messages'],
  schedule: ['dashboard', 'schedule'],
}
```

## New Mock Endpoints

| Method | Path | Returns |
|---|---|---|
| GET | `*/dashboard/programs` | `{ data: DashboardProgram[] }` |
| GET | `*/dashboard/messages` | `{ data: DashboardMessage[] }` |
| GET | `*/dashboard/schedule` | `{ data: ScheduleEvent[] }` |

Existing `GET */dashboard/overview` is extended to include `totalChildren`, `childrenByMonth`, `programCategories`, `totalPrograms`, and `series` on each KPI.

## Layout

### Three-Column Grid

```
.dashboard-layout-3col
  ├── .dashboard-col-main      (KPI row + Top Programs + Total Children + Programs + Revenue + Messages + Student List)
  └── .dashboard-col-sidebar   (Calendar + Schedule + Recent Activity)
```

At ≥ 1280 px: `grid-template-columns: 1fr 320px`  
At < 1280 px: single column stack

### KPI Grid (3 cards)
```
.kpi-grid  (3 columns at ≥ 900 px, 1 column below)
  └── KpiCard (label | value + change | sparkline SVG)
```

## New Components

| File | Purpose |
|---|---|
| `components/KpiCard.tsx` | Updated — adds mini sparkline inside card layout |
| `components/ProgramCard.tsx` | Program tile with image, name, category, session info |
| `components/CalendarWidget.tsx` | Monthly calendar grid with navigation |
| `components/ScheduleSection.tsx` | Upcoming events list |
| `components/MessagesPanel.tsx` | Message list with avatar + preview |
| `components/StudentList.tsx` | Compact searchable student table |
| `components/StackedChildrenChart.tsx` | Stacked area SVG chart (3 series) |

## CSS Classes (additions to `pages.css`)

```
/* KPI sparkline */
.kpi-card--with-sparkline
.kpi-card__sparkline

/* Program cards */
.program-cards-grid
.program-card
.program-card__img
.program-card__img-placeholder
.program-card__body
.program-card__meta

/* Calendar */
.calendar-widget
.calendar-widget__header
.calendar-widget__nav
.calendar-widget__grid
.calendar-widget__day
.calendar-widget__day--today
.calendar-widget__day--other-month
.calendar-widget__event-dot

/* Schedule */
.schedule-section
.schedule-item
.schedule-item__badge
.schedule-item__badge--chart-1 / --chart-2 / --chart-3 / --chart-4
.schedule-item__body
.schedule-item__tag

/* Messages */
.messages-panel
.messages-panel__item
.messages-panel__meta
.messages-panel__preview

/* Student list */
.student-list-table

/* Stacked chart */
.stacked-chart-legend
```

## Property-Based Testing Properties

1. **KPI sparkline data integrity** — for any KPI, `series.length === 6` and all values are `≥ 0`.
2. **Calendar grid completeness** — for any month/year, the rendered grid contains exactly 42 cells (6 rows × 7 columns).
3. **Donut chart share sum** — `programCategories` values sum to `totalPrograms`; percentage shares rendered in the legend sum to ≈ 100 %.
4. **Stacked children total** — for each month point, `infant + toddler + schoolAge === totalChildren` (within the mock data contract).
5. **Revenue period filter** — switching to "1st Biannually" shows only Jan–Jun bars; switching to "2nd Biannually" shows only Jul–Dec bars.
