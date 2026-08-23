import type { AuthUser } from '@/models/User'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: AuthUser
  token: string
}

export interface UpdateProfileInput {
  name: string
  email: string
}
