import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  placement?: 'top' | 'bottom'
}

/**
 * Lightweight tooltip. The trigger must be focusable and carry its own
 * accessible name (e.g. `aria-label`); the tooltip is an enhancement for
 * pointer users and shown on hover/focus.
 */
export function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  return (
    <span className={cn('tooltip', `tooltip--${placement}`)}>
      {children}
      <span role="tooltip" className="tooltip__bubble">
        {content}
      </span>
    </span>
  )
}
