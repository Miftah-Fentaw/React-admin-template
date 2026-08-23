import {
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export interface NavSection {
  id: string
  /** Omit for an unlabeled group. */
  label?: string
  items: NavItem[]
}

/**
 * Sidebar navigation is data-driven so adding a section or feature route is a
 * one-line change here — no layout component edits required.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'overview',
    items: [
      { label: 'Dashboard', to: '/', icon: LayoutDashboard },
      { label: 'Analytics', to: '/analytics', icon: BarChart3 },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    items: [
      { label: 'Users', to: '/users', icon: Users },
      { label: 'Products', to: '/products', icon: Package },
      { label: 'Orders', to: '/orders', icon: ShoppingCart },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [{ label: 'Settings', to: '/settings', icon: Settings }],
  },
]
