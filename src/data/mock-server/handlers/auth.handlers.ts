import { http, HttpResponse } from 'msw'
import { loginSchema, updateProfileSchema, zodFieldErrors } from '@/models/schemas'
import type { AuthUser } from '@/models/User'
import { db, tokenStore } from '../db'
import {
  getAuthUserId,
  jsonError,
  latency,
  unauthorized,
} from '../utils'

/**
 * Demo credentials. The two pinned accounts require their exact passwords;
 * any other seeded user accepts any password of 8+ characters so reviewers
 * can sign in as different roles.
 */
const DEMO_ACCOUNTS = [
  { email: 'admin@vantage.dev', password: 'admin123' },
  { email: 'manager@vantage.dev', password: 'manager123' },
]

const INVALID_CREDENTIALS = () =>
  jsonError(401, 'unauthorized', 'Incorrect email or password.')

export const authHandlers = [
  http.post('*/auth/login', async ({ request }) => {
    await latency(350, 800)

    const body = (await request.json().catch(() => null)) as unknown
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(
        422,
        'validation_error',
        'Please fix the highlighted fields.',
        zodFieldErrors(parsed.error),
      )
    }

    const email = parsed.data.email.toLowerCase()
    const user = db.users.find((u) => u.email.toLowerCase() === email)
    if (!user) return INVALID_CREDENTIALS()

    const demo = DEMO_ACCOUNTS.find((a) => a.email === user.email)
    const passwordOk = demo ? parsed.data.password === demo.password : true
    if (!passwordOk) return INVALID_CREDENTIALS()

    if (user.status === 'suspended') {
      return jsonError(403, 'forbidden', 'This account has been suspended. Contact an administrator.')
    }

    const token = `mock-token-${user.id}`
    tokenStore.set(token, user.id)

    // Touch the record like a real backend would.
    user.lastLoginAt = new Date().toISOString()
    db.activity.unshift({
      id: db.nextId('act'),
      actorName: user.name,
      action: 'signed_in',
      target: 'the workspace',
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json({ user, token })
  }),

  http.get('*/auth/me', async ({ request }) => {
    await latency(100, 250)
    const userId = getAuthUserId(request)
    const user = userId ? db.users.find((u) => u.id === userId) : null
    if (!user) return unauthorized()
    return HttpResponse.json({ user })
  }),

  http.patch('*/auth/me', async ({ request }) => {
    await latency()
    const userId = getAuthUserId(request)
    const user = userId ? db.users.find((u) => u.id === userId) : null
    if (!user) return unauthorized()

    const body = (await request.json().catch(() => null)) as unknown
    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(
        422,
        'validation_error',
        'Please fix the highlighted fields.',
        zodFieldErrors(parsed.error),
      )
    }

    const emailTaken = db.users.some(
      (u) => u.id !== user.id && u.email.toLowerCase() === parsed.data.email.toLowerCase(),
    )
    if (emailTaken) {
      return jsonError(422, 'validation_error', 'Please fix the highlighted fields.', {
        email: 'Another account already uses this email.',
      })
    }

    user.name = parsed.data.name
    user.email = parsed.data.email
    user.updatedAt = new Date().toISOString()

    return HttpResponse.json({ user: user satisfies AuthUser })
  }),

  http.post('*/auth/logout', async ({ request }) => {
    await latency(100, 300)
    const header = request.headers.get('Authorization')
    if (header?.startsWith('Bearer ')) {
      tokenStore.delete(header.slice('Bearer '.length))
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
