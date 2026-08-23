import type { AnalyticsRange } from '@/models/Analytics'
import type { AnalyticsOverview } from '@/models/Analytics'
import { apiClient } from '@/services/api/client'

/** Analytics feature service. */
export const analyticsService = {
  async getOverview(range: AnalyticsRange): Promise<AnalyticsOverview> {
    const response = await apiClient.get<{ data: AnalyticsOverview }>(
      '/analytics/overview',
      {
        query: { range },
      },
    )
    return response.data
  },
}
