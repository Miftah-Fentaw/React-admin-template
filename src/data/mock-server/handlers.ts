import type { HttpHandler } from 'msw'
import { analyticsHandlers } from './handlers/analytics.handlers'
import { authHandlers } from './handlers/auth.handlers'
import { dashboardHandlers } from './handlers/dashboard.handlers'
import { notificationsHandlers } from './handlers/notifications.handlers'
import { ordersHandlers } from './handlers/orders.handlers'
import { productsHandlers } from './handlers/products.handlers'
import { usersHandlers } from './handlers/users.handlers'

/**
 * The full mock API surface. Add new feature handlers here.
 */
export const handlers: HttpHandler[] = [
  ...authHandlers,
  ...usersHandlers,
  ...productsHandlers,
  ...ordersHandlers,
  ...dashboardHandlers,
  ...analyticsHandlers,
  ...notificationsHandlers,
]
