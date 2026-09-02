import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NAV_SECTIONS } from '@/config/navigation'
import { cn } from '@/lib/cn'

export interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

/**
 * Responsive sidebar: persistent + collapsible ≥1025px, off-canvas drawer
 * below that. Navigation content is driven by `NAV_SECTIONS`.
 */
export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div className="sidebar__backdrop" onClick={onCloseMobile} aria-hidden="true" />
      )}
      <aside
        className={cn('sidebar', collapsed && 'sidebar--collapsed')}
        data-mobile-open={mobileOpen || undefined}
        aria-label="Main navigation"
      >
        <div className="sidebar__header">
          <span className="sidebar__mark" aria-hidden="true">
            V
          </span>
          {!collapsed && (
            <span className="sidebar__text-logo" aria-label="Vital Admin">
              <span className="sidebar__text-logo-brand">Vital</span>{' '}
              <span className="sidebar__text-logo-sub">Admin</span>
            </span>
          )}
        </div>

        <nav className="sidebar__nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.id} className="sidebar__section">
              {section.label && !collapsed && (
                <p className="sidebar__section-label">{section.label}</p>
              )}
              <ul className="sidebar__list">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn('sidebar__link', isActive && 'sidebar__link--active')
                      }
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="sidebar__link-icon">
                        <item.icon size={16} aria-hidden="true" />
                      </span>
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button
            type="button"
            className="sidebar__collapse-btn"
            onClick={onToggleCollapse}
            aria-pressed={collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen size={16} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={16} aria-hidden="true" />
            )}
            <span>Collapse</span>
          </button>
        </div>
      </aside>
    </>
  )
}
