import { http, HttpResponse } from 'msw'
import type { Product, ProductCategory, ProductStatus } from '@/models/Product'
import {
  createProductSchema,
  updateProductSchema,
  zodFieldErrors,
} from '@/models/schemas'
import { db } from '../db'
import {
  applySort,
  getAuthUserId,
  jsonError,
  latency,
  matchesSearch,
  notFound,
  paginate,
  parseListQuery,
  unauthorized,
} from '../utils'

const SORTABLE_FIELDS = [
  'name',
  'sku',
  'category',
  'price',
  'inventory',
  'status',
  'createdAt',
] as const

const CATEGORY_PREFIX: Record<ProductCategory, string> = {
  electronics: 'EL',
  furniture: 'FU',
  apparel: 'AP',
  stationery: 'ST',
  home: 'HO',
  sports: 'SP',
}

export const productsHandlers = [
  http.get('*/api/products', async ({ request }) => {
    await latency()
    if (!getAuthUserId(request)) return unauthorized()

    const url = new URL(request.url)
    const query = parseListQuery(url)
    const category = url.searchParams.get('category')
    const status = url.searchParams.get('status')

    let items = [...db.products]
    if (category && category !== 'all') {
      items = items.filter((p) => p.category === (category as ProductCategory))
    }
    if (status && status !== 'all') {
      items = items.filter((p) => p.status === (status as ProductStatus))
    }
    items = items.filter((p) => matchesSearch(p, ['name', 'sku'], query.search))
    items = applySort(items, query.sortField, query.sortDirection, SORTABLE_FIELDS)

    return HttpResponse.json(paginate(items, query))
  }),

  http.post('*/api/products', async ({ request }) => {
    await latency(250, 600)
    if (!getAuthUserId(request)) return unauthorized()

    const body = (await request.json().catch(() => null)) as unknown
    const parsed = createProductSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(
        422,
        'validation_error',
        'Please fix the highlighted fields.',
        zodFieldErrors(parsed.error),
      )
    }

    const now = new Date().toISOString()
    const product: Product = {
      id: db.nextId('prd'),
      name: parsed.data.name,
      sku: `${CATEGORY_PREFIX[parsed.data.category]}-${String(db.nextId('sku')).slice(1)}`,
      description: parsed.data.description ?? null,
      category: parsed.data.category,
      price: Math.round(parsed.data.price * 100) / 100,
      inventory: parsed.data.inventory,
      status: parsed.data.status ?? 'draft',
      createdAt: now,
      updatedAt: now,
    }
    db.products.unshift(product)

    return HttpResponse.json({ data: product }, { status: 201 })
  }),

  http.get('*/api/products/:id', async ({ request, params }) => {
    await latency(120, 320)
    if (!getAuthUserId(request)) return unauthorized()

    const { id } = params as { id: string }
    const product = db.products.find((p) => p.id === id)
    if (!product) return notFound('product')

    return HttpResponse.json({ data: product })
  }),

  http.patch('*/api/products/:id', async ({ request, params }) => {
    await latency(200, 500)
    if (!getAuthUserId(request)) return unauthorized()

    const { id } = params as { id: string }
    const product = db.products.find((p) => p.id === id)
    if (!product) return notFound('product')

    const body = (await request.json().catch(() => null)) as unknown
    const parsed = updateProductSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(
        422,
        'validation_error',
        'Please fix the highlighted fields.',
        zodFieldErrors(parsed.error),
      )
    }

    Object.assign(product, parsed.data, { updatedAt: new Date().toISOString() })
    product.price = Math.round(product.price * 100) / 100

    return HttpResponse.json({ data: product })
  }),

  http.delete('*/api/products/:id', async ({ request, params }) => {
    await latency(150, 400)
    if (!getAuthUserId(request)) return unauthorized()

    const { id } = params as { id: string }
    const index = db.products.findIndex((p) => p.id === id)
    if (index === -1) return notFound('product')

    db.products.splice(index, 1)

    return new HttpResponse(null, { status: 204 })
  }),
]
