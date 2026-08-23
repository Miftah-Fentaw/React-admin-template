import { useSearchParams } from 'react-router-dom'
import { MoreHorizontal, ReceiptText } from 'lucide-react'
import type { Invoice, InvoiceStatus } from '@/models/Invoice'
import { INVOICE_STATUSES } from '@/models/Invoice'
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
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { Skeleton } from '@/components/ui/Skeleton'
import { getUserMessage } from '@/lib/errors'
import { formatCurrency, formatDate } from '@/lib/format'
import { InvoiceStatusBadge } from '@/components/display/status-badges'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useToast } from '@/components/feedback/ToastProvider'
import { useInvoices, useUpdateInvoice } from '../hooks/use-invoices'

const PAGE_SIZE = 10

/** Allowed status transitions per current state, mirroring the mock API rules. */
const NEXT_STATUS_ACTIONS: Record<
  InvoiceStatus,
  Array<{ to: InvoiceStatus; label: string }>
> = {
  draft: [
    { to: 'sent', label: 'Mark as sent' },
    { to: 'cancelled', label: 'Cancel invoice' },
  ],
  sent: [
    { to: 'paid', label: 'Mark as paid' },
    { to: 'cancelled', label: 'Cancel invoice' },
  ],
  overdue: [{ to: 'paid', label: 'Mark as paid' }],
  paid: [],
  cancelled: [],
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...INVOICE_STATUSES.map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  })),
]

/**
 * Invoice list. Invoices are billing-system records: they are read-heavy and
 * managed through status transitions rather than free-form editing.
 */
