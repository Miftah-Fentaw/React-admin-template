import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface SpinnerProps {
  size?: number
  className?: string
  /** Accessible description of what is loading. */
  label?: string
}

export function Spinner({ size = 20, className, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" className={cn('spinner', className)}>
      <Loader2 className="spinner__icon" size={size} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </span>
  )
}
