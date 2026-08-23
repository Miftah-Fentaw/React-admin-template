import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone =
  'neutral' | 'primary' | 'success' | 'warning' | 'destructive' | 'info'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  /** Renders a small status dot before the label. */
  dot?: boolean
  children: ReactNode
}

/**
 * Small status/label pill. Tones resolve to semantic token pairs, so new
 * entity statuses only need a tone mapping, not new styles.
 */
export function Badge({
  tone = 'neutral',
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cn('badge', `badge--${tone}`, className)} {...rest}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
