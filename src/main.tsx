import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { appConfig } from '@/config/app'
import '@/styles/index.css'

/**
 * Conditionally boot the mock API before the first render so every request —
 * including session restore — is intercepted. Disable with
 * `VITE_ENABLE_MOCK_API=false` to talk to a real backend.
 */
async function enableMocking(): Promise<void> {
  if (!appConfig.enableMockApi) return

  const { worker } = await import('@/data/mock-server/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: false,
  })
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
