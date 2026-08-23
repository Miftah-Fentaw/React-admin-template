export const NOTIFICATION_TYPES = ['info', 'success', 'warning', 'error'] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export interface AppNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
}
