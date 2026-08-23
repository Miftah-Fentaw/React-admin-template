import { formatRelativeTime, initials } from '@/lib/format'
import type { ActivityEvent } from '@/models/Dashboard'
import { Skeleton } from '@/components/ui/Skeleton'

const ACTION_PAST_TENSE: Record<ActivityEvent['action'], string> = {
  created: 'created',
  updated: 'updated',
  deleted: 'deleted',
  signed_in: 'signed in to',
  placed_order: 'placed',
}

/** Maps activity event titles/actions to a CSS color variable for the dot badge. */
function getDotColor(event: ActivityEvent): string {
  const title = event.title?.toLowerCase() ?? ''
  if (title.includes('check-in') || title.includes('enrollment') || title.includes('report')) {
    return 'var(--chart-1)'
  }
  if (title.includes('message') || title.includes('schedule') || title.includes('updated')) {
    return 'var(--chart-2)'
  }
  return 'var(--primary-subtle)'
}

function getDotTextColor(event: ActivityEvent): string {
  const title = event.title?.toLowerCase() ?? ''
  if (title.includes('check-in') || title.includes('enrollment') || title.includes('report')) {
    return '#fff'
  }
  if (title.includes('message') || title.includes('schedule') || title.includes('updated')) {
    return '#fff'
  }
  return 'var(--primary-subtle-foreground)'
}

export function ActivityFeed({ events }: { events: ActivityEvent[] | undefined }) {
  if (!events) {
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '8px 20px' }}
      >
        {[0, 1, 2, 3].map((index) => (
          <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Skeleton style={{ width: 31, height: 31, borderRadius: '50%' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <Skeleton style={{ width: '80%' }} />
              <Skeleton style={{ width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ol className="activity-feed">
      {events.map((event) => {
        const displayTitle =
          event.title ??
          `${event.actorName} ${ACTION_PAST_TENSE[event.action]} ${event.target}`
        const dotBg = getDotColor(event)
        const dotColor = getDotTextColor(event)
        return (
          <li key={event.id} className="activity-feed__item">
            <span
              className="activity-feed__dot"
              aria-hidden="true"
              style={{ background: dotBg, color: dotColor }}
            >
              {initials(event.actorName)}
            </span>
            <div className="activity-feed__text">
              <span className="activity-feed__action">{displayTitle}</span>
              {event.description && (
                <span className="activity-feed__description">{event.description}</span>
              )}
              <time className="activity-feed__time" dateTime={event.createdAt}>
                {formatRelativeTime(event.createdAt)}
              </time>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
