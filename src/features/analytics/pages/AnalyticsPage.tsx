import { useSearchParams } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { SeriesPoint } from '@/models/Dashboard'
import type { AnalyticsRange } from '@/models/Analytics'
import { ANALYTICS_RANGES } from '@/models/Analytics'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/Feedback'
import { AreaChart, BarChart, DonutChart } from '@/components/charts'
import type { DonutSegment } from '@/components/charts'
import { formatCurrency, formatCompact, formatNumber } from '@/lib/format'
import { getUserMessage } from '@/lib/errors'
import { useAnalyticsOverview } from '../hooks/use-analytics'

const RANGE_ITEMS: ReadonlyArray<{ value: AnalyticsRange; label: string }> = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
]

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--muted)',
]

function parseRange(raw: string | null): AnalyticsRange {
  return ANALYTICS_RANGES.includes(raw as AnalyticsRange)
    ? (raw as AnalyticsRange)
    : '30d'
}

function shortDayLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Analytics overview: URL-synced range switcher, KPI cards with deltas,
 * and three complementary charts rendered from one API payload.
 */
export function AnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const range = parseRange(searchParams.get('range'))

  const setRange = (next: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('range', next)
    setSearchParams(params, { replace: true })
  }

  const overview = useAnalyticsOverview(range)

  if (overview.isPending) {
    return (
      <>
        <PageHeader
          title="Analytics"
          description="Traffic, revenue trends and conversion over time."
        />
        <div className="kpi-grid" style={{ marginBottom: 16 }}>
          {[1, 2, 3, 4].map((n) => (
            <Card key={n}>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Skeleton style={{ height: 14, width: '40%' }} />
                <Skeleton style={{ height: 26, width: '60%' }} />
                <Skeleton style={{ height: 12, width: '50%' }} />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton style={{ height: 320 }} />
      </>
    )
  }

  if (overview.isError || !overview.data) {
    return (
      <>
        <PageHeader
          title="Analytics"
          description="Traffic, revenue trends and conversion over time."
        />
        <ErrorState
          message={getUserMessage(overview.error)}
          onRetry={() => overview.refetch()}
        />
      </>
    )
  }

  const data = overview.data

  const revenueSeries: SeriesPoint[] = data.series.map((point) => ({
    label: shortDayLabel(point.date),
    value: point.revenue,
  }))
  const visitorsSeries: SeriesPoint[] = data.series.map((point) => ({
    label: shortDayLabel(point.date),
    value: point.visitors,
  }))
  const countrySegments: DonutSegment[] = data.topCountries.map((country, index) => ({
    label: country.country,
    value: country.share,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }))

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Traffic, revenue trends and conversion over time."
      />

      <Tabs
        items={RANGE_ITEMS}
        value={range}
        onChange={(value) => setRange(value)}
        label="Date range"
      />

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <MetricCard
          label="Revenue"
          value={formatCurrency(data.totals.revenue)}
          changePct={data.changes.revenue}
        />
        <MetricCard
          label="Orders"
          value={formatNumber(data.totals.orders)}
          changePct={data.changes.orders}
        />
        <MetricCard
          label="Visitors"
          value={formatNumber(data.totals.visitors)}
          changePct={data.changes.visitors}
        />
        <MetricCard
          label="Conversion rate"
          value={`${data.totals.conversionRate}%`}
          changePct={data.changes.conversionRate}
          changeIsAbsolute
        />
      </div>

      <div className="analytics-stack">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Daily revenue within the selected range.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={revenueSeries}
              height={260}
              formatValue={(value) => formatCurrency(value)}
              ariaLabel={`Daily revenue, ${RANGE_ITEMS.find((item) => item.value === range)?.label}`}
            />
          </CardContent>
        </Card>

        <div className="analytics-columns">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Visitors</CardTitle>
                <CardDescription>Daily unique visitors.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <BarChart
                data={visitorsSeries}
                height={220}
                formatValue={formatCompact}
                ariaLabel="Daily unique visitors"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Sessions by country</CardTitle>
                <CardDescription>Share of total sessions.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="donut-layout">
              <DonutChart
                segments={countrySegments}
                ariaLabel="Session share by country"
              />
              <ul role="list" className="legend-list">
                {countrySegments.map((segment) => (
                  <li key={segment.label} className="legend-list__item">
                    <span
                      className="legend-swatch"
                      style={{ background: segment.color }}
                      aria-hidden="true"
                    />
                    {segment.label}
                    <span className="legend-list__share">
                      {Math.round(segment.value)}%
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top pages</CardTitle>
              <CardDescription>
                Most visited pages versus the previous period.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ol role="list" className="rank-list">
              {data.topPages.map((page) => (
                <li key={page.path} className="rank-list__item">
                  <span className="rank-list__path">{page.path}</span>
                  <span className="rank-list__meta">
                    <span className="rank-list__views">
                      {formatNumber(page.views)} views
                    </span>
                    <span className={`kpi-change ${deltaToneClass(page.changePct)}`}>
                      {page.changePct === 0 ? (
                        <Minus size={12} aria-hidden="true" />
                      ) : page.changePct > 0 ? (
                        <ArrowUpRight size={12} aria-hidden="true" />
                      ) : (
                        <ArrowDownRight size={12} aria-hidden="true" />
                      )}
                      {Math.abs(page.changePct)}%
                      <span className="visually-hidden">versus previous period</span>
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

interface MetricCardProps {
  label: string
  value: string
  changePct: number
  /** Conversion moves in absolute points, so label its delta differently. */
  changeIsAbsolute?: boolean
}

function MetricCard({
  label,
  value,
  changePct,
  changeIsAbsolute = false,
}: MetricCardProps) {
  return (
    <Card className="kpi-card">
      <CardContent>
        <span className="kpi-card__label">{label}</span>
        <span className="kpi-card__value-row">
          <span className="kpi-card__value">{value}</span>
        </span>
        <span
          className={`kpi-change ${changeToneClass(changePct)}`}
          style={{ marginTop: 4 }}
        >
          {changePct === 0 ? (
            <Minus size={12} aria-hidden="true" />
          ) : changePct > 0 ? (
            <ArrowUpRight size={12} aria-hidden="true" />
          ) : (
            <ArrowDownRight size={12} aria-hidden="true" />
          )}
          {changeIsAbsolute ? `${Math.abs(changePct)} pts` : `${Math.abs(changePct)}%`}
          <span className="kpi-change__hint">vs prev.</span>
        </span>
      </CardContent>
    </Card>
  )
}

function changeToneClass(changePct: number): string {
  if (changePct > 0) return 'kpi-change--up'
  if (changePct < 0) return 'kpi-change--down'
  return 'kpi-change--neutral'
}

function deltaToneClass(changePct: number): string {
  return changeToneClass(changePct)
}
