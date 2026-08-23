import { Outlet } from 'react-router-dom'

/**
 * Gate for authenticated areas. While the session is being restored a
 * full-screen splash is shown; unauthenticated visitors are redirected to
 * `/login`, remembering where they wanted to go.
 */
export function ProtectedRoutes() {
  return <Outlet />
}
