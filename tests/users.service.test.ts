import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { server } from './mocks/server'
import { authService } from '@/services/auth/auth.service'
import { userService } from '@/features/users/users.service'
import { ValidationError } from '@/services/api/errors'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

/**
 * End-to-end service tests against the real mock handlers (msw/node).
 * These pin the API contract the UI relies on.
 */
describe('users service (against mock API)', () => {
  it('lists users directly in template mode', async () => {
    const result = await userService.list({ page: 1, pageSize: 10 })
    expect(result.meta.totalPages).toBeGreaterThanOrEqual(1)
    expect(result.data).toHaveLength(10)
    expect(result.data[0]).toHaveProperty('id')
    expect(result.data[0]).toHaveProperty('email')
  })

  it('surfaces server-side field errors on duplicate emails', async () => {
    await authService.login({ email: 'admin@vital.dev', password: 'admin123' })

    const existing = await userService.list({ page: 1, pageSize: 1 })
    const email = existing.data[0].email

    await expect(
      userService.create({ name: 'Duplicate', email, role: 'member' }),
    ).rejects.toBeInstanceOf(ValidationError)

    await authService.logout()
  })
})
