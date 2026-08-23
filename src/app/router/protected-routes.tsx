import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { Spinner } from '@/components/ui/Spinner'

/**
 * Gate for authenticated areas. While the session is being restored a
 * full-screen splash is shown; unauthenticated visitors are redirected to
 * `/login`, remembering where they wanted to go.
 */
export function ProtectedRoutes() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
        }}
      >
        <Spinner size={26} label="Restoring your session" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
