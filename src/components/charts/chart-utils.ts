import { useEffect, useRef, useState } from 'react'

/**
 * Observe an element's width (charts must re-render on container resize).
 */
export function useMeasuredWidth<T extends HTMLElement>(): [
  React.RefObject<T | null>,
  number,
] {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setWidth(entry.contentRect.width)
    })

    observer.observe(element)
    setWidth(element.getBoundingClientRect().width)

    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

/** Round a maximum up to a "nice" axis bound (1/2/2.5/5 × 10ⁿ). */
export function niceMax(value: number): number {
  if (value <= 0) return 1
  const exponent = Math.floor(Math.log10(value))
  const base = 10 ** exponent
  for (const multiplier of [1, 2, 2.5, 5, 10]) {
    if (multiplier * base >= value) return multiplier * base
  }
  return 10 * base
}
