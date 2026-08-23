import { http, HttpResponse } from 'msw'
import type { AppNotification } from '@/models/Notification'
import { db } from '../db'
import { getAuthUserId, latency, notFound, unauthorized } from '../utils'

export const notificationsHandlers = [
  http.get('*/notifications', async ({ request }) => {
    await latency(120, 320)
    if (!getAuthUserId(request)) return unauthorized()

    const items: AppNotification[] = [...db.notifications].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1,
    )

    return HttpResponse.json({ data: items })
  }),

  http.post('*/notifications/:id/read', async ({ request, params }) => {
    await latency(80, 220)
    if (!getAuthUserId(request)) return unauthorized()

    const { id } = params as { id: string }
    const notification = db.notifications.find((n) => n.id === id)
    if (!notification) return notFound('notification')

    notification.read = true

    return HttpResponse.json({ data: notification })
  }),

  http.post('*/notifications/read-all', async ({ request }) => {
    await latency(100, 260)
    if (!getAuthUserId(request)) return unauthorized()

    for (const notification of db.notifications) {
      notification.read = true
    }

    return new HttpResponse(null, { status: 204 })
  }),
]
