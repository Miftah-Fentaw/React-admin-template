/**
 * Central runtime configuration. Values come from Vite env variables
 * (see `.env.example`) with sensible defaults so `npm run dev` works
 * out of the box.
 */

/** Blank host env vars (common on Vercel) must fall back to the mock prefix. */
export function resolveApiBaseUrl(value: string | undefined): string {
  return (value ?? '').trim() || '/api'
}

export const appConfig = {
  name: 'Vital Admin',
  version: '1.0.0',

  /**
   * Base URL every API request is resolved against. Keep `/api` when running
   * against the mock server; point it at your real backend to go live.
   */
  apiBaseUrl: resolveApiBaseUrl(import.meta.env.VITE_API_URL),

  /**
   * When true, the MSW browser worker intercepts all requests and serves the
   * mock database. Set `VITE_ENABLE_MOCK_API=false` to disable.
   */
  enableMockApi: import.meta.env.VITE_ENABLE_MOCK_API !== 'false',

  /**
   * Demo credentials accepted by the mock auth handler, rendered as a hint on
   * the login screen. Irrelevant once the mock API is disabled.
   */
  demoAccounts: [
    { email: 'admin@vital.dev', password: 'admin123', role: 'Admin' },
    { email: 'manager@vital.dev', password: 'manager123', role: 'Manager' },
  ],
} as const

export const STORAGE_KEYS = {
  authSession: 'vital.auth.session',
  theme: 'vital.theme',
  sidebarCollapsed: 'vital.sidebar.collapsed',
} as const
