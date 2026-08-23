import { http, HttpResponse } from 'msw'
import type {
  ActivityEvent,
  DashboardMessage,
  DashboardOverview,
  DashboardProgram,
  DashboardStudent,
  Kpi,
  ScheduleEvent,
  SeriesPoint,
  StackedSeriesPoint,
} from '@/models/Dashboard'
import { db } from '../db'
import { getAuthUserId, latency, unauthorized } from '../utils'

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

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

const MOCK_PROGRAMS: DashboardProgram[] = [
  {
    id: 'prog_001',
    name: 'Little Explorers',
    category: 'Early Learning',
    ageRange: '1–3',
    sessionCount: 5,
    dateRange: 'Jun 9 – Aug 29, 2026',
    startTime: '9:00 AM',
    price: 175,
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
  },
  {
    id: 'prog_002',
    name: 'Creative Cubs',
    category: 'Creative Arts',
    ageRange: '3–6',
    sessionCount: 8,
    dateRange: 'Jun 10 – Aug 30, 2026',
    startTime: '9:00 AM',
    price: 210,
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80',
  },
  {
    id: 'prog_003',
    name: 'Active Sprouts',
    category: 'Physical Dev',
    ageRange: '4–7',
    sessionCount: 6,
    dateRange: 'Jun 12 – Aug 28, 2026',
    startTime: '10:00 AM',
    price: 190,
    imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&q=80',
  },
  {
    id: 'prog_004',
    name: 'Story Seedlings',
    category: 'Early Learning',
    ageRange: '2–4',
    sessionCount: 4,
    dateRange: 'Jun 16 – Aug 25, 2026',
    startTime: '11:00 AM',
    price: 155,
    imageUrl: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=400&q=80',
  },
]

const MOCK_SCHEDULE: ScheduleEvent[] = [
  {
    id: 'sch_001',
    date: '2026-06-12',
    time: '08:00 AM',
    title: 'Parent Orientation Session',
    category: 'All Stages',
    colorToken: 'chart-1',
  },
  {
    id: 'sch_002',
    date: '2026-06-14',
    time: '01:00 PM',
    title: 'Sensory Play Workshop',
    category: 'Infant',
    colorToken: 'chart-2',
  },
  {
    id: 'sch_003',
    date: '2026-06-15',
    time: '10:00 AM',
    title: 'Creative and Art Workshop',
    category: 'School Age',
    colorToken: 'chart-3',
  },
  {
    id: 'sch_004',
    date: '2026-06-17',
    time: '08:30 AM',
    title: 'Outdoor Adventure Day',
    category: 'Toddler',
    colorToken: 'chart-4',
  },
  {
    id: 'sch_005',
    date: '2026-06-19',
    time: '09:00 AM',
    title: 'Music and Movement',
    category: 'All Stages',
    colorToken: 'chart-1',
  },
]

const MOCK_MESSAGES: DashboardMessage[] = [
  {
    id: 'msg_001',
    senderName: 'Olive Sullivan',
    timestamp: new Date(Date.now() - 1_800_000).toISOString(),
    preview: 'Thank you for today\'s update about the program schedule!',
  },
  {
    id: 'msg_002',
    senderName: 'East Granger',
    timestamp: new Date(Date.now() - 5_400_000).toISOString(),
    preview: 'My daughter loved the sensory play session yesterday.',
  },
  {
    id: 'msg_003',
    senderName: 'Paula Trevor',
    timestamp: new Date(Date.now() - 86_400_000).toISOString(),
    preview: 'Could you confirm the pick-up time for Friday\'s outdoor day?',
  },
  {
    id: 'msg_004',
    senderName: 'Miguel Laurent',
    timestamp: new Date(Date.now() - 172_800_000).toISOString(),
    preview: 'Just wanted to share that Liam has been thriving in class.',
  },
]

const MOCK_STUDENTS: DashboardStudent[] = [
  { id: 'stu_001', name: 'Emma Trevor', parentName: 'Paula Trevor', contractEnd: '2026-07-31' },
  { id: 'stu_002', name: 'Liam Laurent', parentName: 'Miguel Laurent', contractEnd: '2026-08-15' },
  { id: 'stu_003', name: 'Sophia Granger', parentName: 'East Granger', contractEnd: '2026-06-30' },
  { id: 'stu_004', name: 'Noah Sullivan', parentName: 'Olive Sullivan', contractEnd: '2026-09-01' },
  { id: 'stu_005', name: 'Ava Chen', parentName: 'Li Chen', contractEnd: '2026-07-15' },
  { id: 'stu_006', name: 'Oliver Park', parentName: 'Jin Park', contractEnd: '2026-08-31' },
]

