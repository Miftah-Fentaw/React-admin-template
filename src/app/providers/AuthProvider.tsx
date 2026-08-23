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

const DEFAULT_USER: AuthUser = {
  id: 'usr_0001',
  name: 'Alex Morgan',
  email: 'admin@vital.dev',
  role: 'admin',
  status: 'active',
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

/**
 * Application-wide session state for template mode.
 * Automatically authenticated with mock user Alex Morgan.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('authenticated')
  const [user, setUserState] = useState<AuthUser | null>(DEFAULT_USER)

  useEffect(() => {
    let cancelled = false

    const restore = async () => {
      try {
        const profile = await authService.getProfile()
        if (cancelled) return
        if (profile) {
          setUserState(profile)
        }
      } catch {
        if (!cancelled) {
          setUserState(DEFAULT_USER)
        }
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
      setUserState(DEFAULT_USER)
      setStatus('authenticated')
    }
  }, [])

  const setUser = useCallback((next: AuthUser) => {
    setUserState(next)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: true,
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
