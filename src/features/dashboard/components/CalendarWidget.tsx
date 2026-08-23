import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ScheduleEvent } from '@/models/Dashboard'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface CalendarWidgetProps {
  events?: ScheduleEvent[]
}

export function CalendarWidget({ events = [] }: CalendarWidgetProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  // Days with events (set of "YYYY-MM-DD" strings)
  const eventDays = new Set(
    events.map((e) => e.date.slice(0, 10)),
  )

  // Build the 6×7 grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells: { day: number; currentMonth: boolean; date: string }[] = []

  // Leading days from prev month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const prevMonthNum = month === 0 ? 12 : month
    const prevYear = month === 0 ? year - 1 : year
    cells.push({
      day: d,
      currentMonth: false,
      date: `${prevYear}-${String(prevMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      currentMonth: true,
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    })
  }

  // Trailing days from next month
  const remainder = 42 - cells.length
  const nextMonthNum = month === 11 ? 1 : month + 2
  const nextYear = month === 11 ? year + 1 : year
  for (let d = 1; d <= remainder; d++) {
    cells.push({
      day: d,
      currentMonth: false,
      date: `${nextYear}-${String(nextMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    })
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="calendar-widget">
      <div className="calendar-widget__header">
        <span className="calendar-widget__title">
          {MONTH_NAMES[month]}, {year}
        </span>
        <div className="calendar-widget__nav">
          <button
            type="button"
            className="calendar-widget__nav-btn"
            onClick={prevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="calendar-widget__nav-btn"
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="calendar-widget__grid" role="grid" aria-label={`Calendar for ${MONTH_NAMES[month]} ${year}`}>
        {DAY_NAMES.map((name) => (
          <div key={name} className="calendar-widget__day-name" role="columnheader">
            {name}
          </div>
        ))}
        {cells.map((cell) => {
          const isToday = cell.date === todayStr
          const hasEvent = eventDays.has(cell.date)
          return (
            <div
              key={cell.date}
              role="gridcell"
              aria-label={`${cell.day}${isToday ? ', today' : ''}${hasEvent ? ', has event' : ''}`}
              className={[
                'calendar-widget__day',
                !cell.currentMonth ? 'calendar-widget__day--other-month' : '',
                isToday ? 'calendar-widget__day--today' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="calendar-widget__day-num">{cell.day}</span>
              {hasEvent && cell.currentMonth && (
                <span className="calendar-widget__event-dot" aria-hidden="true" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
