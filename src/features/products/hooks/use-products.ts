import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UpdateProductPayload } from '@/models/schemas'
import type { CreateProductPayload } from '@/models/schemas'
import type { ProductsQuery } from '@/models/Product'
import { queryKeys } from '@/lib/query-keys'
import { productService } from '../products.service'

export function useProducts(query: ProductsQuery) {
  return useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: () => productService.list(query),
    placeholderData: (previous) => previous,
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: () => productService.get(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProductPayload) => productService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductPayload }) =>
      productService.update(id, input),
    onSuccess: (product) => {
      queryClient.setQueryData(queryKeys.products.detail(product.id), product)
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    },
  })
}
