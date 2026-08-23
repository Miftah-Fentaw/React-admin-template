import { http, HttpResponse } from 'msw'
import type { User, UserRole, UserStatus } from '@/models/User'
import { createUserSchema, updateUserSchema, zodFieldErrors } from '@/models/schemas'
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
  'email',
  'role',
  'status',
  'createdAt',
  'lastLoginAt',
] as const

export const usersHandlers = [
  // GET /api/users — paginated, searchable, filterable, sortable list
  http.get('*/users', async ({ request }) => {
    await latency()
    if (!getAuthUserId(request)) return unauthorized()

    const url = new URL(request.url)
    const query = parseListQuery(url)
    const role = url.searchParams.get('role')
    const status = url.searchParams.get('status')

    let items = [...db.users]
    if (role && role !== 'all') items = items.filter((u) => u.role === (role as UserRole))
    if (status && status !== 'all') {
      items = items.filter((u) => u.status === (status as UserStatus))
    }
    items = items.filter((u) => matchesSearch(u, ['name', 'email'], query.search))
    items = applySort(items, query.sortField, query.sortDirection, SORTABLE_FIELDS)

    return HttpResponse.json(paginate(items, query))
  }),

  // POST /api/users — create
  http.post('*/users', async ({ request }) => {
    await latency(250, 600)
    if (!getAuthUserId(request)) return unauthorized()

    const body = (await request.json().catch(() => null)) as unknown
    const parsed = createUserSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(
        422,
        'validation_error',
        'Please fix the highlighted fields.',
        zodFieldErrors(parsed.error),
      )
    }

    const emailTaken = db.users.some(
      (u) => u.email.toLowerCase() === parsed.data.email.toLowerCase(),
    )
    if (emailTaken) {
      return jsonError(422, 'validation_error', 'Please fix the highlighted fields.', {
        email: 'A user with this email already exists.',
      })
    }

    const now = new Date().toISOString()
    const user: User = {
      id: db.nextId('usr'),
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      status: parsed.data.status ?? 'invited',
      avatarUrl: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    }
    db.users.unshift(user)

    return HttpResponse.json({ data: user }, { status: 201 })
  }),

  // GET /api/users/:id — detail
  http.get('*/users/:id', async ({ request, params }) => {
    await latency(120, 320)
    if (!getAuthUserId(request)) return unauthorized()

    const { id } = params as { id: string }
    const user = db.users.find((u) => u.id === id)
    if (!user) return notFound('user')

    return HttpResponse.json({ data: user })
  }),

  // PATCH /api/users/:id — partial update
  http.patch('*/users/:id', async ({ request, params }) => {
    await latency(200, 500)
    if (!getAuthUserId(request)) return unauthorized()

    const { id } = params as { id: string }
    const user = db.users.find((u) => u.id === id)
    if (!user) return notFound('user')

    const body = (await request.json().catch(() => null)) as unknown
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(
        422,
        'validation_error',
        'Please fix the highlighted fields.',
        zodFieldErrors(parsed.error),
      )
    }

    if (parsed.data.email) {
      const emailTaken = db.users.some(
        (u) =>
          u.id !== id &&
          u.email.toLowerCase() === parsed.data.email?.toLowerCase(),
      )
      if (emailTaken) {
        return jsonError(422, 'validation_error', 'Please fix the highlighted fields.', {
          email: 'A user with this email already exists.',
        })
      }
    }

    Object.assign(user, parsed.data, { updatedAt: new Date().toISOString() })

    return HttpResponse.json({ data: user })
  }),

  // DELETE /api/users/:id
  http.delete('*/users/:id', async ({ request, params }) => {
    await latency(150, 400)
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    const { id } = params as { id: string }
    const index = db.users.findIndex((u) => u.id === id)
    if (index === -1) return notFound('user')

    if (id === userId) {
      return jsonError(409, 'conflict', 'You cannot delete the account you are signed in with.')
    }

    db.users.splice(index, 1)

    return new HttpResponse(null, { status: 204 })
  }),
]
