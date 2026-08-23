import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/Feedback'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { NotFoundError } from '@/services/api/errors'
import { formatDate, formatDateTime } from '@/lib/format'
import { UserRoleBadge, UserStatusBadge } from '@/components/display/status-badges'
import { useUser } from '../hooks/use-users'
import { UserFormDialog } from '../components/UserFormDialog'

/** Read-only profile view with an inline edit affordance. */
export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const user = useUser(userId)
  const isNotFound = user.error instanceof NotFoundError

  return (
    <>
      <PageHeader
        title={user.data?.name ?? 'User details'}
        description={user.data?.email}
        actions={
          user.data && (
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil size={14} aria-hidden="true" />
              Edit
            </Button>
          )
        }
      />

      <div className="detail-header">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/users')}>
          <ArrowLeft size={15} aria-hidden="true" />
          Back to users
        </Button>
      </div>

      {user.isPending && (
        <div className="detail-grid">
          <Card>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Skeleton style={{ height: 48, width: 48, borderRadius: '50%' }} />
              <Skeleton style={{ height: 22, width: 200 }} />
              <Skeleton style={{ height: 16, width: 280 }} />
            </CardContent>
          </Card>
        </div>
      )}

      {user.isError &&
        (isNotFound ? (
          <ErrorState
            title="User not found"
            message="This account may have been deleted."
            onRetry={() => navigate('/dashboard/users')}
          />
        ) : (
          <ErrorState
            message="Could not load this user."
            onRetry={() => user.refetch()}
          />
        ))}

      {user.isSuccess && (
        <div className="detail-grid">
          <div className="detail-stack">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar
                    name={user.data.name}
                    src={user.data.avatarUrl ?? undefined}
                    size="lg"
                  />
                  <div>
                    <h2 style={{ fontSize: '1.1rem' }}>{user.data.name}</h2>
                    <p className="text-muted text-sm">{user.data.email}</p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <UserRoleBadge role={user.data.role} />
                      <UserStatusBadge status={user.data.status} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About this member</CardTitle>
                <CardDescription>Account lifecycle information</CardDescription>
              </CardHeader>
              <CardContent style={{ paddingTop: 8 }}>
                <ul role="list" className="meta-list">
                  <li className="meta-list__row">
                    <span className="meta-list__label">Member since</span>
                    <span className="meta-list__value">
                      {formatDate(user.data.createdAt)}
                    </span>
                  </li>
                  <li className="meta-list__row">
                    <span className="meta-list__label">Last login</span>
                    <span className="meta-list__value">
                      {user.data.lastLoginAt === null
                        ? 'Never signed in'
                        : formatDateTime(user.data.lastLoginAt)}
                    </span>
                  </li>
                  <li className="meta-list__row">
                    <span className="meta-list__label">Profile updated</span>
                    <span className="meta-list__value">
                      {formatDate(user.data.updatedAt)}
                    </span>
                  </li>
                  <li className="meta-list__row">
                    <span className="meta-list__label">User ID</span>
                    <span className="meta-list__value mono">{user.data.id}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Access</CardTitle>
              <CardDescription>What this member can do</CardDescription>
            </CardHeader>
            <CardContent>
              <ul role="list" className="meta-list">
                <li className="meta-list__row">
                  <span className="meta-list__label">Role</span>
                  <span className="meta-list__value">
                    {user.data.role === 'admin'
                      ? 'Full workspace control'
                      : user.data.role === 'manager'
                        ? 'Manage members and content'
                        : user.data.role === 'member'
                          ? 'Create and edit own content'
                          : 'Read-only access'}
                  </span>
                </li>
                <li className="meta-list__row">
                  <span className="meta-list__label">Status</span>
                  <span className="meta-list__value">
                    {user.data.status === 'active'
                      ? 'Can sign in'
                      : user.data.status === 'invited'
                        ? 'Invitation pending'
                        : 'Blocked from signing in'}
                  </span>
                </li>
              </ul>
              <p className="text-xs text-muted" style={{ marginTop: 14 }}>
                Need to change access? Use <strong>Edit</strong> above or see the{' '}
                <Link
                  to="/dashboard/settings"
                  style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}
                >
                  settings
                </Link>{' '}
                documentation.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {user.data && (
        <UserFormDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          user={user.data}
        />
      )}
    </>
  )
}
