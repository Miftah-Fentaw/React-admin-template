import type { ListQuery } from '@/types/api'

export const PROJECT_STATUSES = [
  'planning',
  'active',
  'on_hold',
  'completed',
  'archived',
] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export interface Project {
  id: string
  name: string
  client: string
  ownerName: string
  status: ProjectStatus
  /** Completion percentage, 0–100. */
  progress: number
  /** ISO date (YYYY-MM-DD) or null when unscheduled. */
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateProjectInput {
  name: string
  client: string
  ownerName?: string
  status?: ProjectStatus
  progress?: number
  dueDate?: string | null
}

export type UpdateProjectInput = Partial<CreateProjectInput>

export interface ProjectsQuery extends ListQuery {
  status?: ProjectStatus | 'all'
}
