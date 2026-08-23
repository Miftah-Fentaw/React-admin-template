/**
 * Central runtime configuration. Values come from Vite env variables
 * (see `.env.example`) with sensible defaults so `npm run dev` works
 * out of the box.
 */

export const appConfig = {
  name: 'Vantage Admin',
  version: '1.0.0',

  /**
   * Base URL every API request is resolved against. Keep `/api` when running
   * against the mock server; point it at your real backend to go live.
   */
  apiBaseUrl: import.meta.env.VITE_API_URL ?? '/api',

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
    { email: 'admin@vantage.dev', password: 'admin123', role: 'Admin' },
    { email: 'manager@vantage.dev', password: 'manager123', role: 'Manager' },
  ],
} as const

export const STORAGE_KEYS = {
  authSession: 'vantage.auth.session',
  theme: 'vantage.theme',
  sidebarCollapsed: 'vantage.sidebar.collapsed',
} as const
