import { useState, type ReactNode } from 'react'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Query } from '@tanstack/react-query'
import { ApiError } from '@/services/api/errors'
import { authService } from '@/services/auth/auth.service'
import { ToastProvider } from '@/components/feedback/ToastProvider'
import { AuthProvider } from './AuthProvider'
import { ThemeProvider } from './ThemeProvider'

/**
 * Composes every global provider:
 *
 *   QueryClient (server state)
 *     └── Toast
 *           └── Theme
 *                 └── Auth
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: handleQueryError,
        }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Never retry client errors; retry transient/server errors once.
              if (
                error instanceof ApiError &&
                error.status >= 400 &&
                error.status < 500
              ) {
                return false
              }
              return failureCount < 1
            },
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}

/**
 * Global handler for failed queries. An expired/invalid session redirects to
 * login after clearing local state — a hard navigation guarantees all cached
 * server data from the dead session is dropped.
 */
/** Loosest query shape accepted by QueryCache's onError hook. */
type CacheQuery = Query<unknown, unknown, unknown, readonly unknown[]>

function handleQueryError(error: Error, query: CacheQuery): void {
  const isAuthRequest = Array.isArray(query.queryKey) && query.queryKey[0] === 'auth'
  if (
    !isAuthRequest &&
    error instanceof ApiError &&
    error.status === 401 &&
    window.location.pathname !== '/login'
  ) {
    authService.clearSession()
    window.location.assign('/login')
  }
}
