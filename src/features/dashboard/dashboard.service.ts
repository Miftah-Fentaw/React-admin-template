import type {
  ActivityEvent,
  DashboardMessage,
  DashboardOverview,
  DashboardProgram,
  DashboardStudent,
  ScheduleEvent,
} from '@/models/Dashboard'
import { apiClient } from '@/services/api/client'

/** Dashboard feature service — aggregates are computed server-side. */
export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const response = await apiClient.get<{ data: DashboardOverview }>(
      '/dashboard/overview',
    )
    return response.data
  },

  async getActivity(limit = 8): Promise<ActivityEvent[]> {
    const response = await apiClient.get<{ data: ActivityEvent[] }>(
      '/dashboard/activity',
      { query: { limit } },
    )
    return response.data
  },

  async getPrograms(): Promise<DashboardProgram[]> {
    const response = await apiClient.get<{ data: DashboardProgram[] }>(
      '/dashboard/programs',
    )
    return response.data
  },

  async getMessages(): Promise<DashboardMessage[]> {
    const response = await apiClient.get<{ data: DashboardMessage[] }>(
      '/dashboard/messages',
    )
    return response.data
  },

  async getSchedule(): Promise<ScheduleEvent[]> {
    const response = await apiClient.get<{ data: ScheduleEvent[] }>(
      '/dashboard/schedule',
    )
    return response.data
  },

  async getStudents(): Promise<DashboardStudent[]> {
    const response = await apiClient.get<{ data: DashboardStudent[] }>(
      '/dashboard/students',
    )
    return response.data
  },
}
