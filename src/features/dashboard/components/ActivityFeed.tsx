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
        return (
          <li key={event.id} className="activity-feed__item">
            <span className="activity-feed__dot" aria-hidden="true">
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
