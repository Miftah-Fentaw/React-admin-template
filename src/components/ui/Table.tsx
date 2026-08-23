import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Thin semantic wrappers around table elements. Styling and responsive
 * overflow live in CSS; features compose their own columns.
 */

export function TableRoot({
  children,
  caption,
}: {
  children: ReactNode
  caption?: string
}) {
  return (
    <div className="table-wrapper">
      <table className="table">
        {caption && <caption className="visually-hidden">{caption}</caption>}
        {children}
      </table>
    </div>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="table__head">{children}</thead>
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="table__row">{children}</tr>
}

export function Th({
  children,
  className,
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <th scope="col" className={cn('table__th', className)} {...rest}>
      {children}
    </th>
  )
}

export function Td({
  children,
  className,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <td className={cn('table__td', className)} {...rest}>
      {children}
    </td>
  )
}

// ---------------------------------------------------------------------------
// SortableTh — clickable header with aria-sort state
// ---------------------------------------------------------------------------

export type SortState = 'asc' | 'desc' | null

export interface SortableThProps {
  label: string
  /** Current sort state for this column. */
  state: SortState
  onToggle: () => void
  align?: 'start' | 'end'
}

function ariaSort(state: SortState): 'ascending' | 'descending' | undefined {
  if (state === 'asc') return 'ascending'
  if (state === 'desc') return 'descending'
  return undefined
}

export function SortableTh({ label, state, onToggle, align = 'start' }: SortableThProps) {
  const Icon = state === 'asc' ? ArrowUp : state === 'desc' ? ArrowDown : ChevronsUpDown
  return (
    <Th
      aria-sort={ariaSort(state)}
      className={cn('table__th--sortable', align === 'end' && 'table__th--end')}
    >
      <button type="button" className="table__sort-btn" onClick={onToggle}>
        {label}
        <Icon size={13} className="table__sort-icon" aria-hidden="true" />
        <span className="visually-hidden">
          {state === null && ' — activate to sort ascending'}
          {state === 'asc' && ' — sorted ascending'}
          {state === 'desc' && ' — sorted descending'}
        </span>
      </button>
    </Th>
  )
}
