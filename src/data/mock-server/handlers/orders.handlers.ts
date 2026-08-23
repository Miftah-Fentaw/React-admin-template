import { http, HttpResponse } from 'msw'
import type { Order, OrderPaymentStatus, OrderStatus } from '@/models/Order'
import { updateOrderSchema, zodFieldErrors } from '@/models/schemas'
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
  'number',
  'customerName',
  'total',
  'status',
  'paymentStatus',
  'placedAt',
] as const

export const ordersHandlers = [
  http.get('http://*/api/orders', async ({ request }) => {
    await latency()
    if (!getAuthUserId(request)) return unauthorized()

    const url = new URL(request.url)
    const query = parseListQuery(url)
    const status = url.searchParams.get('status')
    const paymentStatus = url.searchParams.get('paymentStatus')

    let items = [...db.orders]
    if (status && status !== 'all') {
      items = items.filter((o) => o.status === (status as OrderStatus))
    }
    if (paymentStatus && paymentStatus !== 'all') {
      items = items.filter(
        (o) => o.paymentStatus === (paymentStatus as OrderPaymentStatus),
      )
    }
    items = items.filter((o) =>
      matchesSearch(o, ['number', 'customerName', 'customerEmail'], query.search),
    )
    items = applySort(
      items,
      query.sortField ?? 'placedAt',
      query.sortField ? query.sortDirection : 'desc',
      SORTABLE_FIELDS,
    )

    return HttpResponse.json(paginate(items, query))
  }),

  http.get('http://*/api/orders/:id', async ({ request, params }) => {
    await latency(120, 320)
    if (!getAuthUserId(request)) return unauthorized()

    const { id } = params as { id: string }
    const order = db.orders.find((o) => o.id === id)
    if (!order) return notFound('order')

    return HttpResponse.json({ data: order satisfies Order })
  }),

  http.patch('http://*/api/orders/:id', async ({ request, params }) => {
    await latency(200, 500)
    if (!getAuthUserId(request)) return unauthorized()

    const { id } = params as { id: string }
    const order = db.orders.find((o) => o.id === id)
    if (!order) return notFound('order')

    const body = (await request.json().catch(() => null)) as unknown
    const parsed = updateOrderSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(
        422,
        'validation_error',
        'Please fix the highlighted fields.',
        zodFieldErrors(parsed.error),
      )
    }

    Object.assign(order, parsed.data, { updatedAt: new Date().toISOString() })

    return HttpResponse.json({ data: order })
  }),
]
