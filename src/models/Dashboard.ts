/**
 * Dashboard data models. Everything the dashboard renders is computed by the
 * API (mock or real) — the UI never aggregates raw records itself.
 */

export interface Kpi {
  id:
    | 'revenue'
    | 'orders'
    | 'customers'
    | 'conversion'
    | 'students'
    | 'teachers'
    | 'programs'
  label: string
  value: number
  format: 'currency' | 'number' | 'percent'
  /** Percentage change versus the previous period. Negative = decline. */
  changePct: number
  /** 6-point sparkline series for mini trend chart */
  series: SeriesPoint[]
}

export interface SeriesPoint {
  /** X axis label, e.g. a month abbreviation or day of month. */
  label: string
  value: number
}

/** One month of stacked enrollment data by age group. */
export interface StackedSeriesPoint {
  label: string
  infant: number
  toddler: number
  schoolAge: number
}

export interface TrafficSource {
  source: string
  visits: number
  /** Share of total visits, percentage 0–100. */
  share: number
}

export interface DashboardOverview {
  kpis: Kpi[]
  revenueByMonth: SeriesPoint[]
  /** Secondary revenue series (e.g. tuition/fees) for grouped bar chart */
  tuitionByMonth: SeriesPoint[]
  ordersByDay: SeriesPoint[]
  trafficSources: TrafficSource[]
  /** Total enrolled children across all programs */
  totalChildren: number
  /** Monthly enrollment breakdown by age group (last 12 months) */
  childrenByMonth: StackedSeriesPoint[]
  /** Program enrollment share per category */
  programCategories: SeriesPoint[]
  /** Total program count */
  totalPrograms: number
}

export type ActivityVerb =
  'created' | 'updated' | 'deleted' | 'signed_in' | 'placed_order'

export interface ActivityEvent {
  id: string
  actorName: string
  action: ActivityVerb
  target: string
  createdAt: string
  /** Optional rich display title (overrides the generated "actorName action target" text) */
  title?: string
  /** Optional description shown below the title */
  description?: string
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
  timestamp: string
  preview: string
}

export interface DashboardStudent {
  id: string
  name: string
  parentName: string
  /** ISO date string */
  contractEnd: string
}

export type ScheduleColorToken = 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4'

export interface ScheduleEvent {
  id: string
  /** ISO date string */
  date: string
  /** Display time, e.g. "09:00 AM" */
  time: string
  title: string
  category: string
  colorToken: ScheduleColorToken
}
