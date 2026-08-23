import { useState } from 'react'
import type { SeriesPoint } from '@/models/Dashboard'
import { niceMax, useMeasuredWidth } from './chart-utils'

export interface GroupedSeriesPoint {
  label: string
  primary: number
  secondary: number
}

export interface GroupedBarChartProps {
  data: GroupedSeriesPoint[]
  height?: number
  formatValue?: (value: number) => string
  ariaLabel: string
  primaryColor?: string
  secondaryColor?: string
}

const PADDING = { top: 12, right: 12, bottom: 24, left: 40 }
const BAR_GAP = 2

/** Dual-series grouped bar chart — two bars per category, token-driven colors. */
export function GroupedBarChart({
  data,
  height = 200,
  formatValue = String,
  ariaLabel,
  primaryColor = 'var(--chart-1)',
  secondaryColor = 'var(--chart-2)',
}: GroupedBarChartProps) {
  const [containerRef, width] = useMeasuredWidth<HTMLDivElement>()
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
  const maxValue = niceMax(
    Math.max(...data.flatMap((d) => [d.primary, d.secondary]), 1),
  )

  const slot = innerWidth / data.length
  const pairWidth = Math.min(slot * 0.7, 36)
  const barWidth = (pairWidth - BAR_GAP) / 2

  const labelStep = Math.max(1, Math.ceil(data.length / 8))

  return (
    <div ref={containerRef} className="chart-container" style={{ minHeight: height }}>
      <svg
        role="img"
        aria-label={ariaLabel}
        width={width || '100%'}
        height={height}
        style={{ display: 'block' }}
      >
        {/* Gridlines + y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const gy = PADDING.top + innerHeight * ratio
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
                x={PADDING.left - 6}
                y={gy + 3.5}
                textAnchor="end"
                fontSize={10}
                fill="var(--chart-axis)"
              >
                {ratio === 0 ? formatValue(maxValue) : ratio === 1 ? '0' : formatValue(maxValue * (1 - ratio))}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {data.map((point, index) => {
          const cx = PADDING.left + slot * index + slot / 2
          const isHovered = hoverIndex === index

          const primaryHeight = (point.primary / maxValue) * innerHeight
          const secondaryHeight = (point.secondary / maxValue) * innerHeight

          const pairLeft = cx - pairWidth / 2

          return (
            <g key={`${point.label}-${index}`}>
              {/* Primary bar (blue) */}
              <rect
                x={pairLeft}
                y={PADDING.top + innerHeight - primaryHeight}
                width={barWidth}
                height={Math.max(primaryHeight, point.primary > 0 ? 2 : 0)}
                rx={3}
                fill={primaryColor}
                opacity={hoverIndex === null || isHovered ? 1 : 0.4}
                style={{ transition: 'opacity var(--transition-fast)' }}
              />
              {/* Secondary bar (orange) */}
              <rect
                x={pairLeft + barWidth + BAR_GAP}
                y={PADDING.top + innerHeight - secondaryHeight}
                width={barWidth}
                height={Math.max(secondaryHeight, point.secondary > 0 ? 2 : 0)}
                rx={3}
                fill={secondaryColor}
                opacity={hoverIndex === null || isHovered ? 1 : 0.4}
                style={{ transition: 'opacity var(--transition-fast)' }}
              />

              {/* X-axis label */}
              {(index % labelStep === 0 || index === data.length - 1) && (
                <text
                  x={cx}
                  y={height - 7}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--chart-axis)"
                >
                  {point.label}
                </text>
              )}

              {/* Hover hit area */}
              <rect
                x={cx - slot / 2}
                y={PADDING.top}
                width={slot}
                height={innerHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** Helper to convert two SeriesPoint arrays into GroupedSeriesPoint[] */
export function zipToGrouped(
  primary: SeriesPoint[],
  secondary: SeriesPoint[],
): GroupedSeriesPoint[] {
  return primary.map((p, i) => ({
    label: p.label,
    primary: p.value,
    secondary: secondary[i]?.value ?? 0,
  }))
}
