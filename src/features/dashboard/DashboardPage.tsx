import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { formatCurrency, formatCompact } from '@/lib/format'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/Feedback'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { BarChart } from '@/components/charts/BarChart'
import { DonutChart } from '@/components/charts/DonutChart'
import { dashboardService } from './dashboard.service'
import { KpiCard, KpiCardSkeleton } from './components/KpiCard'
import { ActivityFeed } from './components/ActivityFeed'
import { ProgramCard } from './components/ProgramCard'
import { CalendarWidget } from './components/CalendarWidget'
import { ScheduleSection } from './components/ScheduleSection'
import { MessagesPanel } from './components/MessagesPanel'
import { StudentList } from './components/StudentList'
import { StackedChildrenChart } from './components/StackedChildrenChart'

const REVENUE_PERIOD_TABS = [
  { value: '1h', label: '1st Biannually' },
  { value: '2h', label: '2nd Biannually' },
]

/**
 * Dashboard overview with education-focused layout: KPI sparklines, program
 * cards, stacked enrollment chart, calendar, schedule, messages, student list.
 */
export function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="page-section">
        <KpiSection />
        <div className="dashboard-layout-3col">
          <div className="dashboard-col-main">
            <div className="dashboard-row-2col">
              <TopProgramsCard />
              <TotalChildrenCard />
            </div>
            <ProgramsSection />
            <RevenueCard />
            <div className="dashboard-row-2col">
              <MessagesCard />
              <StudentListCard />
            </div>
          </div>
          <aside className="dashboard-col-sidebar">
            <CalendarCard />
            <ScheduleCard />
            <ActivityCard />
          </aside>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// KPI Section
// ---------------------------------------------------------------------------

