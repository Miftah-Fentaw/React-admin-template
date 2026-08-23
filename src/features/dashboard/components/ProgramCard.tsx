import { useState } from 'react'
import { Clock, Calendar } from 'lucide-react'
import type { DashboardProgram } from '@/models/Dashboard'
import { formatCurrency } from '@/lib/format'

export function ProgramCard({ program }: { program: DashboardProgram }) {
  const [imgError, setImgError] = useState(false)

  return (
    <article className="program-card">
      <div className="program-card__img-wrap">
        {imgError || !program.imageUrl ? (
          <div className="program-card__img-placeholder" aria-label={program.name}>
            {program.name.charAt(0)}
          </div>
        ) : (
          <img
            src={program.imageUrl}
            alt={program.name}
            className="program-card__img"
            onError={() => setImgError(true)}
          />
        )}
        <span className="program-card__age-badge">{program.ageRange}</span>
      </div>
      <div className="program-card__body">
        <p className="program-card__name">{program.name}</p>
        <p className="program-card__category">{program.category}</p>
        <div className="program-card__meta">
          <span className="program-card__meta-item">
            <Calendar size={11} aria-hidden="true" />
            {program.dateRange}
          </span>
          <span className="program-card__meta-item">
            <Clock size={11} aria-hidden="true" />
            {program.startTime}
          </span>
          <span className="program-card__price">{formatCurrency(program.price)}</span>
        </div>
      </div>
    </article>
  )
}
