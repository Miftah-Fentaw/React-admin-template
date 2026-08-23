import { useId, useState } from 'react'
import type { SeriesPoint } from '@/models/Dashboard'
import { cn } from '@/lib/cn'
import { niceMax, useMeasuredWidth } from './chart-utils'

export interface AreaChartProps {
  data: SeriesPoint[]
  height?: number
  /** Formats the y-axis and hover values (e.g. `formatCompact`). */
  formatValue?: (value: number) => string
  ariaLabel: string
}

const PADDING = { top: 12, right: 12, bottom: 24, left: 44 }

/**
 * Dependency-free responsive area chart rendered with plain SVG.
 * Reads CSS custom properties for colors, so it themes automatically.
 */
export function AreaChart({
  data,
  height = 240,
  formatValue = String,
  ariaLabel,
}: AreaChartProps) {
  const [containerRef, width] = useMeasuredWidth<HTMLDivElement>()
  const gradientId = useId()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (data.length === 0) {
    return (
      <div ref={containerRef} className="chart-container" style={{ height }}>
        <p className="text-muted text-sm">No data available</p>
      </div>
    )
  }

  const innerWidth = Math.max(width - PADDING.left - PADDING.right, 0)
  const innerHeight = height - PADDING.top - PADDING.bottom
  const maxValue = niceMax(Math.max(...data.map((d) => d.value), 1))

  const x = (index: number): number =>
    PADDING.left +
    (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth)
  const y = (value: number): number =>
    PADDING.top + innerHeight - (value / maxValue) * innerHeight

  const linePath = data
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(point.value).toFixed(1)}`,
    )
    .join(' ')
  const areaPath = `${linePath} L${x(data.length - 1).toFixed(1)},${(PADDING.top + innerHeight).toFixed(1)} L${x(0).toFixed(1)},${(PADDING.top + innerHeight).toFixed(1)} Z`

  // Show at most ~8 x labels regardless of data density.
  const labelStep = Math.max(1, Math.ceil(data.length / 8))

  return (
    <div ref={containerRef} className="chart-container" style={{ minHeight: height }}>
      <svg
        role="img"
        aria-label={ariaLabel}
        width={width || '100%'}
        height={height}
        style={{ display: 'block' }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Gridlines + y labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const gy = PADDING.top + innerHeight * ratio
          const value = maxValue * (1 - ratio)
          return (
            <g key={ratio}>
              <line
                x1={PADDING.left}
                x2={PADDING.left + innerWidth}
                y1={gy}
                y2={gy}
                stroke="var(--chart-grid)"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 8}
                y={gy + 3.5}
                textAnchor="end"
                fontSize={10.5}
                fill="var(--chart-axis)"
              >
                {formatValue(value)}
              </text>
            </g>
          )
        })}

        {/* Area + line */}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X labels */}
        {data.map((point, index) =>
          index % labelStep === 0 || index === data.length - 1 ? (
            <text
              key={`${point.label}-${index}`}
              x={x(index)}
              y={height - 7}
              textAnchor="middle"
              fontSize={10.5}
              fill="var(--chart-axis)"
            >
              {point.label}
            </text>
          ) : null,
        )}

        {/* Hover guide */}
        {hoverIndex !== null && (
          <g>
            <line
              x1={x(hoverIndex)}
              x2={x(hoverIndex)}
              y1={PADDING.top}
              y2={PADDING.top + innerHeight}
              stroke="var(--chart-1)"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.5}
            />
            <circle
              cx={x(hoverIndex)}
              cy={y(data[hoverIndex].value)}
              r={4}
              fill="var(--chart-1)"
            />
            <circle
              cx={x(hoverIndex)}
              cy={y(data[hoverIndex].value)}
              r={4}
              fill="none"
              stroke="var(--card)"
              strokeWidth={2}
            />
          </g>
        )}

        {/* Pointer capture overlay */}
        <rect
          x={PADDING.left}
          y={PADDING.top}
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          onMouseMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect()
            const ratio = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
            setHoverIndex(
              Math.min(
                data.length - 1,
                Math.max(0, Math.round(ratio * (data.length - 1))),
              ),
            )
          }}
        />
      </svg>

      {hoverIndex !== null && (
        <ChartBubble x={x(hoverIndex)} yTop={PADDING.top} containerWidth={width}>
          <span className="text-muted">{data[hoverIndex].label}</span>{' '}
          <strong className="chart-tooltip-value">
            {formatValue(data[hoverIndex].value)}
          </strong>
        </ChartBubble>
      )}
    </div>
  )
}

/** Floating value bubble pinned above the chart at the hovered position. */
function ChartBubble({
  x,
  yTop,
  containerWidth,
  children,
}: {
  x: number
  yTop: number
  containerWidth: number
  children: React.ReactNode
}) {
  const clampedX = Math.min(Math.max(x, 60), Math.max(containerWidth - 60, 60))
  return (
    <div
      className={cn('chart-bubble')}
      role="status"
      style={{
        position: 'absolute',
        left: clampedX,
        top: yTop + 6,
        transform: 'translateX(-50%)',
        fontSize: '0.75rem',
        background: 'var(--foreground)',
        color: 'var(--background)',
        padding: '3px 8px',
        borderRadius: 'var(--radius-xs)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  )
}
