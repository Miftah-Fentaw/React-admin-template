import type { PaginationMeta } from '@/types/api'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

export interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
  /** What is being listed, e.g. "users". */
  noun: string
}

/** Compact pagination with a live region announcing the visible range. */
export function Pagination({ meta, onPageChange, noun }: PaginationProps) {
  const { page, pageSize, total, totalPages } = meta
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const pages = buildPageWindow(page, totalPages)

  return (
    <nav className="pagination" aria-label={`Pagination for ${noun}`}>
      <p className="pagination__summary" aria-live="polite">
        Showing <strong>{from}</strong>–<strong>{to}</strong> of{' '}
        <strong>{total.toLocaleString()}</strong> {noun}
      </p>
      <div className="pagination__controls">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </Button>
        {pages.map((p, index) =>
          p === 'gap' ? (
            <span key={`gap-${index}`} className="pagination__gap">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pagination__page${p === page ? ' pagination__page--current' : ''}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}

/** Windowed page numbers: 1 … 4 5 [6] 7 8 … 20 */
function buildPageWindow(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return range(1, total)

  const windowStart = Math.max(2, current - 1)
  const windowEnd = Math.min(total - 1, current + 1)
  const pages: Array<number | 'gap'> = [1]

  if (windowStart > 2) pages.push('gap')
  for (let p = windowStart; p <= windowEnd; p++) pages.push(p)
  if (windowEnd < total - 1) pages.push('gap')

  pages.push(total)
  return pages
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}
