import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { appConfig } from '@/config/app'
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
          <span className="sidebar__logo" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path
                d="M9 20.5 16 8.5l7 12"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="21.5" r="1.9" fill="currentColor" />
            </svg>
          </span>
          <span className="sidebar__title">{appConfig.name}</span>
        </div>

        <nav className="sidebar__nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.id}>
              {section.label && !collapsed && (
                <p className="sidebar__section-label">{section.label}</p>
              )}
              <ul className="sidebar__list">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        cn('sidebar__link', isActive && 'sidebar__link--active')
                      }
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon size={17} aria-hidden="true" />
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
