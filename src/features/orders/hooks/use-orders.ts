import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { OrdersQuery } from '@/models/Order'
import type { UpdateOrderPayload } from '@/models/schemas'
import { queryKeys } from '@/lib/query-keys'
import { orderService } from '../orders.service'

export function useOrders(query: OrdersQuery) {
  return useQuery({
    queryKey: queryKeys.orders.list(query),
    queryFn: () => orderService.list(query),
    placeholderData: (previous) => previous,
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? ''),
    queryFn: () => orderService.get(id as string),
    enabled: Boolean(id),
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrderPayload }) =>
      orderService.update(id, input),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order)
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview })
    },
  })
}
