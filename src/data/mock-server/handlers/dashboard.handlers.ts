import { http, HttpResponse } from 'msw'
import type {
  ActivityEvent,
  DashboardOverview,
  Kpi,
  SeriesPoint,
} from '@/models/Dashboard'
import { db } from '../db'
import { getAuthUserId, latency, unauthorized } from '../utils'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const TRAFFIC_SOURCES = [
  { source: 'Direct', share: 36 },
  { source: 'Organic search', share: 27 },
  { source: 'Referral', share: 15 },
  { source: 'Social', share: 13 },
  { source: 'Email', share: 9 },
] as const

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100
  return Math.round(((current - previous) / previous) * 1000) / 10
}

export const dashboardHandlers = [
  http.get('*/dashboard/overview', async ({ request }) => {
    await latency()
    if (!getAuthUserId(request)) return unauthorized()

    const now = new Date()
    const activeOrders = db.orders.filter((o) => o.status !== 'cancelled')

    // ----- Revenue KPIs (current vs previous month) --------------------------
    const currentMonthKey = monthKey(now)
    const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthKey = monthKey(previousMonthDate)

    const revenueInMonth = (key: string): number =>
      activeOrders
        .filter((o) => monthKey(new Date(o.placedAt)) === key)
        .reduce((sum, o) => sum + o.total, 0)

    const revenueCurrent = revenueInMonth(currentMonthKey)
    const revenuePrevious = revenueInMonth(previousMonthKey)

    // ----- Orders KPIs --------------------------------------------------------
    const ordersInMonth = (key: string): number =>
      activeOrders.filter((o) => monthKey(new Date(o.placedAt)) === key).length

    const ordersCurrent = ordersInMonth(currentMonthKey)
    const ordersPrevious = ordersInMonth(previousMonthKey)

    // ----- Customers KPI (new users in the last 30 days vs prior 30) ----------
    const withinLastDays = (iso: string, days: number): boolean =>
      Date.now() - new Date(iso).getTime() <= days * 86_400_000

    const customersCurrent = db.users.filter(
      (u) => withinLastDays(u.createdAt, 30),
    ).length
    const customersPrevious = db.users.filter(
      (u) => !withinLastDays(u.createdAt, 30) && withinLastDays(u.createdAt, 60),
    ).length

    const kpis: Kpi[] = [
      {
        id: 'revenue',
        label: 'Revenue this month',
        value: Math.round(revenueCurrent * 100) / 100,
        format: 'currency',
        changePct: pctChange(revenueCurrent, revenuePrevious),
      },
      {
        id: 'orders',
        label: 'Orders this month',
        value: ordersCurrent,
        format: 'number',
        changePct: pctChange(ordersCurrent, ordersPrevious),
      },
      {
        id: 'customers',
        label: 'New customers (30d)',
        value: customersCurrent,
        format: 'number',
        changePct: pctChange(customersCurrent, customersPrevious),
      },
      {
        id: 'conversion',
        label: 'Conversion rate',
        value: 3.4 + (ordersCurrent % 7) / 10,
        format: 'percent',
        changePct: 0.8 - ((ordersCurrent % 5) / 10),
      },
    ]

    // ----- Revenue by month (last 6 months) -----------------------------------
    const revenueByMonth: SeriesPoint[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      revenueByMonth.push({
        label: MONTH_LABELS[date.getMonth()],
        value: Math.round(revenueInMonth(monthKey(date))),
      })
    }

    // ----- Orders by day (last 14 days) ---------------------------------------
    const ordersByDay: SeriesPoint[] = []
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const key = date.toISOString().slice(0, 10)
      ordersByDay.push({
        label: String(date.getDate()),
        value: db.orders.filter((o) => o.placedAt.slice(0, 10) === key).length,
      })
    }

    // ----- Traffic sources (deterministic demo values) -------------------------
    const totalVisits = 12_400 + (ordersCurrent % 11) * 137
    const trafficSources = TRAFFIC_SOURCES.map((s) => ({
      ...s,
      visits: Math.round((totalVisits * s.share) / 100),
    }))

    const overview: DashboardOverview = {
      kpis,
      revenueByMonth,
      ordersByDay,
      trafficSources,
    }

    return HttpResponse.json({ data: overview })
  }),

  http.get('*/dashboard/activity', async ({ request }) => {
    await latency(120, 320)
    if (!getAuthUserId(request)) return unauthorized()

    const url = new URL(request.url)
    const limit = Math.min(Number(url.searchParams.get('limit')) || 8, 30)
    const events: ActivityEvent[] = [...db.activity]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, limit)

    return HttpResponse.json({ data: events })
  }),
]
