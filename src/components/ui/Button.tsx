import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg' | 'icon'
  iconLeft?: ReactNode
  iconRight?: ReactNode
  /** Shows a spinner and disables interaction. */
  isLoading?: boolean
  ref?: Ref<HTMLButtonElement>
}

/**
 * The primary interactive primitive. Variants map to design tokens so the
 * look adapts automatically to theme changes.
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  iconLeft,
  iconRight,
  isLoading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn('btn', `btn--${variant}`, `btn--${size}`, className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <Loader2
          className="btn__spinner"
          size={size === 'sm' ? 14 : 16}
          aria-hidden="true"
        />
      ) : (
        iconLeft
      )}
      {children}
      {!isLoading && iconRight}
    </button>
  )
}
