import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { appConfig } from '@/config/app'
import '@/styles/index.css'

/**
 * Preload the in-process mock and drop leftover MSW workers before render.
 * The HTTP client loads the same handlers on demand; this just warms the
 * chunk and clears Service Workers from earlier deploys.
 */
async function enableMocking(): Promise<void> {
  await unregisterMockServiceWorkers()

  if (!appConfig.enableMockApi) return

  await import('@/data/mock-server/dispatch')
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
