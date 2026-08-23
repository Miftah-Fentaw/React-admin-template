import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { Kpi } from '@/models/Dashboard'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format'
import { Skeleton } from '@/components/ui/Skeleton'

export function KpiCardSkeleton() {
  return (
    <div className="card kpi-card">
      <Skeleton style={{ width: '55%' }} />
      <div className="kpi-card__value-row">
        <Skeleton style={{ height: 28, width: 90 }} />
      </div>
      <Skeleton style={{ width: '40%', marginTop: 6 }} />
    </div>
  )
}

/** Single dashboard metric tile with period-over-period change. */
export function KpiCard({ kpi }: { kpi: Kpi }) {
  const formatted =
    kpi.format === 'currency'
      ? formatCurrency(kpi.value)
      : kpi.format === 'percent'
        ? formatPercent(kpi.value)
        : formatNumber(kpi.value)

  const trendUp = kpi.changePct > 0
  const trendDown = kpi.changePct < 0
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Minus

  return (
    <article className="card kpi-card">
      <p className="kpi-card__label">{kpi.label}</p>
      <div className="kpi-card__value-row">
        <span className="kpi-card__value">{formatted}</span>
        <span
          className={`kpi-change${trendUp ? ' kpi-change--up' : trendDown ? ' kpi-change--down' : ''}`}
        >
          <TrendIcon size={13} aria-hidden="true" />
          <span aria-hidden="true">
            {trendUp ? '+' : ''}
            {kpi.changePct.toFixed(1)}%
          </span>
          <span className="visually-hidden">
            {trendUp ? 'up' : trendDown ? 'down' : 'unchanged by'}{' '}
            {Math.abs(kpi.changePct).toFixed(1)} percent versus last month
          </span>
        </span>
        <span className="kpi-change__hint text-xs">vs last month</span>
      </div>
    </article>
  )
}
