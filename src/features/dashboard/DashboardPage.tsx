import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Inbox } from 'lucide-react'
import type { Paginated } from '@/types/api'
import type { Order, OrdersQuery } from '@/models/Order'
import { orderService } from '@/features/orders/orders.service'
import { queryKeys } from '@/lib/query-keys'
import { formatCurrency, formatDate, formatCompact } from '@/lib/format'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState } from '@/components/ui/Feedback'
import { Skeleton } from '@/components/ui/Skeleton'
import { AreaChart } from '@/components/charts/AreaChart'
import { BarChart } from '@/components/charts/BarChart'
import { OrderStatusBadge } from '@/components/display/status-badges'
import { dashboardService } from './dashboard.service'
import { KpiCard, KpiCardSkeleton } from './components/KpiCard'
import { ActivityFeed } from './components/ActivityFeed'
import { QuickActions } from './components/QuickActions'
import { TrafficSources } from './components/TrafficSources'

/**
 * Dashboard overview. All data is fetched from the API layer — the page
 * never aggregates raw records itself.
 */
export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A live snapshot of workspace activity, revenue and operations."
      />

      <div className="page-section">
        <KpiSection />
        <div className="dashboard-grid">
          <div className="dashboard-grid__main">
            <RevenueCard />
            <OrdersByDayCard />
            <RecentOrdersCard />
          </div>
          <aside className="dashboard-grid__side">
            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
              </CardHeader>
              <CardContent>
                <QuickActions />
              </CardContent>
            </Card>

            <TrafficCard />
            <ActivityCard />
          </aside>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function KpiSection() {
  const overview = useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardService.getOverview,
  })

  if (overview.isPending) {
    return (
      <div className="kpi-grid">
        {[1, 2, 3, 4].map((index) => (
          <KpiCardSkeleton key={index} />
        ))}
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
    <div className="kpi-grid">
      {overview.data.kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  )
}

function RevenueCard() {
  const overview = useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardService.getOverview,
  })

  const series = overview.data?.revenueByMonth

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Monthly revenue for the last 6 months</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {overview.isPending ? (
          <Skeleton style={{ height: 240 }} />
        ) : overview.isError ? (
          <ErrorState
            compact
            message="Failed to load revenue chart."
            onRetry={() => overview.refetch()}
          />
        ) : (
          <AreaChart
            data={series ?? []}
            ariaLabel="Monthly revenue for the last six months"
            formatValue={(value) => formatCompact(value)}
            height={240}
          />
        )}
      </CardContent>
    </Card>
  )
}

function OrdersByDayCard() {
  const overview = useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardService.getOverview,
  })

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Orders per day</CardTitle>
          <CardDescription>Last 14 days</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {overview.isPending ? (
          <Skeleton style={{ height: 180 }} />
        ) : overview.isError ? (
          <ErrorState
            compact
            message="Failed to load orders chart."
            onRetry={() => overview.refetch()}
          />
        ) : (
          <BarChart
            data={overview.data.ordersByDay}
            ariaLabel="Number of orders per day over the last fourteen days"
            formatValue={(value) => String(Math.round(value))}
            height={180}
          />
        )}
      </CardContent>
    </Card>
  )
}

const RECENT_ORDERS_QUERY: OrdersQuery = { page: 1, pageSize: 5 }

function RecentOrdersCard() {
  const recent = useQuery<Paginated<Order>>({
    queryKey: [...queryKeys.orders.all, 'recent', RECENT_ORDERS_QUERY],
    queryFn: () => orderService.list(RECENT_ORDERS_QUERY),
  })

  return (
    <Card>
      <CardHeader>
        <div className="dash-table-title-row">
          <div>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>The five most recent orders</CardDescription>
          </div>
          <Link to="/orders">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight size={14} aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent style={{ padding: 0 }}>
        {recent.isError && (
          <ErrorState
            message="Could not load recent orders."
            onRetry={() => recent.refetch()}
          />
        )}
        {recent.isSuccess &&
          (recent.data.data.length === 0 ? (
            <EmptyState
              icon={<Inbox size={18} aria-hidden="true" />}
              title="No orders yet"
              description="Orders will appear here as soon as customers start checking out."
            />
          ) : (
            <ul role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {recent.data.data.map((order) => (
                <li
                  key={order.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 20px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span className="mono text-sm" style={{ fontWeight: 600 }}>
                    <Link to={`/orders/${order.id}`}>{order.number}</Link>
                  </span>
                  <span className="truncate" style={{ flex: 1 }}>
                    {order.customerName}
                  </span>
                  <OrderStatusBadge status={order.status} />
                  <span
                    className="tabular"
                    style={{ minWidth: 82, textAlign: 'right', fontWeight: 550 }}
                  >
                    {formatCurrency(order.total)}
                  </span>
                  <time
                    dateTime={order.placedAt}
                    className="text-xs text-muted"
                    style={{ minWidth: 64, textAlign: 'right' }}
                  >
                    {formatDate(order.placedAt)}
                  </time>
                </li>
              ))}
            </ul>
          ))}
        {recent.isPending && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20 }}>
            {[1, 2, 3, 4, 5].map((index) => (
              <Skeleton key={index} style={{ height: 22 }} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TrafficCard() {
  const overview = useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardService.getOverview,
  })

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Traffic sources</CardTitle>
          <CardDescription>Where visitors come from</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {overview.isError ? (
          <ErrorState compact message="Failed to load traffic data." />
        ) : (
          <TrafficSources sources={overview.data?.trafficSources} />
        )}
      </CardContent>
    </Card>
  )
}

function ActivityCard() {
  const activity = useQuery({
    queryKey: queryKeys.dashboard.activity,
    queryFn: () => dashboardService.getActivity(6),
  })

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recent activity</CardTitle>
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
