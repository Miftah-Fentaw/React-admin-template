import type { AuthUser } from '@/models/User'
import type { LoginRequest, LoginResponse, UpdateProfileInput } from '@/models/Auth'
import { apiClient, setAuthTokenReader } from '@/services/api/client'
import { storage } from '@/services/storage/storage'

/**
 * Auth service.
 *
 * ⚠️  This is a *demo* implementation: the mock server issues opaque tokens
 * and nothing is cryptographically verified. Replace these four calls with
 * your real identity provider (JWT, cookie sessions, OAuth, Supabase,
 * Firebase, …) — see README → "Authentication".
 */
export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials, {
      authenticated: false,
    })
    storage.writeSession({ token: response.token })
    setAuthTokenReader(() => storage.readSession()?.token ?? null)
    return response
  },

  /** Fetch the signed-in user. Returns `null` when no valid session exists. */
  async getProfile(): Promise<AuthUser | null> {
    try {
      const { user } = await apiClient.get<{ user: AuthUser }>('/auth/me')
      return user
    } catch (error) {
      if ((error as { status?: number }).status === 401) {
        this.clearSession()
        return null
      }
      throw error
    }
  },

  async updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
    const { user } = await apiClient.patch<{ user: AuthUser }>('/auth/me', input)
    return user
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post<void>('/auth/logout')
    } finally {
      this.clearSession()
    }
  },

  clearSession(): void {
    storage.clearSession()
  },

  restoreTokenReader(): void {
    setAuthTokenReader(() => storage.readSession()?.token ?? null)
  },
}

// Wire up the token reader on module load so the very first request
// (`/auth/me` during session restore) already carries the token.
authService.restoreTokenReader()
