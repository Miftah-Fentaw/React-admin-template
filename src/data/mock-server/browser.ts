import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * Optional browser Service Worker. The app boots the mock API in-process
 * (`dispatch.ts`) so the hosted demo and `npm run preview` work without it.
 * Keep this file for local experiments (`worker.start()`) and for
 * `npx msw init public/` worker generation.
 */
export const worker = setupWorker(...handlers)
