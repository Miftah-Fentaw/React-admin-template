import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, Search, RefreshCw, Settings } from 'lucide-react'
import { STORAGE_KEYS } from '@/config/app'
import { Sidebar } from './Sidebar'
import { ThemeMenu, UserMenu } from './UserMenu'
import { NotificationsMenu } from './NotificationsMenu'

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => window.localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === 'true',
  )
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const toggleCollapse = () => {
    setCollapsed((previous) => {
      const next = !previous
      try {
        window.localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, String(next))
      } catch {
        // Persistence unavailable.
      }
      return next
    })
  }

  return (
    <div className={`app-shell${mobileOpen ? ' app-shell--nav-open' : ''}`}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapse}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`main-area${collapsed ? ' main-area--collapsed' : ''}`}>
        <header className="topbar">
          <button
            type="button"
            className="icon-btn topbar__mobile-trigger"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <Menu size={18} aria-hidden="true" />
          </button>

          <div className="topbar__search" role="search">
            <Search size={14} className="topbar__search-icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search placeholder"
              className="topbar__search-input"
              aria-label="Search"
            />
          </div>

          <div className="topbar__actions">
            <button type="button" className="icon-btn" aria-label="Refresh" onClick={() => window.location.reload()}>
              <RefreshCw size={16} aria-hidden="true" />
            </button>
            <ThemeMenu />
            <button type="button" className="icon-btn" aria-label="Settings" onClick={() => {}}>
              <Settings size={16} aria-hidden="true" />
            </button>
            <span className="topbar__divider" aria-hidden="true" />
            <NotificationsMenu />
            <UserMenu />
          </div>
        </header>

        <main id="main-content" className="page" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
