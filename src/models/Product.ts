import type { ListQuery } from '@/types/api'

export const PRODUCT_CATEGORIES = [
  'electronics',
  'furniture',
  'apparel',
  'stationery',
  'home',
  'sports',
] as const
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const PRODUCT_STATUSES = ['active', 'draft', 'archived'] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export interface Product {
  id: string
  name: string
  sku: string
  description: string | null
  category: ProductCategory
  /** Price in major units (e.g. dollars), not cents. */
  price: number
  inventory: number
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface CreateProductInput {
  name: string
  description?: string | null
  category: ProductCategory
  price: number
  inventory: number
  status?: ProductStatus
}

export type UpdateProductInput = Partial<CreateProductInput>

export interface ProductsQuery extends ListQuery {
  category?: ProductCategory | 'all'
  status?: ProductStatus | 'all'
}
