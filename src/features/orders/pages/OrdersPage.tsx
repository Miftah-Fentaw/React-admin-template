import { Link, useSearchParams } from 'react-router-dom'
import { Inbox, ShoppingCart } from 'lucide-react'
import type { OrderPaymentStatus, OrderStatus } from '@/models/Order'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchInput } from '@/components/forms/SearchInput'
import { Select } from '@/components/ui/Input'
import {
  SortableTh,
  TableRoot,
  Td,
  Th,
  THead,
  Tr,
  type SortState,
} from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState, ErrorState } from '@/components/ui/Feedback'
import { Skeleton } from '@/components/ui/Skeleton'
import { getUserMessage } from '@/lib/errors'
import { formatCurrency, formatDate } from '@/lib/format'
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/display/status-badges'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useOrders } from '../hooks/use-orders'

const PAGE_SIZE = 10

const STATUS_FILTERS = [{ value: 'all', label: 'All statuses' }, ...ORDER_STATUS_OPTIONS]

const PAYMENT_FILTERS = [
  { value: 'all', label: 'All payments' },
  ...PAYMENT_STATUS_OPTIONS,
]

/**
 * Order list demonstrating a read-mostly domain: rich filtering and sorting
 * with navigation to a detail view for mutations.
 */
export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') ?? ''
  const debouncedSearch = useDebouncedValue(search)
  const status = (searchParams.get('status') ?? 'all') as OrderStatus | 'all'
  const paymentStatus = (searchParams.get('payment') ?? 'all') as
    OrderPaymentStatus | 'all'
  const sortParam = searchParams.get('sort') ?? '-placedAt'
  const effectiveSort = sortParam || '-placedAt'
  const sortField = effectiveSort.startsWith('-') ? effectiveSort.slice(1) : effectiveSort
  const sortDirection: SortState =
    sortField === '' ? null : effectiveSort.startsWith('-') ? 'desc' : 'asc'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (!value) next.delete(key)
    else next.set(key, value)
    if (key !== 'page') next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const orders = useOrders({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status,
    paymentStatus,
    sort: effectiveSort,
  })

  // Orders default-sort descending; the first toggle flips to ascending.
  const toggleSort = (field: string) => {
    if (sortField !== field) return updateParam('sort', field)
    if (sortDirection === 'asc') return updateParam('sort', `-${field}`)
    updateParam('sort', null)
  }

  const hasFilters = debouncedSearch !== '' || status !== 'all' || paymentStatus !== 'all'

  return (
    <>
      <PageHeader
        title="Orders"
        description="Track incoming orders, fulfillment progress and payments."
      />

      <div className="table__toolbar">
        <SearchInput
          value={search}
          onChange={(value) => updateParam('search', value || null)}
          placeholder="Search order # or customer…"
          label="Search orders"
        />
        <Select
          aria-label="Filter by fulfillment status"
          options={STATUS_FILTERS}
          value={status}
          onChange={(event) =>
            updateParam(
              'status',
              event.target.value === 'all' ? null : event.target.value,
            )
          }
          style={{ width: 160 }}
        />
        <Select
          aria-label="Filter by payment status"
          options={PAYMENT_FILTERS}
          value={paymentStatus}
          onChange={(event) =>
            updateParam(
              'payment',
              event.target.value === 'all' ? null : event.target.value,
            )
          }
          style={{ width: 160 }}
        />
      </div>

      {orders.isError ? (
        <ErrorState
          message={getUserMessage(orders.error)}
          onRetry={() => orders.refetch()}
        />
      ) : (
        <>
          <TableRoot caption="Orders with customer, totals and fulfillment state">
            <THead>
              <tr>
                <SortableTh
                  label="Order"
                  state={colState('number', sortField, sortDirection)}
                  onToggle={() => toggleSort('number')}
                />
                <SortableTh
                  label="Customer"
                  state={colState('customerName', sortField, sortDirection)}
                  onToggle={() => toggleSort('customerName')}
                />
                <SortableTh
                  label="Placed"
                  state={colState('placedAt', sortField, sortDirection)}
                  onToggle={() => toggleSort('placedAt')}
                />
                <SortableTh
                  label="Total"
                  state={colState('total', sortField, sortDirection)}
                  onToggle={() => toggleSort('total')}
                  align="end"
                />
                <Th>Payment</Th>
                <SortableTh
                  label="Status"
                  state={colState('status', sortField, sortDirection)}
                  onToggle={() => toggleSort('status')}
                />
              </tr>
            </THead>
            <tbody>
              {orders.isPending &&
                [1, 2, 3, 4, 5].map((row) => (
                  <tr key={row}>
                    {[1, 2, 3, 4, 5, 6].map((cell) => (
                      <Td key={cell}>
                        <Skeleton style={{ height: 16, width: cell === 1 ? 90 : 110 }} />
                      </Td>
                    ))}
                  </tr>
                ))}

              {orders.isSuccess && orders.data.meta.total === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={
                        hasFilters ? undefined : (
                          <ShoppingCart size={18} aria-hidden="true" />
                        )
                      }
                      title={hasFilters ? 'No matching orders' : 'No orders yet'}
                      description={
                        hasFilters
                          ? 'Try adjusting your search or filters.'
                          : 'New orders will appear here in real time.'
                      }
                      action={
                        !hasFilters ? (
                          <span className="text-sm text-muted">
                            <Inbox
                              size={14}
                              style={{ display: 'inline-block', verticalAlign: -2 }}
                            />{' '}
                            Nothing to process right now
                          </span>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              )}

              {orders.isSuccess &&
                orders.data.data.map((order) => (
                  <Tr key={order.id}>
                    <Td>
                      <Link
                        to={`/dashboard/orders/${order.id}`}
                        className="table__cell-primary mono"
                      >
                        {order.number}
                      </Link>
                    </Td>
                    <Td>
                      <span
                        className="truncate"
                        style={{ display: 'inline-block', maxWidth: 200 }}
                      >
                        {order.customerName}
                      </span>
                    </Td>
                    <Td className="table__cell-muted">{formatDate(order.placedAt)}</Td>
                    <Td className="table__cell-num" style={{ fontWeight: 550 }}>
                      {formatCurrency(order.total)}
                    </Td>
                    <Td>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </Td>
                    <Td>
                      <OrderStatusBadge status={order.status} />
                    </Td>
                  </Tr>
                ))}
            </tbody>
          </TableRoot>

          {!orders.isPending && !orders.isError && orders.data !== undefined && (
            <Pagination
              meta={orders.data.meta}
              onPageChange={(p) => updateParam('page', String(p))}
              noun="orders"
            />
          )}
        </>
      )}
    </>
  )
}

function colState(field: string, activeField: string, direction: SortState): SortState {
  return activeField === field ? direction : null
}
