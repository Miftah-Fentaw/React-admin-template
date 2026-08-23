import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * The browser service worker. Started conditionally in `src/main.tsx`
 * based on `VITE_ENABLE_MOCK_API`.
 */
export const worker = setupWorker(...handlers)
