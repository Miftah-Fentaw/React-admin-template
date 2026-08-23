import type { ListQuery } from '@/types/api'

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_PAYMENT_STATUSES = ['paid', 'pending', 'refunded', 'failed'] as const
export type OrderPaymentStatus = (typeof ORDER_PAYMENT_STATUSES)[number]

/** Line item snapshot stored on the order (denormalized on purpose). */
export interface OrderItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  /** Human-facing order reference, e.g. `ORD-1024`. */
  number: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: OrderStatus
  paymentStatus: OrderPaymentStatus
  placedAt: string
  updatedAt: string
}

export interface UpdateOrderInput {
  status?: OrderStatus
  paymentStatus?: OrderPaymentStatus
}

export interface OrdersQuery extends ListQuery {
  status?: OrderStatus | 'all'
  paymentStatus?: OrderPaymentStatus | 'all'
}
