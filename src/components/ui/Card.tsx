import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({
  className,
  children,
  style,
  as: Tag = 'section',
}: {
  className?: string
  children: ReactNode
  style?: CSSProperties
  /** Semantic element for the card root. */
  as?: 'section' | 'div' | 'article' | 'aside'
}) {
  return (
    <Tag className={cn('card', className)} style={style}>
      {children}
    </Tag>
  )
}

export function CardHeader({
  className,
  children,
  style,
}: {
  className?: string
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <header className={cn('card__header', className)} style={style}>
      {children}
    </header>
  )
}

export function CardTitle({
  className,
  children,
  id,
  as: Tag = 'h2',
}: {
  className?: string
  children: ReactNode
  id?: string
  as?: 'h1' | 'h2' | 'h3'
}) {
  return (
    <Tag id={id} className={cn('card__title', className)}>
      {children}
    </Tag>
  )
}

export function CardDescription({
  className,
  children,
  id,
}: {
  className?: string
  children: ReactNode
  id?: string
}) {
  return (
    <p id={id} className={cn('card__description', className)}>
      {children}
    </p>
  )
}

export function CardContent({
  className,
  children,
  style,
}: {
  className?: string
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <div className={cn('card__content', className)} style={style}>
      {children}
    </div>
  )
}

export function CardFooter({
  className,
  children,
  style,
}: {
  className?: string
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <footer className={cn('card__footer', className)} style={style}>
      {children}
    </footer>
  )
}
