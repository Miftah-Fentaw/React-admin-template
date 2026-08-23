import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  /** Omit on the final (current) item. */
  to?: string
}

/**
 * Breadcrumb trail. The last item is the current page and is not a link.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className="breadcrumbs__item">
                {isLast || !item.to ? (
                  <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
                ) : (
                  <Link to={item.to} className="breadcrumbs__link">
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li className="breadcrumbs__separator" aria-hidden="true">
                  <ChevronRight size={13} />
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
