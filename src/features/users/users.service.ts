import type { CreateUserPayload, UpdateUserPayload } from '@/models/schemas'
import type { UpdateProfileInput } from '@/models/Auth'
import type { User, UsersQuery } from '@/models/User'
import { apiClient } from '@/services/api/client'
import type { Paginated } from '@/types/api'

/**
 * User feature service — the ONLY place the users feature talks HTTP.
 * Swap the backend by changing this file (usually not even necessary,
 * since it follows the shared API contract).
 */
export const userService = {
  list(query: UsersQuery = {}): Promise<Paginated<User>> {
    return apiClient.get<Paginated<User>>('/users', { query })
  },

  async get(id: string): Promise<User> {
    const response = await apiClient.get<{ data: User }>(`/users/${id}`)
    return response.data
  },

  async create(input: CreateUserPayload): Promise<User> {
    const response = await apiClient.post<{ data: User }>('/users', input)
    return response.data
  },

  async update(id: string, input: UpdateUserPayload | UpdateProfileInput): Promise<User> {
    const response = await apiClient.patch<{ data: User }>(`/users/${id}`, input)
    return response.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete<void>(`/users/${id}`)
  },
}
