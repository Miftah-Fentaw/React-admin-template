import type { CreateProductPayload, UpdateProductPayload } from '@/models/schemas'
import type { Product, ProductsQuery } from '@/models/Product'
import { apiClient } from '@/services/api/client'
import type { Paginated } from '@/types/api'

/** Product feature service — the only HTTP boundary for products. */
export const productService = {
  list(query: ProductsQuery = {}): Promise<Paginated<Product>> {
    return apiClient.get<Paginated<Product>>('/products', { query })
  },

  async get(id: string): Promise<Product> {
    const response = await apiClient.get<{ data: Product }>(`/products/${id}`)
    return response.data
  },

  async create(input: CreateProductPayload): Promise<Product> {
    const response = await apiClient.post<{ data: Product }>('/products', input)
    return response.data
  },

  async update(id: string, input: UpdateProductPayload): Promise<Product> {
    const response = await apiClient.patch<{ data: Product }>(`/products/${id}`, input)
    return response.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete<void>(`/products/${id}`)
  },
}
