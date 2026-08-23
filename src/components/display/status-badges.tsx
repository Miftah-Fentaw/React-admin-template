import type { ReactNode } from 'react'
import type { BadgeTone } from '../ui/Badge'
import { Badge } from '../ui/Badge'
import {
  ORDER_PAYMENT_STATUSES,
  ORDER_STATUSES,
  type OrderPaymentStatus,
  type OrderStatus,
} from '@/models/Order'
import {
  PRODUCT_STATUSES,
  type ProductCategory,
  type ProductStatus,
} from '@/models/Product'
import type { UserRole, UserStatus } from '@/models/User'

/**
 * Central mapping from domain statuses to visual tones. Keeping these in one
 * place guarantees consistent semantics across every table and detail view.
 */

const USER_STATUS_TONES: Record<UserStatus, BadgeTone> = {
  active: 'success',
  invited: 'info',
  suspended: 'destructive',
}

export function UserStatusBadge({ status }: { status: UserStatus }): ReactNode {
  return (
    <Badge tone={USER_STATUS_TONES[status]} dot>
      {status}
    </Badge>
  )
}

const USER_ROLE_TONES: Record<UserRole, BadgeTone> = {
  admin: 'primary',
  manager: 'warning',
  member: 'neutral',
  viewer: 'neutral',
}

export function UserRoleBadge({ role }: { role: UserRole }): ReactNode {
  const tone = USER_ROLE_TONES[role]
  return (
    <Badge tone={tone}>
      <span style={{ textTransform: 'capitalize' }}>{role}</span>
    </Badge>
  )
}

const PRODUCT_STATUS_TONES: Record<ProductStatus, BadgeTone> = {
  active: 'success',
  draft: 'warning',
  archived: 'neutral',
}

export function ProductStatusBadge({ status }: { status: ProductStatus }): ReactNode {
  return (
    <Badge tone={PRODUCT_STATUS_TONES[status]} dot>
      <span style={{ textTransform: 'capitalize' }}>{status}</span>
    </Badge>
  )
}

const ORDER_STATUS_TONES: Record<OrderStatus, BadgeTone> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'destructive',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }): ReactNode {
  return (
    <Badge tone={ORDER_STATUS_TONES[status]} dot>
      <span style={{ textTransform: 'capitalize' }}>{status}</span>
    </Badge>
  )
}

const PAYMENT_STATUS_TONES: Record<OrderPaymentStatus, BadgeTone> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'info',
  failed: 'destructive',
}

export function PaymentStatusBadge({
  status,
}: {
  status: OrderPaymentStatus
}): ReactNode {
  return (
    <Badge tone={PAYMENT_STATUS_TONES[status]}>
      <span style={{ textTransform: 'capitalize' }}>{status}</span>
    </Badge>
  )
}

/** Convenience lists for filter dropdowns. */
export const ORDER_STATUS_OPTIONS = ORDER_STATUSES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}))

export const PAYMENT_STATUS_OPTIONS = ORDER_PAYMENT_STATUSES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}))

export const PRODUCT_CATEGORY_OPTIONS: Array<{ value: string; label: string }> = [
  'electronics',
  'furniture',
  'apparel',
  'stationery',
  'home',
  'sports',
].map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }))

export const PRODUCT_STATUS_OPTIONS = PRODUCT_STATUSES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}))

export function formatCategory(category: ProductCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1)
}
