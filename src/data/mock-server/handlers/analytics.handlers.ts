import { http, HttpResponse } from 'msw'
import type { AnalyticsDailyPoint, AnalyticsOverview, AnalyticsRange } from '@/models/Analytics'
import { ANALYTICS_RANGES } from '@/models/Analytics'
import { getAuthUserId, jsonError, latency, unauthorized } from '../utils'

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

const TOP_PAGES = [
  { path: '/', base: 920 },
  { path: '/pricing', base: 610 },
  { path: '/docs/getting-started', base: 480 },
  { path: '/blog/launch-week', base: 350 },
  { path: '/changelog', base: 240 },
]

const TOP_COUNTRIES = [
  { country: 'United States', share: 32.4 },
  { country: 'Germany', share: 14.1 },
  { country: 'United Kingdom', share: 11.8 },
  { country: 'Japan', share: 8.3 },
  { country: 'Canada', share: 6.9 },
]

/**
 * Deterministic per-day generator — same date always yields the same values,
 * so charts are stable across reloads (like a real analytics backend).
 */
function dailyValues(date: Date): AnalyticsDailyPoint {
  const key = date.toISOString().slice(0, 10)
  let hash = 2166136261
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const next = () => {
    hash = Math.imul(hash ^ (hash >>> 13), 1274126177)
    return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296
  }

  const weekday = date.getDay()
  const weekendDip = weekday === 0 || weekday === 6 ? 0.62 : 1
  const visitors = Math.round((520 + next() * 380) * weekendDip)
  const orders = Math.round((visitors * (0.028 + next() * 0.02)) * 10) / 10
  const revenue = Math.round((orders * (78 + next() * 64) + 40 * next()) * 100) / 100

  return {
    date: key,
    revenue,
    orders: Math.max(1, Math.round(orders)),
    visitors,
  }
}

function seriesFor(days: number): AnalyticsDailyPoint[] {
  const points: AnalyticsDailyPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - i)
    points.push(dailyValues(date))
  }
  return points
}

export const analyticsHandlers = [
  http.get('*/analytics/overview', async ({ request }) => {
    await latency(250, 550)
    if (!getAuthUserId(request)) return unauthorized()

    const url = new URL(request.url)
    const rangeParam = url.searchParams.get('range') ?? '30d'
    if (!ANALYTICS_RANGES.includes(rangeParam as AnalyticsRange)) {
      return jsonError(400, 'bad_request', `Invalid range. Use one of: ${ANALYTICS_RANGES.join(', ')}.`)
    }
    const range = rangeParam as AnalyticsRange
    const days = RANGE_DAYS[range]

    const series = seriesFor(days)

    // Previous comparable window for delta calculations.
    const previousSeries: AnalyticsDailyPoint[] = []
    for (let i = days * 2 - 1; i >= days; i--) {
      const date = new Date()
      date.setHours(12, 0, 0, 0)
      date.setDate(date.getDate() - i)
      previousSeries.push(dailyValues(date))
    }

    const sum = (points: AnalyticsDailyPoint[], field: keyof AnalyticsDailyPoint): number =>
      points.reduce((total, p) => total + (p[field] as number), 0)

    const revenueCurrent = sum(series, 'revenue')
    const revenuePrevious = sum(previousSeries, 'revenue')
    const ordersCurrent = sum(series, 'orders')
    const ordersPrevious = sum(previousSeries, 'orders')
    const visitorsCurrent = sum(series, 'visitors')
    const visitorsPrevious = sum(previousSeries, 'visitors')

    const changePct = (current: number, previous: number): number =>
      previous === 0 ? 0 : Math.round(((current - previous) / previous) * 1000) / 10

    const conversionRate =
      Math.round((ordersCurrent / Math.max(visitorsCurrent, 1)) * 10000) / 100
    const conversionPrevious =
      Math.round((ordersPrevious / Math.max(visitorsPrevious, 1)) * 10000) / 100

    const overview: AnalyticsOverview = {
      range,
      totals: {
        revenue: Math.round(revenueCurrent),
        orders: Math.round(ordersCurrent),
        visitors: visitorsCurrent,
        conversionRate,
      },
      changes: {
        revenue: changePct(revenueCurrent, revenuePrevious),
        orders: changePct(ordersCurrent, ordersPrevious),
        visitors: changePct(visitorsCurrent, visitorsPrevious),
        conversionRate:
          Math.round((conversionRate - conversionPrevious) * 100) / 100,
      },
      series,
      topPages: TOP_PAGES.map((page, index) => ({
        path: page.path,
        views: Math.round(page.base * (days / 30) * (0.92 + ((index * 37) % 17) / 100)),
        changePct: (((index * 29) % 23) - 9) / 2,
      })),
      topCountries: TOP_COUNTRIES.map((c) => ({
        country: c.country,
        share: Math.round(c.share * (days / 30) * 10) / 10,
      })),
    }

    return HttpResponse.json({ data: overview })
  }),
]
