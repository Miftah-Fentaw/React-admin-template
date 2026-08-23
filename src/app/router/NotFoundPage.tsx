import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Feedback'

/** 404 page for unknown URLs (also shown inside the admin shell context). */
export function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
      }}
    >
      <EmptyState
        icon={<Compass size={20} aria-hidden="true" />}
        title="Page not found"
        description="The page you are looking for doesn't exist or may have been moved."
        action={
          <Link to="/dashboard">
            <Button variant="primary">Back to dashboard</Button>
          </Link>
        }
      />
    </div>
  )
}
