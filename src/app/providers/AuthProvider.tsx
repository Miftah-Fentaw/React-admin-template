import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { LoginRequest } from '@/models/Auth'
import type { AuthUser } from '@/models/User'
import { authService } from '@/services/auth/auth.service'
import { storage } from '@/services/storage/storage'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<AuthUser>
  logout: () => Promise<void>
  setUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Application-wide session state.
 *
 * ⚠️ Demo-grade security only. The token is an opaque mock value stored in
 * localStorage. For production, swap `authService` for your identity
 * provider (JWT refresh flow, httpOnly cookie sessions, OAuth, Supabase,
 * Firebase…) — the UI contract stays identical. See README → Authentication.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUserState] = useState<AuthUser | null>(null)

  // Restore an existing session on first load.
  useEffect(() => {
    let cancelled = false

    const restore = async () => {
      const hasToken = storage.readSession() !== null
      if (!hasToken) {
        setStatus('unauthenticated')
        return
      }
      try {
        const profile = await authService.getProfile()
        if (cancelled) return
        if (profile) {
          setUserState(profile)
          setStatus('authenticated')
        } else {
          setStatus('unauthenticated')
        }
      } catch {
        if (cancelled) return
        authService.clearSession()
        setStatus('unauthenticated')
      }
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authService.login(credentials)
    setUserState(response.user)
    setStatus('authenticated')
    return response.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setUserState(null)
      setStatus('unauthenticated')
    }
  }, [])

  const setUser = useCallback((next: AuthUser) => {
    setUserState(next)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === 'authenticated',
      login,
      logout,
      setUser,
    }),
    [status, user, login, logout, setUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
