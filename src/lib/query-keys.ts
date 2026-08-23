/**
 * Central TanStack Query key registry.
 * Keeping keys here avoids typos and makes invalidation predictable.
 */
import type { AnalyticsRange } from '@/models/Analytics'
import type { InvoicesQuery } from '@/models/Invoice'
import type { OrdersQuery } from '@/models/Order'
import type { ProductsQuery } from '@/models/Product'
import type { ProjectsQuery } from '@/models/Project'
import type { UsersQuery } from '@/models/User'

export const queryKeys = {
  profile: ['auth', 'me'] as const,

  dashboard: {
    overview: ['dashboard', 'overview'] as const,
    activity: ['dashboard', 'activity'] as const,
    programs: ['dashboard', 'programs'] as const,
    messages: ['dashboard', 'messages'] as const,
    schedule: ['dashboard', 'schedule'] as const,
    students: ['dashboard', 'students'] as const,
  },

  analytics: {
    overview: (range: AnalyticsRange) => ['analytics', 'overview', range] as const,
  },

  notifications: {
    all: ['notifications'] as const,
  },

  users: {
    all: ['users'] as const,
    list: (query: UsersQuery) => [...queryKeys.users.all, 'list', query] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },

  products: {
    all: ['products'] as const,
    list: (query: ProductsQuery) => [...queryKeys.products.all, 'list', query] as const,
    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
  },

  orders: {
    all: ['orders'] as const,
    list: (query: OrdersQuery) => [...queryKeys.orders.all, 'list', query] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
  },

  projects: {
    all: ['projects'] as const,
    list: (query: ProjectsQuery) => [...queryKeys.projects.all, 'list', query] as const,
    detail: (id: string) => [...queryKeys.projects.all, 'detail', id] as const,
  },

  invoices: {
    all: ['invoices'] as const,
    list: (query: InvoicesQuery) => [...queryKeys.invoices.all, 'list', query] as const,
    detail: (id: string) => [...queryKeys.invoices.all, 'detail', id] as const,
  },
} as const
