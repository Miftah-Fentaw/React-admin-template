import { http, HttpResponse } from 'msw'
import type { InvoiceStatus } from '@/models/Invoice'
import { updateInvoiceSchema, zodFieldErrors } from '@/models/schemas'
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
  'amount',
  'status',
  'issuedAt',
  'dueAt',
] as const

export const invoicesHandlers = [
  // GET /api/invoices — paginated, searchable, filterable, sortable list
  http.get('http://*/api/invoices', async ({ request }) => {
    await latency()
    if (!getAuthUserId(request)) return unauthorized()

    const url = new URL(request.url)
    const query = parseListQuery(url)
    const status = url.searchParams.get('status')

    let items = [...db.invoices]
    if (status && status !== 'all') {
      items = items.filter((i) => i.status === (status as InvoiceStatus))
    }
    items = items.filter((i) =>
      matchesSearch(i, ['number', 'customerName', 'customerEmail'], query.search),
    )
    items = applySort(items, query.sortField, query.sortDirection, SORTABLE_FIELDS)

    return HttpResponse.json(paginate(items, query))
  }),

  // PATCH /api/invoices/:id — status transition
  http.patch('http://*/api/invoices/:id', async ({ request, params }) => {
    await latency(200, 500)
    if (!getAuthUserId(request)) return unauthorized()

    const { id } = params as { id: string }
    const invoice = db.invoices.find((i) => i.id === id)
    if (!invoice) return notFound('invoice')

    const body = (await request.json().catch(() => null)) as unknown
    const parsed = updateInvoiceSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(
        422,
        'validation_error',
        'Please fix the highlighted fields.',
        zodFieldErrors(parsed.error),
      )
    }

    invoice.status = parsed.data.status
    if (invoice.status === 'paid' && invoice.paidAt === null) {
      invoice.paidAt = new Date().toISOString()
    }
    if (invoice.status !== 'paid') {
      invoice.paidAt = null
    }
    invoice.updatedAt = new Date().toISOString()

    return HttpResponse.json({ data: invoice })
  }),
]
