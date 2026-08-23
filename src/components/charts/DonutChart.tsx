export interface DonutSegment {
  label: string
  value: number
  /** Any CSS color; use chart tokens for theme awareness. */
  color: string
}

export interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
  thickness?: number
  ariaLabel: string
}

/**
 * Small donut/progress ring for share-style metrics (e.g. traffic sources).
 */
export function DonutChart({
  segments,
  size = 148,
  thickness = 18,
  ariaLabel,
}: DonutChartProps) {
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  let offset = 0

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--muted)"
        strokeWidth={thickness}
      />
      {total > 0 &&
        segments.map((segment) => {
          const fraction = segment.value / total
          const dash = fraction * circumference
          const element = (
            <circle
              key={segment.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          )
          offset += dash
          return element
        })}
    </svg>
  )
}
