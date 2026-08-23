import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/**
 * Route-level error boundary. Catches render/data errors inside the router
 * so users see a recoverable screen instead of a blank page.
 */
export function RouteErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong'

  const detail = isRouteErrorResponse(error)
    ? error.statusText || 'The requested page could not be loaded.'
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.'

  return (
    <div className="route-error" role="alert">
      <h1 className="route-error__title">{title}</h1>
      <p className="route-error__detail">{detail}</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Go to dashboard
        </Button>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw size={15} aria-hidden="true" />
          Reload
        </Button>
      </div>
    </div>
  )
}
