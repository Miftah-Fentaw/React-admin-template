import { useRef } from 'react'
import { cn } from '@/lib/cn'

export interface TabItem<T extends string> {
  value: T
  label: string
}

export interface TabsProps<T extends string> {
  items: ReadonlyArray<TabItem<T>>
  value: T
  onChange: (value: T) => void
  /** Accessible name for the tab group. */
  label: string
  className?: string
}

/**
 * Controlled tab strip used to switch between views of the same region.
 * Implements roving focus with Arrow keys per WAI-ARIA.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)

  const move = (direction: 1 | -1) => {
    const currentIndex = items.findIndex((item) => item.value === value)
    const next = items[(currentIndex + direction + items.length) % items.length]
    onChange(next.value)
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)
        ?.focus()
    })
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      className={cn('tabs', className)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          move(1)
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault()
          move(-1)
        }
      }}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          data-value={item.value}
          aria-selected={item.value === value}
          tabIndex={item.value === value ? 0 : -1}
          className={cn('tabs__tab', item.value === value && 'tabs__tab--active')}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
