import { useNavigate } from 'react-router-dom'
import { LogOut, Monitor, Moon, MoonStar, Settings, Sun, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { DropdownMenu, type DropdownMenuItem } from '@/components/ui/DropdownMenu'
import { useAuth } from '@/app/providers/AuthProvider'
import { useTheme } from '@/app/providers/ThemeProvider'
import type { ThemePreference } from '@/app/providers/ThemeProvider'

/** Topbar user menu: profile links + sign out. */
export function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const items: DropdownMenuItem[] = [
    {
      label: 'Profile settings',
      icon: <UserRound size={15} aria-hidden="true" />,
      onSelect: () => void navigate('/settings'),
    },
    {
      label: 'Preferences',
      icon: <Settings size={15} aria-hidden="true" />,
      onSelect: () => void navigate('/settings'),
    },
    {
      label: 'Sign out',
      icon: <LogOut size={15} aria-hidden="true" />,
      tone: 'danger',
      onSelect: () => void logout(),
    },
  ]

  return (
    <DropdownMenu
      label="Account menu"
      align="end"
      items={items}
      trigger={(triggerProps) => (
        <button type="button" className="user-button" {...triggerProps}>
          <Avatar name={user.name} src={user.avatarUrl ?? undefined} size="md" />
          <span className="user-button__meta">
            <span className="user-button__name">{user.name}</span>
            <span className="user-button__role">{user.role}</span>
          </span>
        </button>
      )}
    />
  )
}

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string; icon: LucideIcon }> =
  [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

/** Theme preference dropdown (light / dark / follow system). */
export function ThemeMenu() {
  const { preference, setPreference } = useTheme()

  const ActiveIcon =
    THEME_OPTIONS.find((option) => option.value === preference)?.icon ?? MoonStar

  const items: DropdownMenuItem[] = THEME_OPTIONS.map((option) => ({
    label: option.value === preference ? `${option.label} (current)` : option.label,
    icon: <option.icon size={15} aria-hidden="true" />,
    onSelect: () => setPreference(option.value),
  }))

  return (
    <DropdownMenu
      label="Theme"
      align="end"
      items={items}
      trigger={(triggerProps) => (
        <button
          type="button"
          className="icon-btn"
          aria-label={`Theme preference: ${preference}. Open theme menu`}
          {...triggerProps}
        >
          <ActiveIcon size={17} aria-hidden="true" />
        </button>
      )}
    />
  )
}
