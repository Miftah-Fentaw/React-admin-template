import type { CSSProperties } from 'react'
import { cn } from '@/lib/cn'

/**
 * Layout-preserving loading placeholder.
 * Purely decorative — screen readers announce the surrounding region instead
 * (e.g. via `aria-busy` on the container being loaded).
 */
export function Skeleton({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return <span className={cn('skeleton', className)} style={style} aria-hidden="true" />
}
