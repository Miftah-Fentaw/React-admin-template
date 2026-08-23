import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Info,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/notifications/hooks/use-notifications'
import type { NotificationType } from '@/models/Notification'
import { formatRelativeTime } from '@/lib/format'
import { Button } from '../ui/Button'
import { DropdownMenu } from '../ui/DropdownMenu'
import { EmptyState } from '../ui/Feedback'

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
}

const TYPE_COLORS: Record<NotificationType, string> = {
  info: 'var(--info)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--destructive)',
}

/**
 * Topbar notifications panel: unread indicator, mark-one / mark-all read.
 * Server state comes from the notifications feature via TanStack Query.
 */
export function NotificationsMenu() {
  const { data: notifications, isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <DropdownMenu
      label="Notifications"
      align="end"
      panelClassName="notifications-panel"
      trigger={(triggerProps) => (
        <button
          type="button"
          className="icon-btn"
          style={{ position: 'relative' }}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread. Open panel`
              : 'Notifications. Open panel'
          }
          {...triggerProps}
        >
          <Bell size={17} aria-hidden="true" />
          {unreadCount > 0 && <span className="notification-dot" aria-hidden="true" />}
        </button>
      )}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 13px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <strong style={{ fontSize: '0.84rem' }}>Notifications</strong>
        <Button
          variant="ghost"
          size="sm"
          disabled={unreadCount === 0 || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          <CheckCheck size={14} aria-hidden="true" />
          Mark all read
        </Button>
      </div>

      {isLoading && (
        <p className="text-muted text-sm" style={{ padding: '16px 13px' }}>
          Loading…
        </p>
      )}

      {!isLoading && (notifications?.length ?? 0) === 0 && (
        <EmptyState
          compact
          icon={<Bell size={18} aria-hidden="true" />}
          title="You're all caught up"
          description="New notifications will appear here."
        />
      )}

      <ul aria-label="Notification list">
        {notifications?.map((notification) => {
          const Icon = TYPE_ICONS[notification.type]
          return (
            <li key={notification.id}>
              <button
                type="button"
                className={
                  notification.read
                    ? 'notifications-panel__item'
                    : 'notifications-panel__item notifications-panel__item--unread'
                }
                onClick={() => {
                  if (!notification.read) markRead.mutate(notification.id)
                }}
                title={notification.read ? undefined : 'Mark as read'}
              >
                <span
                  className="notifications-panel__icon"
                  style={{ color: TYPE_COLORS[notification.type] }}
                >
                  <Icon size={15} aria-hidden="true" />
                </span>
                <span>
                  <span className="notifications-panel__title">{notification.title}</span>
                  <span className="notifications-panel__message">
                    {notification.message}
                  </span>
                  <time
                    className="notifications-panel__time"
                    dateTime={notification.createdAt}
                  >
                    {formatRelativeTime(notification.createdAt)}
                    {!notification.read && ' · unread'}
                  </time>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </DropdownMenu>
  )
}
