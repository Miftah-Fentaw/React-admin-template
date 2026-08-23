import type { TrafficSource } from '@/models/Dashboard'
import { formatNumber } from '@/lib/format'
import { Skeleton } from '@/components/ui/Skeleton'

export function TrafficSources({ sources }: { sources: TrafficSource[] | undefined }) {
  if (!sources) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index}>
            <Skeleton style={{ width: '60%' }} />
            <Skeleton style={{ height: 5, marginTop: 8 }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <ul className="traffic-list">
      {sources.map((source) => (
        <li key={source.source}>
          <div className="traffic-list__row">
            <span>{source.source}</span>
            <span className="text-muted tabular">
              {formatNumber(source.visits)} · {source.share}%
            </span>
          </div>
          <span className="traffic-list__bar" role="presentation">
            <span className="traffic-list__fill" style={{ width: `${source.share}%` }} />
          </span>
        </li>
      ))}
    </ul>
  )
}
