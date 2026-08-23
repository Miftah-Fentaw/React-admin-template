import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Car,
  HandHeart,
  LayoutDashboard,
  Plane,
  Settings,
  Sparkles,
  Users,
  Utensils,
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
      { label: 'Daycare', to: '/', icon: LayoutDashboard },
      { label: 'Analytics', to: '/analytics', icon: BarChart3 },
    ],
  },
  {
    id: 'verticals',
    label: 'Other Verticals',
    items: [
      { label: 'Flight Booking', to: '/users', icon: Plane },
      { label: 'Car Rental', to: '/products', icon: Car },
      { label: 'Recruitment', to: '/orders', icon: Briefcase },
      { label: 'Restaurant', to: '/users', icon: Utensils },
      { label: 'Library', to: '/users', icon: BookOpen },
      { label: 'HR', to: '/users', icon: Users },
      { label: 'Crowdfunding', to: '/users', icon: HandHeart },
      { label: 'Real Estate', to: '/users', icon: Building2 },
      { label: 'Beauty Clinic', to: '/users', icon: Sparkles },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [{ label: 'Settings', to: '/settings', icon: Settings }],
  },
]
