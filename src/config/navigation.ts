import {
  BarChart3,
  FolderKanban,
  Globe,
  LayoutDashboard,
  LogIn,
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
  /** When true, only this exact path is active (not nested routes). */
  end?: boolean
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
    label: 'Overview',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true },
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
  {
    id: 'pages',
    label: 'Pages',
    items: [
      { label: 'Landing', to: '/', icon: Globe, end: true },
      { label: 'Sign in', to: '/login', icon: LogIn },
    ],
  },
]