export function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const updateInvoice = useUpdateInvoice()

  // ----- URL-synced list state ---------------------------------------------
  const search = searchParams.get('search') ?? ''
  const debouncedSearch = useDebouncedValue(search)
  const status = (searchParams.get('status') ?? 'all') as InvoiceStatus | 'all'
  const sortParam = searchParams.get('sort') ?? ''
  const sortField = sortParam.startsWith('-') ? sortParam.slice(1) : sortParam
  const sortDirection: SortState =
    sortField === '' ? null : sortParam.startsWith('-') ? 'desc' : 'asc'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (!value) next.delete(key)
    else next.set(key, value)
    if (key !== 'page') next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const query = {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status,
    sort: sortParam || undefined,
  }

  const invoices = useInvoices(query)

  const transitionStatus = async (invoice: Invoice, to: InvoiceStatus) => {
    try {
      await updateInvoice.mutateAsync({ id: invoice.id, input: { status: to } })
      toast.success('Status updated', `${invoice.number} is now ${to}.`)
    } catch (error) {
      toast.error('Update failed', getUserMessage(error))
    }
  }

  const toggleSort = (field: string) => {
    if (sortField !== field) {
      updateParam('sort', field)
      return
    }
    if (sortDirection === 'asc') updateParam('sort', `-${field}`)
    else updateParam('sort', null)
  }

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Billing records generated from orders — manage their lifecycle."
      />

      <div className="table__toolbar">
        <SearchInput
          value={search}
          onChange={(value) => updateParam('search', value || null)}
          placeholder="Search number or customer…"
          label="Search invoices"
        />
        <Select
          aria-label="Filter by status"
          options={STATUS_FILTER_OPTIONS}
          value={status}
          onChange={(event) =>
            updateParam(
              'status',
              event.target.value === 'all' ? null : event.target.value,
            )
          }
          style={{ width: 160 }}
        />
      </div>

      {invoices.isError ? (
        <ErrorState
          message={getUserMessage(invoices.error)}
          onRetry={() => invoices.refetch()}
        />
      ) : (
        <>
          <TableRoot caption="Customer invoices with amount, status and due date">
            <THead>
              <tr>
                <SortableTh
                  label="Number"
                  state={columnState('number', sortField, sortDirection)}
                  onToggle={() => toggleSort('number')}
                />
                <SortableTh
                  label="Customer"
                  state={columnState('customerName', sortField, sortDirection)}
                  onToggle={() => toggleSort('customerName')}
                />
                <Th>Email</Th>
                <SortableTh
                  label="Amount"
                  align="end"
                  state={columnState('amount', sortField, sortDirection)}
                  onToggle={() => toggleSort('amount')}
                />
                <SortableTh
                  label="Status"
                  state={columnState('status', sortField, sortDirection)}
                  onToggle={() => toggleSort('status')}
                />
                <SortableTh
                  label="Issued"
                  state={columnState('issuedAt', sortField, sortDirection)}
                  onToggle={() => toggleSort('issuedAt')}
                />
                <SortableTh
                  label="Due"
                  state={columnState('dueAt', sortField, sortDirection)}
                  onToggle={() => toggleSort('dueAt')}
                />
                <Th>
                  <span className="visually-hidden">Actions</span>
                </Th>
              </tr>
            </THead>
            <tbody>
              {invoices.isPending &&
                [1, 2, 3, 4, 5].map((row) => (
                  <tr key={row}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
                      <Td key={cell}>
                        <Skeleton style={{ height: 16, width: cell === 1 ? 120 : 80 }} />
                      </Td>
                    ))}
                  </tr>
                ))}

              {invoices.isSuccess && invoices.data.meta.total === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={<ReceiptText size={18} aria-hidden="true" />}
                      title={
                        debouncedSearch || status !== 'all'
                          ? 'No matching invoices'
                          : 'No invoices yet'
                      }
                      description={
                        debouncedSearch || status !== 'all'
                          ? 'Try adjusting your search or filters.'
                          : 'Invoices appear here once billing runs.'
                      }
                    />
                  </td>
                </tr>
              )}

              {invoices.isSuccess &&
                invoices.data.data.map((invoice) => (
                  <Tr key={invoice.id}>
                    <Td>
                      <span
                        className="table__cell-primary truncate"
                        style={{ maxWidth: 130 }}
                      >
                        {invoice.number}
                      </span>
                    </Td>
                    <Td>{invoice.customerName}</Td>
                    <Td className="table__cell-muted">{invoice.customerEmail}</Td>
                    <Td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(invoice.amount)}
                    </Td>
                    <Td>
                      <InvoiceStatusBadge status={invoice.status} />
                    </Td>
                    <Td className="table__cell-muted">{formatDate(invoice.issuedAt)}</Td>
                    <Td className="table__cell-muted">
                      {invoice.dueAt === null ? '—' : formatDate(invoice.dueAt)}
                    </Td>
                    <Td>
                      <div className="table__cell-actions">
                        {NEXT_STATUS_ACTIONS[invoice.status].length > 0 ? (
                          <DropdownMenu
                            label={`Actions for ${invoice.number}`}
                            items={NEXT_STATUS_ACTIONS[invoice.status].map(
                              ({ to, label }) => ({
                                label,
                                disabled: updateInvoice.isPending,
                                onSelect: () => {
                                  void transitionStatus(invoice, to)
                                },
                              }),
                            )}
                            trigger={(triggerProps) => (
                              <button
                                type="button"
                                className="icon-btn"
                                aria-label={`Actions for ${invoice.number}`}
                                {...triggerProps}
                              >
                                <MoreHorizontal size={16} aria-hidden="true" />
                              </button>
                            )}
                          />
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}
            </tbody>
          </TableRoot>

          {!invoices.isPending && !invoices.isError && invoices.data !== undefined && (
            <Pagination
              meta={invoices.data.meta}
              onPageChange={(p) => updateParam('page', String(p))}
              noun="invoices"
            />
          )}
          {invoices.isFetching && !invoices.isPending && (
            <p className="text-xs text-muted" role="status" style={{ marginTop: 8 }}>
              Updating…
            </p>
          )}
        </>
      )}
    </>
  )
}

function columnState(
  field: string,
  activeField: string,
  direction: SortState,
): SortState {
  return activeField === field ? direction : null
}
