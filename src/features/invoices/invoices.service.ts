import type { UpdateInvoicePayload } from '@/models/schemas'
import type { Invoice, InvoicesQuery } from '@/models/Invoice'
import { apiClient } from '@/services/api/client'
import type { Paginated } from '@/types/api'

/**
 * Invoice feature service — the ONLY place the invoices feature talks HTTP.
 * Swap the backend by changing this file (usually not even necessary,
 * since it follows the shared API contract).
 */
export const invoiceService = {
  list(query: InvoicesQuery = {}): Promise<Paginated<Invoice>> {
    return apiClient.get<Paginated<Invoice>>('/invoices', { query })
  },

  async update(id: string, input: UpdateInvoicePayload): Promise<Invoice> {
    const response = await apiClient.patch<{ data: Invoice }>(`/invoices/${id}`, input)
    return response.data
  },
}
