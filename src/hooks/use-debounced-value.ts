import { useEffect, useState } from 'react'

/**
 * Debounce a fast-changing value (e.g. table search input) before it hits
 * the server-state layer.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
