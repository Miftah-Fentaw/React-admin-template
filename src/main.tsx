import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { appConfig } from '@/config/app'
import { setMockDispatcher } from '@/services/api/client'
import '@/styles/index.css'

/**
 * Install the in-process mock API before the first render so every request —
 * including session restore — is served from the seeded handlers. Disable
 * with `VITE_ENABLE_MOCK_API=false` to talk to a real backend.
 *
 * We do **not** start the MSW Service Worker for the live app. On static
 * hosts the worker activates after the first fetches, those calls hit the
 * SPA fallback (HTML), and every widget errors. `getResponse()` in
 * `dispatch.ts` is the same handlers, without that race.
 */
async function enableMocking(): Promise<void> {
  await unregisterMockServiceWorkers()

  if (!appConfig.enableMockApi) return

  const { dispatchMockRequest } = await import('@/data/mock-server/dispatch')
  setMockDispatcher(dispatchMockRequest)
}

/** Drop leftover MSW workers from earlier deploys so they cannot intercept. */
async function unregisterMockServiceWorkers(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(
    registrations
      .filter((registration) => {
        const script =
          registration.active?.scriptURL ??
          registration.waiting?.scriptURL ??
          registration.installing?.scriptURL ??
          ''
        return script.includes('mockServiceWorker.js')
      })
      .map((registration) => registration.unregister()),
  )
}

void enableMocking().then(() => {
  const container = document.getElementById('root')
  if (!container) throw new Error('Root element #root not found')

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
