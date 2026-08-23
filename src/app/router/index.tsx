import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Spinner } from '@/components/ui/Spinner'

import { ProtectedRoutes } from './protected-routes'
import { PublicRoutes } from './public-routes'
import { LoginPage } from '@/features/auth/LoginPage'
import { RouteErrorBoundary } from './RouteErrorBoundary'

// Feature pages are code-split so the initial bundle stays lean.
const LandingPage = lazy(() =>
  import('@/features/landing/LandingPage').then((m) => ({ default: m.LandingPage })),
)
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)
const AnalyticsPage = lazy(() =>
  import('@/features/analytics/pages/AnalyticsPage').then((m) => ({
    default: m.AnalyticsPage,
  })),
)
const UsersPage = lazy(() =>
  import('@/features/users/pages/UsersPage').then((m) => ({ default: m.UsersPage })),
)
const UserDetailPage = lazy(() =>
  import('@/features/users/pages/UserDetailPage').then((m) => ({
    default: m.UserDetailPage,
  })),
)
const ProductsPage = lazy(() =>
  import('@/features/products/pages/ProductsPage').then((m) => ({
    default: m.ProductsPage,
  })),
)
const ProductDetailPage = lazy(() =>
  import('@/features/products/pages/ProductDetailPage').then((m) => ({
    default: m.ProductDetailPage,
  })),
)
const OrdersPage = lazy(() =>
  import('@/features/orders/pages/OrdersPage').then((m) => ({ default: m.OrdersPage })),
)
const OrderDetailPage = lazy(() =>
  import('@/features/orders/pages/OrderDetailPage').then((m) => ({
    default: m.OrderDetailPage,
  })),
)
const ProjectsPage = lazy(() =>
  import('@/features/projects/pages/ProjectsPage').then((m) => ({
    default: m.ProjectsPage,
  })),
)
const InvoicesPage = lazy(() =>
  import('@/features/invoices/pages/InvoicesPage').then((m) => ({
    default: m.InvoicesPage,
  })),
)
const SettingsPage = lazy(() =>
  import('@/features/settings/pages/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  })),
)
const NotFoundPage = lazy(() =>
  import('@/app/router/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

function PageFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0',
      }}
    >
      <Spinner size={24} label="Loading page" />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    // Public marketing home — the only page intended for search engines.
    path: '/',
    element: (
      <Suspense fallback={<PageFallback />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    element: <PublicRoutes />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/login',
        // Login is small — bundled eagerly for instant first paint.
        element: <LoginPage />,
        handle: { crumb: 'Sign in' },
      },
    ],
  },
  {
    element: <ProtectedRoutes />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/dashboard',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageFallback />}>
                <DashboardPage />
              </Suspense>
            ),
            handle: { crumb: 'Dashboard' },
          },
          {
            path: 'analytics',
            element: (
              <Suspense fallback={<PageFallback />}>
                <AnalyticsPage />
              </Suspense>
            ),
            handle: { crumb: 'Analytics' },
          },
          {
            path: 'users',
            handle: { crumb: 'Users' },
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<PageFallback />}>
                    <UsersPage />
                  </Suspense>
                ),
              },
              {
                path: ':userId',
                element: (
                  <Suspense fallback={<PageFallback />}>
                    <UserDetailPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'products',
            handle: { crumb: 'Products' },
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<PageFallback />}>
                    <ProductsPage />
                  </Suspense>
                ),
              },
              {
                path: ':productId',
                element: (
                  <Suspense fallback={<PageFallback />}>
                    <ProductDetailPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'orders',
            handle: { crumb: 'Orders' },
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<PageFallback />}>
                    <OrdersPage />
                  </Suspense>
                ),
              },
              {
                path: ':orderId',
                element: (
                  <Suspense fallback={<PageFallback />}>
                    <OrderDetailPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'projects',
            element: (
              <Suspense fallback={<PageFallback />}>
                <ProjectsPage />
              </Suspense>
            ),
            handle: { crumb: 'Projects' },
          },
          {
            path: 'invoices',
            element: (
              <Suspense fallback={<PageFallback />}>
                <InvoicesPage />
              </Suspense>
            ),
            handle: { crumb: 'Invoices' },
          },
          {
            path: 'settings',
            element: (
              <Suspense fallback={<PageFallback />}>
                <SettingsPage />
              </Suspense>
            ),
            handle: { crumb: 'Settings' },
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageFallback />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])
