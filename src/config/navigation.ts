import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  Package,
  ReceiptText,
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
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    items: [
      { label: 'Users', to: '/dashboard/users', icon: Users },
      { label: 'Products', to: '/dashboard/products', icon: Package },
      { label: 'Orders', to: '/dashboard/orders', icon: ShoppingCart },
      { label: 'Projects', to: '/dashboard/projects', icon: FolderKanban },
      { label: 'Invoices', to: '/dashboard/invoices', icon: ReceiptText },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [{ label: 'Settings', to: '/dashboard/settings', icon: Settings }],
  },
]
