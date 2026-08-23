import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { server } from './mocks/server'
import { authService } from '@/services/auth/auth.service'
import { invoiceService } from '@/features/invoices/invoices.service'
import { projectService } from '@/features/projects/projects.service'
import { ApiError, ValidationError } from '@/services/api/errors'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

/**
 * End-to-end service tests against the real mock handlers (msw/node).
 * These pin the API contract the UI relies on.
 */
describe('projects service (against mock API)', () => {
  it('lists projects directly in template mode', async () => {
    const list = await projectService.list({ page: 1 })
    expect(list.data.length).toBeGreaterThan(0)
  })

  it('creates, updates and deletes a project', async () => {
    await authService.login({ email: 'admin@vital.dev', password: 'admin123' })

    const created = await projectService.create({
      name: 'Test Initiative',
      client: 'Test Client',
      status: 'planning',
      progress: 0,
    })
    expect(created.id).toMatch(/^prj_/)
    expect(created.status).toBe('planning')

    const updated = await projectService.update(created.id, {
      status: 'active',
      progress: 25,
    })
    expect(updated.status).toBe('active')
    expect(updated.progress).toBe(25)

    await projectService.remove(created.id)
    await expect(projectService.get(created.id)).rejects.toBeInstanceOf(ApiError)

    await authService.logout()
  })

  it('surfaces server-side field errors on duplicate name per client', async () => {
    await authService.login({ email: 'admin@vital.dev', password: 'admin123' })

    const existing = (await projectService.list({ page: 1, pageSize: 1 })).data[0]

    await expect(
      projectService.create({
        name: existing.name,
        client: existing.client,
        status: 'planning',
        progress: 0,
      }),
    ).rejects.toBeInstanceOf(ValidationError)

    await authService.logout()
  })
})

describe('invoices service (against mock API)', () => {
  it('lists invoices and applies the paid transition', async () => {
    await authService.login({ email: 'admin@vital.dev', password: 'admin123' })

    const list = await invoiceService.list({ page: 1, pageSize: 10 })
    expect(list.data).toHaveLength(10)
    expect(list.data[0]).toHaveProperty('number')

    const target = list.data.find((invoice) => invoice.status !== 'paid')
    expect(target).toBeDefined()
    if (!target) return

    const updated = await invoiceService.update(target.id, { status: 'paid' })
    expect(updated.status).toBe('paid')
    expect(updated.paidAt).not.toBeNull()

    await authService.logout()
  })

  it('rejects invalid status payloads', async () => {
    await authService.login({ email: 'admin@vital.dev', password: 'admin123' })

    await expect(
      // @ts-expect-error exercising runtime validation of a bad payload
      invoiceService.update('inv_0001', { status: 'teleported' }),
    ).rejects.toBeInstanceOf(ValidationError)

    await authService.logout()
  })
})
