import type { AppNotification } from '@/models/Notification'
import { apiClient } from '@/services/api/client'

/** Notification feature service. */
export const notificationService = {
  async list(): Promise<AppNotification[]> {
    const response = await apiClient.get<{ data: AppNotification[] }>('/notifications')
    return response.data
  },

  async markRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/${id}/read`)
  },

  async markAllRead(): Promise<void> {
    await apiClient.post('/notifications/read-all')
  },
}