function KpiSection() {
  const overview = useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardService.getOverview,
  })

  if (overview.isPending) {
    return (
      <div className="kpi-grid kpi-grid--3">
        {[1, 2, 3].map((i) => <KpiCardSkeleton key={i} />)}
      </div>
    )
  }

  if (overview.isError) {
    return (
      <ErrorState
        message="Could not load dashboard metrics."
        onRetry={() => overview.refetch()}
      />
    )
  }

  return (
    <div className="kpi-grid kpi-grid--3">
      {overview.data.kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Top Programs — Donut chart
// ---------------------------------------------------------------------------

function TopProgramsCard() {
  const overview = useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardService.getOverview,
  })

  const categories = overview.data?.programCategories ?? []
  const totalPrograms = overview.data?.totalPrograms ?? 0

  const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)']
  const segments = categories.map((c, i) => ({
    label: c.label,
    value: c.value,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Programs</CardTitle>
      </CardHeader>
      <CardContent>
        {overview.isPending ? (
          <Skeleton style={{ height: 180 }} />
        ) : overview.isError ? (
          <ErrorState compact message="Failed to load program data." />
        ) : (
          <>
            <div className="donut-layout">
              <div className="donut-center-wrap">
                <DonutChart
                  segments={segments}
                  size={140}
                  thickness={22}
                  ariaLabel="Program enrollment by category"
                />
                <div className="donut-center-label">
                  <span className="donut-center-label__title">Total<br />Programs</span>
                  <span className="donut-center-label__value">{totalPrograms}</span>
                </div>
              </div>
            </div>
            <ul className="legend-list" style={{ marginTop: 12 }}>
              {segments.map((s) => {
                const share =
                  totalPrograms > 0 ? Math.round((s.value / totalPrograms) * 100) : 0
                return (
                  <li key={s.label} className="legend-list__item">
                    <span className="legend-swatch" style={{ background: s.color }} />
                    {s.label}
                    <span className="legend-list__share">{share}%</span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Total Children — Stacked area chart
// ---------------------------------------------------------------------------

function TotalChildrenCard() {
  const overview = useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardService.getOverview,
  })

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Total Children</CardTitle>
          <CardDescription>This Month</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {overview.isError ? (
          <ErrorState compact message="Failed to load enrollment data." />
        ) : (
          <StackedChildrenChart
            data={overview.data?.childrenByMonth ?? []}
            totalChildren={overview.data?.totalChildren ?? 0}
            height={200}
          />
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Programs Section
// ---------------------------------------------------------------------------

function ProgramsSection() {
  const programs = useQuery({
    queryKey: queryKeys.dashboard.programs,
    queryFn: dashboardService.getPrograms,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Programs</CardTitle>
      </CardHeader>
      <CardContent>
        {programs.isPending ? (
          <div className="program-cards-grid">
            {[1, 2].map((i) => (
              <div key={i} className="program-card program-card--skeleton">
                <Skeleton style={{ height: 140 }} />
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton style={{ width: '70%' }} />
                  <Skeleton style={{ width: '50%' }} />
                  <Skeleton style={{ width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : programs.isError ? (
          <ErrorState compact message="Failed to load programs." onRetry={() => programs.refetch()} />
        ) : (
          <div className="program-cards-grid">
            {programs.data.slice(0, 2).map((prog) => (
              <ProgramCard key={prog.id} program={prog} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Revenue Card — Bar chart with period toggle
// ---------------------------------------------------------------------------

function RevenueCard() {
  const [period, setPeriod] = useState<'1h' | '2h'>('1h')

  const overview = useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardService.getOverview,
  })

  const allMonths = overview.data?.revenueByMonth ?? []
  // 12 months: indices 0-5 = first half, 6-11 = second half
  const series = period === '1h' ? allMonths.slice(0, 6) : allMonths.slice(6)
  const totalRevenue = allMonths.reduce((sum, p) => sum + p.value, 0)

  return (
    <Card>
      <CardHeader>
        <div className="dash-table-title-row">
          <div>
            <CardTitle>Revenue</CardTitle>
            <p className="kpi-card__value" style={{ marginTop: 2 }}>
              {formatCurrency(totalRevenue)}
              <span className="kpi-card__label" style={{ marginLeft: 4 }}>in Total</span>
            </p>
          </div>
          <Tabs
            items={REVENUE_PERIOD_TABS}
            value={period}
            onChange={(v) => setPeriod(v as '1h' | '2h')}
            label="Revenue period"
          />
        </div>
      </CardHeader>
      <CardContent>
        {overview.isPending ? (
          <Skeleton style={{ height: 200 }} />
        ) : overview.isError ? (
          <ErrorState compact message="Failed to load revenue data." onRetry={() => overview.refetch()} />
        ) : (
          <BarChart
            data={series}
            height={200}
            formatValue={(v) => formatCompact(v)}
            ariaLabel={`Monthly revenue — ${period === '1h' ? 'first' : 'second'} half of year`}
          />
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Messages Card
// ---------------------------------------------------------------------------

function MessagesCard() {
  const messages = useQuery({
    queryKey: queryKeys.dashboard.messages,
    queryFn: dashboardService.getMessages,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent style={{ padding: 0 }}>
        <MessagesPanel messages={messages.data} />
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Student List Card
// ---------------------------------------------------------------------------

function StudentListCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student List</CardTitle>
      </CardHeader>
      <CardContent style={{ padding: 0 }}>
        <StudentList />
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Right Sidebar: Calendar
// ---------------------------------------------------------------------------

function CalendarCard() {
  const schedule = useQuery({
    queryKey: queryKeys.dashboard.schedule,
    queryFn: dashboardService.getSchedule,
  })

  return (
    <Card>
      <CardContent style={{ padding: '16px' }}>
        <CalendarWidget events={schedule.data} />
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Right Sidebar: Schedule
// ---------------------------------------------------------------------------

function ScheduleCard() {
  const schedule = useQuery({
    queryKey: queryKeys.dashboard.schedule,
    queryFn: dashboardService.getSchedule,
  })

  return (
    <Card>
      <CardHeader>
        <div className="dash-table-title-row">
          <CardTitle>Schedule</CardTitle>
          <span className="text-xs text-muted">This Week</span>
        </div>
      </CardHeader>
      <CardContent>
        {schedule.isError ? (
          <ErrorState compact message="Failed to load schedule." onRetry={() => schedule.refetch()} />
        ) : (
          <ScheduleSection events={schedule.data} />
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Right Sidebar: Activity Feed
// ---------------------------------------------------------------------------

function ActivityCard() {
  const activity = useQuery({
    queryKey: queryKeys.dashboard.activity,
    queryFn: () => dashboardService.getActivity(6),
  })

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest changes across the workspace</CardDescription>
        </div>
      </CardHeader>
      {activity.isError ? (
        <CardContent>
          <ErrorState
            compact
            message="Failed to load activity."
            onRetry={() => activity.refetch()}
          />
        </CardContent>
      ) : (
        <ActivityFeed events={activity.data} />
      )}
    </Card>
  )
}


