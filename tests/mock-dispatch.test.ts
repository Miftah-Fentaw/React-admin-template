import { describe, expect, it } from 'vitest'
import { dispatchMockRequest } from '@/data/mock-server/dispatch'

/**
 * Pins the in-process mock path used by the hosted demo and `npm run preview`.
 * These requests never touch a Service Worker.
 */
describe('in-process mock dispatch', () => {
  it('serves dashboard overview JSON', async () => {
    const response = await dispatchMockRequest(
      new Request('http://localhost/api/dashboard/overview'),
    )

    expect(response).toBeDefined()
    expect(response!.ok).toBe(true)
    expect(response!.headers.get('content-type')).toMatch(/json/)

    const body = (await response!.json()) as { data: { kpis: unknown[] } }
    expect(body.data.kpis.length).toBeGreaterThan(0)
  })

  it('serves a paginated users list', async () => {
    const response = await dispatchMockRequest(
      new Request('http://localhost/api/users?page=1&pageSize=5'),
    )

    expect(response).toBeDefined()
    expect(response!.ok).toBe(true)

    const body = (await response!.json()) as { data: unknown[]; meta: { total: number } }
    expect(body.data).toHaveLength(5)
    expect(body.meta.total).toBeGreaterThan(5)
  })

  it('returns undefined for unhandled routes', async () => {
    const response = await dispatchMockRequest(
      new Request('http://localhost/api/does-not-exist'),
    )
    expect(response).toBeUndefined()
  })
})
