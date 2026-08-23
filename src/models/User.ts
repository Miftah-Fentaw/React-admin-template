import type { ListQuery } from '@/types/api'

export const USER_ROLES = ['admin', 'manager', 'member', 'viewer'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const USER_STATUSES = ['active', 'invited', 'suspended'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  avatarUrl?: string | null
  /** ISO date-time of the user's most recent sign-in, `null` if never. */
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

/** The authenticated principal returned by `/api/auth/*` endpoints. */
export type AuthUser = User

export interface CreateUserInput {
  name: string
  email: string
  role: UserRole
  status?: UserStatus
}

export type UpdateUserInput = Partial<CreateUserInput>

export interface UsersQuery extends ListQuery {
  role?: UserRole | 'all'
  status?: UserStatus | 'all'
}
