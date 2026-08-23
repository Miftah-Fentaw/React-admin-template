import type { ActivityEvent, DashboardOverview } from '@/models/Dashboard'
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
      {
        query: { limit },
      },
    )
    return response.data
  },
}
