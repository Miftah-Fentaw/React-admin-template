import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { server } from './mocks/server'
import { authService } from '@/services/auth/auth.service'
import { userService } from '@/features/users/users.service'
import { ApiError, ValidationError } from '@/services/api/errors'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

/**
 * End-to-end service tests against the real mock handlers (msw/node).
 * These pin the API contract the UI relies on.
 */
describe('users service (against mock API)', () => {
  it('requires authentication', async () => {
    await expect(userService.list({ page: 1 })).rejects.toBeInstanceOf(ApiError)
  })

  it('lists users after signing in', async () => {
    await authService.login({ email: 'admin@vantage.dev', password: 'admin123' })

    const result = await userService.list({ page: 1, pageSize: 10 })
    expect(result.meta.totalPages).toBeGreaterThanOrEqual(1)
    expect(result.data).toHaveLength(10)
    expect(result.data[0]).toHaveProperty('id')
    expect(result.data[0]).toHaveProperty('email')

    await authService.logout()
  })

  it('surfaces server-side field errors on duplicate emails', async () => {
    await authService.login({ email: 'admin@vantage.dev', password: 'admin123' })

    const existing = await userService.list({ page: 1, pageSize: 1 })
    const email = existing.data[0].email

    await expect(
      userService.create({ name: 'Duplicate', email, role: 'member' }),
    ).rejects.toBeInstanceOf(ValidationError)

    await authService.logout()
  })
})
