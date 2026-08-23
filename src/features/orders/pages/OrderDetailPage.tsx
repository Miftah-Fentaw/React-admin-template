import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { OrderPaymentStatus, OrderStatus } from '@/models/Order'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Field } from '@/components/ui/Input'
import { TableRoot, THead, Td, Th, Tr } from '@/components/ui/Table'
import { ErrorState } from '@/components/ui/Feedback'
import { Skeleton } from '@/components/ui/Skeleton'
import { NotFoundError } from '@/services/api/errors'
import { formatCurrency, formatDateTime } from '@/lib/format'
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  OrderStatusBadge,
  PaymentStatusBadge,
} from '@/components/display/status-badges'
import { useToast } from '@/components/feedback/ToastProvider'
import { useOrder, useUpdateOrder } from '../hooks/use-orders'

/**
 * Order detail with inline status management — the canonical example of a
 * detail view that mutates server state via TanStack Query mutations.
 */
export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const order = useOrder(orderId)
  const updateOrder = useUpdateOrder()
  const isNotFound = order.error instanceof NotFoundError

  const handleUpdate = async (patch: {
    status?: OrderStatus
    paymentStatus?: OrderPaymentStatus
  }) => {
    if (!orderId) return
    try {
      await updateOrder.mutateAsync({ id: orderId, input: patch })
      toast.success('Order updated')
    } catch {
      toast.error('Could not update the order', 'Please try again in a moment.')
    }
  }

  const data = order.data

  return (
    <>
      <PageHeader
        title={data ? `Order ${data.number}` : 'Order details'}
        description={data?.customerEmail}
      />

      <div className="detail-header">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/orders')}>
          <ArrowLeft size={15} aria-hidden="true" />
          Back to orders
        </Button>
      </div>

      {order.isPending && (
        <div className="detail-grid">
          <Card>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map((row) => (
                <Skeleton key={row} style={{ height: 18 }} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {order.isError &&
        (isNotFound ? (
          <ErrorState
            title="Order not found"
            message="This order may have been removed."
            onRetry={() => navigate('/dashboard/orders')}
          />
        ) : (
          <ErrorState
            message="Could not load this order."
            onRetry={() => order.refetch()}
          />
        ))}

      {data && (
        <div className="detail-grid">
          <div className="detail-stack">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Items</CardTitle>
                  <CardDescription>
                    {data.items.length}{' '}
                    {data.items.length === 1 ? 'line item' : 'line items'} · placed{' '}
                    {formatDateTime(data.placedAt)}
                  </CardDescription>
                </div>
              </CardHeader>
              <TableRoot caption="Line items for this order">
                <THead>
                  <tr>
                    <Th>Product</Th>
                    <Th style={{ textAlign: 'right' }}>Qty</Th>
                    <Th style={{ textAlign: 'right' }}>Unit price</Th>
                    <Th style={{ textAlign: 'right' }}>Amount</Th>
                  </tr>
                </THead>
                <tbody>
                  {data.items.map((item) => (
                    <Tr key={`${item.productId}-${item.name}`}>
                      <Td>{item.name}</Td>
                      <Td className="table__cell-num">{item.quantity}</Td>
                      <Td className="table__cell-num">
                        {formatCurrency(item.unitPrice, { precise: true })}
                      </Td>
                      <Td className="table__cell-num" style={{ fontWeight: 550 }}>
                        {formatCurrency(item.unitPrice * item.quantity, {
                          precise: true,
                        })}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </TableRoot>
              <CardContent style={{ maxWidth: 340, marginLeft: 'auto' }}>
                <div className="summary-line">
                  <span className="text-muted">Subtotal</span>
                  <strong>{formatCurrency(data.subtotal, { precise: true })}</strong>
                </div>
                <div className="summary-line">
                  <span className="text-muted">Shipping</span>
                  <strong>
                    {data.shipping === 0
                      ? 'Free'
                      : formatCurrency(data.shipping, { precise: true })}
                  </strong>
                </div>
                <div className="summary-line">
                  <span className="text-muted">Tax</span>
                  <strong>{formatCurrency(data.tax, { precise: true })}</strong>
                </div>
                <p className="summary-total">
                  Total
                  <strong>{formatCurrency(data.total, { precise: true })}</strong>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="detail-stack">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Fulfillment</CardTitle>
                  <CardDescription>
                    Update the workflow state of this order
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field id="order-status" label="Fulfillment status">
                  <Select
                    id="order-status"
                    options={ORDER_STATUS_OPTIONS}
                    value={data.status}
                    disabled={updateOrder.isPending}
                    onChange={(event) =>
                      void handleUpdate({ status: event.target.value as OrderStatus })
                    }
                  />
                </Field>
                <Field id="payment-status" label="Payment status">
                  <Select
                    id="payment-status"
                    options={PAYMENT_STATUS_OPTIONS}
                    value={data.paymentStatus}
                    disabled={updateOrder.isPending}
                    onChange={(event) =>
                      void handleUpdate({
                        paymentStatus: event.target.value as OrderPaymentStatus,
                      })
                    }
                  />
                </Field>
                <p className="text-xs text-muted" role="status" aria-live="polite">
                  {updateOrder.isPending ? 'Saving…' : 'Changes save instantly.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent style={{ paddingTop: 8 }}>
                <ul role="list" className="meta-list">
                  <li className="meta-list__row">
                    <span className="meta-list__label">Name</span>
                    <span className="meta-list__value">{data.customerName}</span>
                  </li>
                  <li className="meta-list__row">
                    <span className="meta-list__label">Email</span>
                    <span className="meta-list__value">{data.customerEmail}</span>
                  </li>
                  <li className="meta-list__row">
                    <span className="meta-list__label">Current state</span>
                    <span
                      className="meta-list__value"
                      style={{ display: 'inline-flex', gap: 6 }}
                    >
                      <OrderStatusBadge status={data.status} />
                      <PaymentStatusBadge status={data.paymentStatus} />
                    </span>
                  </li>
                  <li className="meta-list__row">
                    <span className="meta-list__label">Last updated</span>
                    <span className="meta-list__value">
                      {formatDateTime(data.updatedAt)}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
