import type { CreateProjectPayload, UpdateProjectPayload } from '@/models/schemas'
import type { Project, ProjectsQuery } from '@/models/Project'
import { apiClient } from '@/services/api/client'
import type { Paginated } from '@/types/api'

/**
 * Project feature service — the ONLY place the projects feature talks HTTP.
 * Swap the backend by changing this file (usually not even necessary,
 * since it follows the shared API contract).
 */
export const projectService = {
  list(query: ProjectsQuery = {}): Promise<Paginated<Project>> {
    return apiClient.get<Paginated<Project>>('/projects', { query })
  },

  async get(id: string): Promise<Project> {
    const response = await apiClient.get<{ data: Project }>(`/projects/${id}`)
    return response.data
  },

  async create(input: CreateProjectPayload): Promise<Project> {
    const response = await apiClient.post<{ data: Project }>('/projects', input)
    return response.data
  },

  async update(id: string, input: UpdateProjectPayload): Promise<Project> {
    const response = await apiClient.patch<{ data: Project }>(`/projects/${id}`, input)
    return response.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete<void>(`/projects/${id}`)
  },
}
