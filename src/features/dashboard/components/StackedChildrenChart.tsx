import { useMeasuredWidth } from '@/components/charts/chart-utils'
import type { StackedSeriesPoint } from '@/models/Dashboard'
import { formatNumber } from '@/lib/format'

export interface StackedChildrenChartProps {
  data: StackedSeriesPoint[]
  totalChildren: number
  height?: number
}

const PADDING = { top: 12, right: 12, bottom: 24, left: 36 }

const SERIES = [
  { key: 'schoolAge' as const, label: 'School Age', color: 'var(--chart-1)' },
  { key: 'toddler' as const, label: 'Toddler', color: 'var(--chart-2)' },
  { key: 'infant' as const, label: 'Infant', color: 'var(--chart-3)' },
]

export function StackedChildrenChart({ data, totalChildren, height = 220 }: StackedChildrenChartProps) {
  const [containerRef, width] = useMeasuredWidth<HTMLDivElement>()

  if (data.length === 0) {
    return <div ref={containerRef} style={{ height }} />
  }

  const innerWidth = Math.max(width - PADDING.left - PADDING.right, 0)
  const innerHeight = height - PADDING.top - PADDING.bottom

  // Find max stacked value
  const maxVal = Math.max(...data.map((d) => d.infant + d.toddler + d.schoolAge), 1)
  const niceM = Math.ceil(maxVal / 50) * 50

  const x = (i: number) =>
    PADDING.left + (data.length === 1 ? innerWidth / 2 : (i / (data.length - 1)) * innerWidth)
  const yPos = (v: number) =>
    PADDING.top + innerHeight - (v / niceM) * innerHeight

  const labelStep = Math.max(1, Math.ceil(data.length / 6))

  // Build stacked area paths
  const stackedPaths = SERIES.map((series, seriesIdx) => {
    const bottomValues = data.map((d) => {
      let acc = 0
      for (let k = 0; k < seriesIdx; k++) acc += d[SERIES[k].key]
      return acc
    })
    const topValues = data.map((d, i) => bottomValues[i] + d[series.key])

    const topPath = topValues
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${yPos(v).toFixed(1)}`)
      .join(' ')
    const bottomPath = [...bottomValues]
      .reverse()
      .map((v, i) => `L${x(data.length - 1 - i).toFixed(1)},${yPos(v).toFixed(1)}`)
      .join(' ')

    const areaPath = `${topPath} ${bottomPath} Z`
    const linePath = topPath

    return { areaPath, linePath, color: series.color }
  })

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <p className="kpi-card__label">
          {formatNumber(totalChildren)} <span className="text-xs">in Total</span>
        </p>
      </div>
      <div ref={containerRef} className="chart-container" style={{ minHeight: height }}>
        <svg
          role="img"
          aria-label="Total enrolled children by age group per month"
          width={width || '100%'}
          height={height}
          style={{ display: 'block' }}
        >
          {/* Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const gy = PADDING.top + innerHeight * ratio
            const val = niceM * (1 - ratio)
            return (
              <g key={ratio}>
                <line
                  x1={PADDING.left} x2={PADDING.left + innerWidth}
                  y1={gy} y2={gy}
                  stroke="var(--chart-grid)" strokeWidth={1}
                />
                <text
                  x={PADDING.left - 4} y={gy + 3.5}
                  textAnchor="end" fontSize={10} fill="var(--chart-axis)"
                >
                  {val > 0 ? Math.round(val) : '0'}
                </text>
              </g>
            )
          })}

          {/* Stacked areas (bottom to top render order) */}
          {stackedPaths.map((p, i) => (
            <g key={i}>
              <path d={p.areaPath} fill={p.color} fillOpacity={0.25} />
              <path d={p.linePath} fill="none" stroke={p.color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}

          {/* X labels */}
          {data.map((point, i) =>
            i % labelStep === 0 || i === data.length - 1 ? (
              <text
                key={`${point.label}-${i}`}
                x={x(i)} y={height - 7}
                textAnchor="middle" fontSize={10} fill="var(--chart-axis)"
              >
                {point.label}
              </text>
            ) : null,
          )}
        </svg>
      </div>

      <ul className="stacked-chart-legend">
        {SERIES.map((s) => (
          <li key={s.key} className="legend-list__item">
            <span className="legend-swatch" style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
