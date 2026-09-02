import { Outlet } from 'react-router-dom'

/**
 * Public auth screens (sign-in). The template keeps these reachable so
 * consumers can copy the page; the dashboard stays open without a gate.
 */
export function PublicRoutes() {
  return <Outlet />
}
