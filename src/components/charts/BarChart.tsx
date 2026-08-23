import { useState } from 'react'
import type { SeriesPoint } from '@/models/Dashboard'
import { niceMax, useMeasuredWidth } from './chart-utils'

export interface BarChartProps {
  data: SeriesPoint[]
  height?: number
  formatValue?: (value: number) => string
  ariaLabel: string
}

const PADDING = { top: 12, right: 12, bottom: 24, left: 36 }

/** Dependency-free responsive bar chart (plain SVG, token-driven colors). */
export function BarChart({
  data,
  height = 200,
  formatValue = String,
  ariaLabel,
}: BarChartProps) {
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
  const maxValue = niceMax(Math.max(...data.map((d) => d.value), 1))
  const slot = innerWidth / data.length
  const barWidth = Math.min(slot * 0.62, 26)

  const labelStep = Math.max(1, Math.ceil(data.length / 10))

  return (
    <div ref={containerRef} className="chart-container" style={{ minHeight: height }}>
      <svg
        role="img"
        aria-label={ariaLabel}
        width={width || '100%'}
        height={height}
        style={{ display: 'block' }}
      >
        {[0, 0.5, 1].map((ratio) => {
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
                x={PADDING.left - 8}
                y={gy + 3.5}
                textAnchor="end"
                fontSize={10.5}
                fill="var(--chart-axis)"
              >
                {formatValue(maxValue * (1 - ratio))}
              </text>
            </g>
          )
        })}

        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * innerHeight
          const cx = PADDING.left + slot * index + slot / 2
          const isHovered = hoverIndex === index
          return (
            <g key={`${point.label}-${index}`}>
              <rect
                x={cx - barWidth / 2}
                y={PADDING.top + innerHeight - barHeight}
                width={barWidth}
                height={Math.max(barHeight, point.value > 0 ? 2 : 0)}
                rx={4}
                fill="var(--chart-2)"
                opacity={hoverIndex === null || isHovered ? 1 : 0.45}
                style={{ transition: 'opacity var(--transition-fast)' }}
              />
              {(index % labelStep === 0 || index === data.length - 1) && (
                <text
                  x={cx}
                  y={height - 7}
                  textAnchor="middle"
                  fontSize={10.5}
                  fill="var(--chart-axis)"
                >
                  {point.label}
                </text>
              )}
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
