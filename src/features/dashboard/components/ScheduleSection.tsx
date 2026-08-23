import type { ScheduleEvent } from '@/models/Dashboard'
import { Skeleton } from '@/components/ui/Skeleton'

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface ScheduleSectionProps {
  events: ScheduleEvent[] | undefined
}

export function ScheduleSection({ events }: ScheduleSectionProps) {
  if (!events) {
    return (
      <div className="schedule-section__loading">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="schedule-item schedule-item--skeleton">
            <Skeleton style={{ width: 44, height: 52, borderRadius: 'var(--radius-sm)' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton style={{ width: '75%' }} />
              <Skeleton style={{ width: '45%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return <p className="text-muted text-sm" style={{ padding: '8px 0' }}>No events scheduled this week.</p>
  }

  return (
    <ol className="schedule-list">
      {events.map((event) => {
        const date = new Date(event.date)
        const dayNum = date.getUTCDate()
        const monthAbbr = MONTH_ABBR[date.getUTCMonth()]
        return (
          <li key={event.id} className="schedule-item">
            <div className={`schedule-item__badge schedule-item__badge--${event.colorToken}`}>
              <span className="schedule-item__badge-day">{dayNum}</span>
              <span className="schedule-item__badge-month">{monthAbbr}</span>
            </div>
            <div className="schedule-item__body">
              <p className="schedule-item__time">{event.time}</p>
              <p className="schedule-item__title">{event.title}</p>
              <span className="schedule-item__tag">{event.category}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
