import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { Kpi, SeriesPoint } from '@/models/Dashboard'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format'
import { Skeleton } from '@/components/ui/Skeleton'

export function KpiCardSkeleton() {
  return (
    <div className="card kpi-card kpi-card--with-sparkline">
      <div className="kpi-card__content">
        <Skeleton style={{ width: '55%' }} />
        <div className="kpi-card__value-row">
          <Skeleton style={{ height: 28, width: 90 }} />
        </div>
        <Skeleton style={{ width: '40%', marginTop: 6 }} />
      </div>
      <div className="kpi-card__sparkline">
        <Skeleton style={{ width: '100%', height: 52 }} />
      </div>
    </div>
  )
}

/** Single dashboard metric tile with period-over-period change and a mini sparkline. */
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
    <article className="card kpi-card kpi-card--with-sparkline">
      <div className="kpi-card__content">
        <p className="kpi-card__label">{kpi.label}</p>
        <div className="kpi-card__value-row">
          <span className="kpi-card__value">{formatted}</span>
          <span
            className={`kpi-change${trendUp ? ' kpi-change--up' : trendDown ? ' kpi-change--down' : ''}`}
          >
            <TrendIcon size={13} aria-hidden="true" />
            <span aria-hidden="true">
              {trendUp ? '+' : ''}
              {kpi.changePct.toFixed(2)}%
            </span>
            <span className="visually-hidden">
              {trendUp ? 'up' : trendDown ? 'down' : 'unchanged by'}{' '}
              {Math.abs(kpi.changePct).toFixed(2)} percent versus last period
            </span>
          </span>
        </div>
        <p className="kpi-card__date">Data per 1 June 2026</p>
      </div>
      {kpi.series.length >= 2 && (
        <div className="kpi-card__sparkline" aria-hidden="true">
          <Sparkline data={kpi.series} colorVar={kpi.id === 'teachers' ? 'var(--chart-2)' : 'var(--chart-1)'} />
        </div>
      )}
    </article>
  )
}

/** Minimal inline area chart — no axes, no labels, no gridlines. */
function Sparkline({ data, colorVar = 'var(--chart-1)' }: { data: SeriesPoint[]; colorVar?: string }) {
  const width = 100
  const height = 52
  const padding = { top: 4, bottom: 4, left: 0, right: 0 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom
  const max = Math.max(...data.map((d) => d.value), 1)
  const min = Math.min(...data.map((d) => d.value), 0)
  const range = Math.max(max - min, 1)

  const x = (i: number) =>
    padding.left + (i / (data.length - 1)) * innerWidth
  const y = (v: number) =>
    padding.top + innerHeight - ((v - min) / range) * innerHeight

  const linePath = data
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(' ')

  const areaPath =
    `${linePath} ` +
    `L${x(data.length - 1).toFixed(1)},${(padding.top + innerHeight).toFixed(1)} ` +
    `L${x(0).toFixed(1)},${(padding.top + innerHeight).toFixed(1)} Z`

  const gradientId = `spark-${data[0].label}-${data.length}-${colorVar.replace(/[^a-z0-9]/gi, '')}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorVar} stopOpacity={0.35} />
          <stop offset="100%" stopColor={colorVar} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={colorVar}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