export const dashboardHandlers = [
  http.get('http://*/api/dashboard/overview', async ({ request }) => {
    await latency()
    if (!getAuthUserId(request)) return unauthorized()

    const now = new Date()
    const activeOrders = db.orders.filter((o) => o.status !== 'cancelled')

    // Revenue KPIs
    const currentMonthKey = monthKey(now)

    const revenueInMonth = (key: string): number =>
      activeOrders
        .filter((o) => monthKey(new Date(o.placedAt)) === key)
        .reduce((sum, o) => sum + o.total, 0)

    const ordersInMonth = (key: string): number =>
      activeOrders.filter((o) => monthKey(new Date(o.placedAt)) === key).length

    const ordersCurrent = ordersInMonth(currentMonthKey)

    // Build 6-point sparkline series for each KPI
    const revenueSeries: SeriesPoint[] = []
    const ordersSeries: SeriesPoint[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = monthKey(date)
      revenueSeries.push({ label: MONTH_LABELS[date.getMonth()], value: Math.round(revenueInMonth(key)) })
      ordersSeries.push({ label: MONTH_LABELS[date.getMonth()], value: ordersInMonth(key) })
    }

    // Education-specific KPIs with sparklines
    const studentBase = db.users.length
    const studentSeries: SeriesPoint[] = Array.from({ length: 6 }, (_, i) => ({
      label: MONTH_LABELS[(now.getMonth() - 5 + i + 12) % 12],
      value: Math.max(0, studentBase - (5 - i) * 3 + Math.floor(i * 2.5)),
    }))

    const teacherBase = Math.max(10, Math.floor(studentBase / 4))
    const teacherSeries: SeriesPoint[] = Array.from({ length: 6 }, (_, i) => ({
      label: MONTH_LABELS[(now.getMonth() - 5 + i + 12) % 12],
      value: Math.max(0, teacherBase - (5 - i) + Math.floor(i * 0.5)),
    }))

    const programBase = MOCK_PROGRAMS.length
    const programSeries: SeriesPoint[] = Array.from({ length: 6 }, (_, i) => ({
      label: MONTH_LABELS[(now.getMonth() - 5 + i + 12) % 12],
      value: Math.max(1, programBase - (5 - i > 2 ? 1 : 0)),
    }))

    const kpis: Kpi[] = [
      {
        id: 'students',
        label: 'Students',
        value: studentBase,
        format: 'number',
        changePct: pctChange(studentSeries[5].value, studentSeries[4].value),
        series: studentSeries,
      },
      {
        id: 'teachers',
        label: 'Teachers',
        value: teacherBase,
        format: 'number',
        changePct: pctChange(teacherSeries[5].value, teacherSeries[4].value),
        series: teacherSeries,
      },
      {
        id: 'programs',
        label: 'Programs',
        value: programBase,
        format: 'number',
        changePct: pctChange(programSeries[5].value, programSeries[4].value),
        series: programSeries,
      },
    ]

    // Revenue by month (last 12 for full year).
    // A synthetic tuition baseline ensures bars are always visible even
    // when seeded order data doesn't cover the current calendar window.
    const BASE_MONTHLY_REVENUE = 60_000
    const revenueByMonth: SeriesPoint[] = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const orderRevenue = Math.round(revenueInMonth(monthKey(date)))
      // Blend real order revenue with a growing tuition baseline
      const syntheticBase = Math.round(BASE_MONTHLY_REVENUE + (11 - i) * 1_800 + (i % 3) * 4_200)
      revenueByMonth.push({
        label: MONTH_LABELS[date.getMonth()],
        value: Math.max(orderRevenue, syntheticBase),
      })
    }

    // Tuition/fees as secondary series — approximately 75-85% of revenue
    const tuitionByMonth: SeriesPoint[] = revenueByMonth.map((p, i) => ({
      label: p.label,
      value: Math.round(p.value * (0.75 + (i % 4) * 0.025)),
    }))

    // Orders by day (last 14 days)
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

    // Traffic sources
    const totalVisits = 12_400 + (ordersCurrent % 11) * 137
    const trafficSources = TRAFFIC_SOURCES.map((s) => ({
      ...s,
      visits: Math.round((totalVisits * s.share) / 100),
    }))

    // Children enrollment data (stacked by age group)
    const totalChildren = studentBase + Math.floor(studentBase * 0.3)
    const childrenByMonth: StackedSeriesPoint[] = Array.from({ length: 12 }, (_, i) => {
      const base = Math.max(50, totalChildren - (11 - i) * 8)
      return {
        label: MONTH_LABELS[(now.getMonth() - 11 + i + 12) % 12],
        infant: Math.round(base * 0.25),
        toddler: Math.round(base * 0.35),
        schoolAge: Math.round(base * 0.40),
      }
    })

    const programCategories: SeriesPoint[] = [
      { label: 'Early Learning', value: 5 },
      { label: 'Creative Arts', value: 3 },
      { label: 'Physical Dev', value: 3 },
    ]

    const overview: DashboardOverview = {
      kpis,
      revenueByMonth,
      tuitionByMonth,
      ordersByDay,
      trafficSources,
      totalChildren,
      childrenByMonth,
      programCategories,
      totalPrograms: MOCK_PROGRAMS.length,
    }

    return HttpResponse.json({ data: overview })
  }),

  http.get('http://*/api/dashboard/activity', async ({ request }) => {
    await latency(120, 320)
    if (!getAuthUserId(request)) return unauthorized()

    const url = new URL(request.url)
    const limit = Math.min(Number(url.searchParams.get('limit')) || 8, 30)

    const RICH_EVENTS: ActivityEvent[] = [
      {
        id: 'rich_001',
        actorName: 'System',
        action: 'created',
        target: 'check-in',
        createdAt: new Date(Date.now() - 900_000).toISOString(),
        title: 'Child Check-In',
        description: 'Emma Trevor checked in to Little Explorers at 9:02 AM',
      },
      {
        id: 'rich_002',
        actorName: 'Olive Sullivan',
        action: 'created',
        target: 'message',
        createdAt: new Date(Date.now() - 1_800_000).toISOString(),
        title: 'Parent Message Received',
        description: 'Thank you for today\'s update about the program schedule!',
      },
      {
        id: 'rich_003',
        actorName: 'System',
        action: 'created',
        target: 'report',
        createdAt: new Date(Date.now() - 3_600_000).toISOString(),
        title: 'Attendance Report Generated',
        description: 'Weekly attendance report for June 9–13 is ready to download',
      },
      {
        id: 'rich_004',
        actorName: 'Admin',
        action: 'updated',
        target: 'program',
        createdAt: new Date(Date.now() - 7_200_000).toISOString(),
        title: 'Program Schedule Updated',
        description: 'Creative Cubs session moved from 9:00 AM to 10:00 AM on Jun 14',
      },
      {
        id: 'rich_005',
        actorName: 'System',
        action: 'created',
        target: 'enrollment',
        createdAt: new Date(Date.now() - 14_400_000).toISOString(),
        title: 'New Enrollment',
        description: 'Noah Sullivan enrolled in Active Sprouts starting Jun 12',
      },
      {
        id: 'rich_006',
        actorName: 'Miguel Laurent',
        action: 'created',
        target: 'message',
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
        title: 'Parent Message Received',
        description: 'Just wanted to share that Liam has been thriving in class.',
      },
    ]

    const events: ActivityEvent[] = [
      ...RICH_EVENTS,
      ...[...db.activity]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    ].slice(0, limit)

    return HttpResponse.json({ data: events })
  }),

  http.get('http://*/api/dashboard/programs', async ({ request }) => {
    await latency()
    if (!getAuthUserId(request)) return unauthorized()
    return HttpResponse.json({ data: MOCK_PROGRAMS })
  }),

  http.get('http://*/api/dashboard/messages', async ({ request }) => {
    await latency()
    if (!getAuthUserId(request)) return unauthorized()
    return HttpResponse.json({ data: MOCK_MESSAGES })
  }),

  http.get('http://*/api/dashboard/schedule', async ({ request }) => {
    await latency()
    if (!getAuthUserId(request)) return unauthorized()
    return HttpResponse.json({ data: MOCK_SCHEDULE })
  }),

  http.get('http://*/api/dashboard/students', async ({ request }) => {
    await latency()
    if (!getAuthUserId(request)) return unauthorized()
    return HttpResponse.json({ data: MOCK_STUDENTS })
  }),
]
