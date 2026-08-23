import type { ReactNode } from 'react'
import { useMatches } from 'react-router-dom'
import { Breadcrumbs } from '../ui/Breadcrumbs'

export interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

interface RouteHandle {
  crumb?: string
}

/**
 * Consistent page scaffolding: breadcrumb trail (derived from route
 * `handle.crumb` values), title, optional description and action buttons.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  const matches = useMatches() as Array<{ handle: unknown; pathname: string }>

  const crumbs = matches
    .map((match) => {
      const handle = match.handle as RouteHandle | undefined
      return handle?.crumb ? { label: handle.crumb, to: match.pathname } : null
    })
    .filter((crumb): crumb is { label: string; to: string } => crumb !== null)

  return (
    <header className="page-header">
      <div>
        {crumbs.length > 1 && (
          <div className="page-header__breadcrumbs">
            <Breadcrumbs items={crumbs} />
          </div>
        )}
        <h1 className="page-header__title">{title}</h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  )
}
