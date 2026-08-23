import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InvoicesQuery } from '@/models/Invoice'
import type { UpdateInvoicePayload } from '@/models/schemas'
import { queryKeys } from '@/lib/query-keys'
import { invoiceService } from '../invoices.service'

/** Server state for the paginated, filterable invoices table. */
export function useInvoices(query: InvoicesQuery) {
  return useQuery({
    queryKey: queryKeys.invoices.list(query),
    queryFn: () => invoiceService.list(query),
    placeholderData: (previous) => previous,
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateInvoicePayload }) =>
      invoiceService.update(id, input),
    onSuccess: (invoice) => {
      queryClient.setQueryData(queryKeys.invoices.detail(invoice.id), invoice)
      void queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all })
    },
  })
}
