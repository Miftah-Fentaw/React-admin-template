import { Navigate } from 'react-router-dom'

/**
 * Public routes wrapper - redirects any public route (like /login) to the main dashboard template.
 */
export function PublicRoutes() {
  return <Navigate to="/dashboard" replace />
}
