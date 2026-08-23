/**
 * Dashboard data models. Everything the dashboard renders is computed by the
 * API (mock or real) — the UI never aggregates raw records itself.
 */

export interface Kpi {
  id: 'revenue' | 'orders' | 'customers' | 'conversion'
  label: string
  value: number
  format: 'currency' | 'number' | 'percent'
  /** Percentage change versus the previous period. Negative = decline. */
  changePct: number
}

export interface SeriesPoint {
  /** X axis label, e.g. a month abbreviation or day of month. */
  label: string
  value: number
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
  ordersByDay: SeriesPoint[]
  trafficSources: TrafficSource[]
}

export type ActivityVerb =
  'created' | 'updated' | 'deleted' | 'signed_in' | 'placed_order'

export interface ActivityEvent {
  id: string
  actorName: string
  action: ActivityVerb
  target: string
  createdAt: string
}
