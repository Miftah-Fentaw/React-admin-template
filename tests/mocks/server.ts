import { setupServer } from 'msw/node'
import { handlers } from '@/data/mock-server/handlers'

/**
 * Reuses the exact same request handlers as the browser mock API, so service
 * tests exercise the real contracts the app ships with.
 */
export const server = setupServer(...handlers)
