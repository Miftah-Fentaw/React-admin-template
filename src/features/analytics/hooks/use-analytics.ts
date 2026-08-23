import { useQuery } from '@tanstack/react-query'
import type { AnalyticsRange } from '@/models/Analytics'
import { queryKeys } from '@/lib/query-keys'
import { analyticsService } from '../analytics.service'

export function useAnalyticsOverview(range: AnalyticsRange) {
  return useQuery({
    queryKey: queryKeys.analytics.overview(range),
    queryFn: () => analyticsService.getOverview(range),
    placeholderData: (previous) => previous,
  })
}
