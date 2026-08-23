import type { ListQuery } from '@/types/api'

export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export interface Invoice {
  id: string
  /** Human-facing invoice number, e.g. INV-2026-0042. */
  number: string
  customerName: string
  customerEmail: string
  /** Amount in major units (e.g. dollars), not cents. */
  amount: number
  status: InvoiceStatus
  issuedAt: string
  /** ISO date (YYYY-MM-DD) or null for drafts. */
  dueAt: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export interface InvoicesQuery extends ListQuery {
  status?: InvoiceStatus | 'all'
}

export interface UpdateInvoiceInput {
  status: InvoiceStatus
}
