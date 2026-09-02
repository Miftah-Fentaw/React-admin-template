import { getResponse } from 'msw'
import { handlers } from './handlers'

/**
 * Resolve a request against the mock handlers in-process.
 *
 * Static hosts (Vercel, preview, GitHub Pages) cannot serve `/api/*`, and the
 * MSW Service Worker often activates *after* the first React Query fetches.
 * Those first calls then receive HTML and the whole dashboard errors.
 *
 * Running the same handlers here — no Service Worker — means the live demo
 * and `npm run preview` show mock data on the first paint. Tests still use
 * `msw/node` via `setupServer`.
 */
export function dispatchMockRequest(request: Request): Promise<Response | undefined> {
  return getResponse(handlers, request)
}
