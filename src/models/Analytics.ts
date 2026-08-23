import type { ActivityEvent } from './Dashboard'

export type AnalyticsRange = '7d' | '30d' | '90d'

export const ANALYTICS_RANGES: readonly AnalyticsRange[] = ['7d', '30d', '90d'] as const

/** Totals over the selected range. */
export interface AnalyticsTotals {
  revenue: number
  orders: number
  visitors: number
  /** Percentage, e.g. `3.4` means 3.4%. */
  conversionRate: number
}

export interface AnalyticsOverview {
  range: AnalyticsRange
  totals: AnalyticsTotals
  /**
   * Per-metric percentage changes versus the previous comparable window,
   * keyed by metric name.
   */
  changes: {
    revenue: number
    orders: number
    visitors: number
    conversionRate: number
  }
  series: AnalyticsDailyPoint[]
  topPages: TopPage[]
  topCountries: TopCountry[]
}

export interface AnalyticsDailyPoint {
  date: string
  revenue: number
  orders: number
  visitors: number
}

export interface TopPage {
  path: string
  views: number
  changePct: number
}

export interface TopCountry {
  country: string
  share: number
}

/**
 * The analytics overview intentionally reuses the dashboard activity feed.
 */
export type AnalyticsActivity = ActivityEvent
