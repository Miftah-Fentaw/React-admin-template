import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'

/**
 * Wraps public-only pages (e.g. login). Signed-in users are bounced to the
 * dashboard — or back to their original destination when present.
 */
export function PublicRoutes() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'authenticated') {
    const target = (location.state as { from?: string } | null)?.from ?? '/'
    return <Navigate to={target} replace />
  }

  return <Outlet />
}
