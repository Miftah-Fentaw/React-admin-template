import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { AlertTriangle, RotateCcw, XCircle } from 'lucide-react'
import { Button } from './Button'

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  compact?: boolean
}

/** Intentional, friendly placeholder when a list or view has no data. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  compact,
}: EmptyStateProps) {
  return (
    <div className={cn('empty-state', compact && 'empty-state--compact')}>
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ErrorState
// ---------------------------------------------------------------------------

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  compact?: boolean
}

/** Distinguishes failures from empty data — always offer a way forward. */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  compact,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn('error-state', compact && 'error-state--compact')}>
      <XCircle
        className="error-state__icon"
        size={compact ? 20 : 28}
        aria-hidden="true"
      />
      <div className="error-state__body">
        <h3 className="error-state__title">{title}</h3>
        <p className="error-state__message">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCcw size={14} aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Alert — inline callout for page-level notices
// ---------------------------------------------------------------------------

export interface AlertProps {
  tone?: 'info' | 'success' | 'warning' | 'destructive'
  title?: string
  children: ReactNode
}

const ALERT_ICONS = {
  info: null,
  success: null,
  warning: AlertTriangle,
  destructive: XCircle,
} as const

export function Alert({ tone = 'info', title, children }: AlertProps) {
  const Icon = ALERT_ICONS[tone]
  return (
    <div
      role={tone === 'destructive' ? 'alert' : undefined}
      className={`alert alert--${tone}`}
    >
      {Icon && <Icon className="alert__icon" size={16} aria-hidden="true" />}
      <div className="alert__content">
        {title && <p className="alert__title">{title}</p>}
        {children}
      </div>
    </div>
  )
}
