import type { AppNotification } from '@/models/Notification'
import type { ActivityEvent } from '@/models/Dashboard'
import type { Order } from '@/models/Order'
import type { Product } from '@/models/Product'
import type { User } from '@/models/User'

/**
 * In-memory mock database.
 *
 * Records are loaded once from the JSON seeds in `src/data/db` and then live
 * in memory for the browser session — CRUD operations mutate these arrays,
 * giving the mock API real state like a backend would.
 *
 * ⚠️ Only the mock server may import from here. UI code must go through
 * feature services so it works unchanged against a real backend.
 */
import usersSeed from '@/data/db/users.json'
import productsSeed from '@/data/db/products.json'
import ordersSeed from '@/data/db/orders.json'
import notificationsSeed from '@/data/db/notifications.json'
import activitySeed from '@/data/db/activity.json'

/** The account behind the pinned demo login `admin@vantage.dev`. */
export const ADMIN_ID = 'usr_0001'

let seq = 10_000

export const db = {
  users: usersSeed as unknown as User[],
  products: productsSeed as unknown as Product[],
  orders: ordersSeed as unknown as Order[],
  notifications: notificationsSeed as unknown as AppNotification[],
  activity: activitySeed as unknown as ActivityEvent[],

  /** Monotonic id generator for created records. */
  nextId(prefix: string): string {
    seq += 1
    return `${prefix}_${seq}`
  },

  reset(): void {
    db.users = usersSeed as unknown as User[]
    db.products = productsSeed as unknown as Product[]
    db.orders = ordersSeed as unknown as Order[]
    db.notifications = notificationsSeed as unknown as AppNotification[]
    db.activity = activitySeed as unknown as ActivityEvent[]
    seq = 10_000
  },
}

/** Issued bearer tokens for the current session (`token -> userId`). */
export const tokenStore = new Map<string, string>()
