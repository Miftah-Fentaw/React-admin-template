import { Link } from 'react-router-dom'
import { Package, Plus, ShoppingCart, UserPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface QuickAction {
  label: string
  to: string
  icon: LucideIcon
}

const ACTIONS: QuickAction[] = [
  { label: 'Add user', to: '/users?create=1', icon: UserPlus },
  { label: 'New product', to: '/products?create=1', icon: Plus },
  { label: 'View orders', to: '/orders', icon: ShoppingCart },
  { label: 'Inventory', to: '/products', icon: Package },
]

/** Shortcut tiles for the most common admin tasks. */
export function QuickActions() {
  return (
    <nav aria-label="Quick actions" className="quick-actions">
      {ACTIONS.map((action) => (
        <Link key={action.label} to={action.to} className="quick-action">
          <span className="quick-action__icon">
            <action.icon size={15} aria-hidden="true" />
          </span>
          {action.label}
        </Link>
      ))}
    </nav>
  )
}
