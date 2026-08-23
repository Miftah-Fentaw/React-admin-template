/**
 * Formatting helpers shared across features.
 * Pure functions — trivially testable, no React or API dependencies.
 */

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const currencyPreciseFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('en-US')

export function formatCurrency(value: number, options?: { precise?: boolean }): string {
  return options?.precise
    ? currencyPreciseFormatter.format(value)
    : currencyFormatter.format(value)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** Compact numbers for chart axes / KPI tiles: `12.4k`, `3.1M`. */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** `2h ago`, `yesterday`, `Mar 4` — relative time for feeds and tables. */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  const diffMs = date.getTime() - now.getTime()
  const absMs = Math.abs(diffMs)
  const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

  const minutes = Math.round(diffMs / 60_000)
  if (absMs < 60_000) return 'just now'
  if (absMs < 3_600_000) return rtf.format(minutes, 'minute')
  if (absMs < 86_400_000) return rtf.format(Math.round(diffMs / 3_600_000), 'hour')
  if (absMs < 7 * 86_400_000) return rtf.format(Math.round(diffMs / 86_400_000), 'day')
  return formatDate(iso)
}

/** "ada lovelace" → "AL" — initials for avatar fallbacks. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
