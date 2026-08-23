import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

export interface DropdownMenuItem {
  label: string
  icon?: ReactNode
  onSelect: () => void
  tone?: 'default' | 'danger'
  disabled?: boolean
}

export interface DropdownMenuProps {
  /**
   * Render prop receiving everything an accessible trigger button needs.
   * Spread the props onto your `<button>` element.
   */
  trigger: (props: {
    ref: React.Ref<HTMLButtonElement>
    'aria-expanded': boolean
    'aria-haspopup': 'menu' | 'dialog'
    'aria-controls': string | undefined
    onClick: () => void
    onKeyDown: (event: React.KeyboardEvent) => void
  }) => ReactNode
  /** Simple action items (renders a WAI-ARIA menu). */
  items?: DropdownMenuItem[]
  /** Rich panel content (renders an anchored dialog, e.g. notifications). */
  children?: ReactNode
  /** Horizontal alignment relative to the trigger. */
  align?: 'start' | 'end'
  /** Accessible name for the popup panel. */
  label?: string
  /** Extra class for the popup panel (e.g. width constraints). */
  panelClassName?: string
}

interface MenuPosition {
  top: number
  left?: number
  right?: number
}

/**
 * Anchored dropdown supporting two content modes:
 *
 * - `items` → WAI-ARIA menu pattern (Arrow/Home/End navigation)
 * - `children` → small non-modal dialog panel (rich bodies like lists)
 *
 * Both share: portal positioning under the trigger, Escape to close,
 * click-outside to close, focus restoration to the trigger.
 */
export function DropdownMenu({
  trigger,
  items,
  children,
  align = 'end',
  label,
  panelClassName,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<MenuPosition | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupId = useId()
  const isRichPanel = children !== undefined

  const openPopup = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setPosition({
      top: rect.bottom + 6,
      ...(align === 'end'
        ? { right: window.innerWidth - rect.right }
        : { left: rect.left }),
    })
    setOpen(true)
    setActiveIndex(-1)
  }

  const closeWithFocusRestore = () => {
    setOpen(false)
    setActiveIndex(-1)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          closeWithFocusRestore()
          break
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Home':
        case 'End': {
          if (isRichPanel || !items || items.length === 0) break
          event.preventDefault()
          setActiveIndex((index) => {
            const count = items.length
            if (event.key === 'Home') return 0
            if (event.key === 'End') return count - 1
            if (event.key === 'ArrowDown') return (index + 1) % count
            return (index - 1 + count) % count
          })
          break
        }
        case 'Tab':
          setOpen(false)
          break
      }
    }

    const onPointerDownOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (
        !rootRef.current?.contains(target) &&
        !document.getElementById(popupId)?.contains(target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDownOutside)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDownOutside)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isRichPanel, items?.length, popupId])

  // Move focus into the popup once it mounts.
  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      const selector = isRichPanel
        ? 'a[href], button:not([disabled]), input:not([disabled])'
        : '[role="menuitem"]'
      const elements =
        rootRef.current != null
          ? Array.from(
              document.querySelectorAll<HTMLElement>(
                `#${CSS.escape(popupId)} ${selector}`,
              ),
            )
          : []
      if (activeIndex === -1 && !isRichPanel) return // wait for explicit nav
      ;(elements[isRichPanel ? 0 : activeIndex] ?? null)?.focus()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open || activeIndex === -1) return
    const menuItems = document.querySelectorAll<HTMLButtonElement>(
      `#${CSS.escape(popupId)} [role="menuitem"]`,
    )
    menuItems[activeIndex]?.focus()
  }, [open, activeIndex, popupId])

  const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (
      (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') &&
      !open
    ) {
      event.preventDefault()
      openPopup()
    }
  }

  return (
    <div className="dropdown" ref={rootRef}>
      {trigger({
        ref: triggerRef,
        'aria-expanded': open,
        'aria-haspopup': isRichPanel ? 'dialog' : 'menu',
        'aria-controls': open ? popupId : undefined,
        onClick: () => (open ? setOpen(false) : openPopup()),
        onKeyDown: handleTriggerKeyDown,
      })}
      {open &&
        position !== null &&
        createPortal(
          <div
            id={popupId}
            role={isRichPanel ? 'dialog' : 'menu'}
            aria-label={label}
            className={cn('dropdown__menu', `dropdown__menu--${align}`, panelClassName)}
            style={{ top: position.top, left: position.left, right: position.right }}
            onMouseLeave={() => setActiveIndex(-1)}
          >
            {children ??
              items?.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  tabIndex={-1}
                  className={cn(
                    'dropdown__item',
                    item.tone === 'danger' && 'dropdown__item--danger',
                  )}
                  onClick={() => {
                    if (item.disabled) return
                    item.onSelect()
                    setOpen(false)
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {item.icon && <span className="dropdown__item-icon">{item.icon}</span>}
                  {item.label}
                </button>
              ))}
          </div>,
          document.body,
        )}
    </div>
  )
}
