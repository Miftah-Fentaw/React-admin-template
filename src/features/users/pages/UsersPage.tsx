import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, MoreHorizontal, Pencil, Trash2, UserPlus, Users } from 'lucide-react'
import {
  USER_ROLES,
  USER_STATUSES,
  type User,
  type UserRole,
  type UserStatus,
} from '@/models/User'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/forms/SearchInput'
import { Select } from '@/components/ui/Input'
import {
  SortableTh,
  TableRoot,
  Td,
  Th,
  THead,
  Tr,
  type SortState,
} from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState, ErrorState } from '@/components/ui/Feedback'
import { Avatar } from '@/components/ui/Avatar'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { Skeleton } from '@/components/ui/Skeleton'
import { getUserMessage } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { UserRoleBadge, UserStatusBadge } from '@/components/display/status-badges'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useUsers } from '../hooks/use-users'
import { UserFormDialog } from '../components/UserFormDialog'
import { DeleteUserDialog } from '../components/DeleteUserDialog'

const PAGE_SIZE = 10

const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All roles' },
  ...USER_ROLES.map((role) => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1),
  })),
]

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...USER_STATUSES.map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  })),
]

/**
 * User management list. All list state (search, filters, sorting, page)
 * lives in the URL so views are shareable and back/forward works.
 */
export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // ----- URL-synced list state ---------------------------------------------
  const search = searchParams.get('search') ?? ''
  const debouncedSearch = useDebouncedValue(search)
  const role = (searchParams.get('role') ?? 'all') as UserRole | 'all'
  const status = (searchParams.get('status') ?? 'all') as UserStatus | 'all'
  const sortParam = searchParams.get('sort') ?? ''
  const sortField = sortParam.startsWith('-') ? sortParam.slice(1) : sortParam
  const sortDirection: SortState =
    sortField === '' ? null : sortParam.startsWith('-') ? 'desc' : 'asc'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (!value) next.delete(key)
    else next.set(key, value)
    if (key !== 'page' && key !== 'create') next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const query = {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    role,
    status,
    sort: sortParam || undefined,
  }

  const users = useUsers(query)

  // ----- Dialog state --------------------------------------------------------
  const [createOpen, setCreateOpen] = useState(searchParams.get('create') === '1')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  useEffect(() => {
    if (createOpen && searchParams.get('create') !== '1') {
      updateParam('create', '1')
    }
    if (!createOpen && searchParams.get('create') === '1') {
      updateParam('create', null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createOpen])

  const toggleSort = (field: string) => {
    if (sortField !== field) {
      updateParam('sort', field)
      return
    }
    if (sortDirection === 'asc') updateParam('sort', `-${field}`)
    else updateParam('sort', null)
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage workspace members, their roles and access."
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <UserPlus size={15} aria-hidden="true" />
            Add user
          </Button>
        }
      />

      <div className="table__toolbar">
        <SearchInput
          value={search}
          onChange={(value) => updateParam('search', value || null)}
          placeholder="Search name or email…"
          label="Search users"
        />
        <Select
          aria-label="Filter by role"
          options={ROLE_FILTER_OPTIONS}
          value={role}
          onChange={(event) =>
            updateParam('role', event.target.value === 'all' ? null : event.target.value)
          }
          style={{ width: 150 }}
        />
        <Select
          aria-label="Filter by status"
          options={STATUS_FILTER_OPTIONS}
          value={status}
          onChange={(event) =>
            updateParam(
              'status',
              event.target.value === 'all' ? null : event.target.value,
            )
          }
          style={{ width: 160 }}
        />
      </div>

      {users.isError ? (
        <ErrorState
          message={getUserMessage(users.error)}
          onRetry={() => users.refetch()}
        />
      ) : (
        <>
          <TableRoot caption="Workspace users with role, status and activity">
            <THead>
              <tr>
                <SortableTh
                  label="Name"
                  state={columnState('name', sortField, sortDirection)}
                  onToggle={() => toggleSort('name')}
                />
                <Th>Email</Th>
                <SortableTh
                  label="Role"
                  state={columnState('role', sortField, sortDirection)}
                  onToggle={() => toggleSort('role')}
                />
                <SortableTh
                  label="Status"
                  state={columnState('status', sortField, sortDirection)}
                  onToggle={() => toggleSort('status')}
                />
                <SortableTh
                  label="Joined"
                  state={columnState('createdAt', sortField, sortDirection)}
                  onToggle={() => toggleSort('createdAt')}
                />
                <SortableTh
                  label="Last login"
                  state={columnState('lastLoginAt', sortField, sortDirection)}
                  onToggle={() => toggleSort('lastLoginAt')}
                />
                <Th>
                  <span className="visually-hidden">Actions</span>
                </Th>
              </tr>
            </THead>
            <tbody>
              {users.isPending &&
                [1, 2, 3, 4, 5].map((row) => (
                  <tr key={row}>
                    {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
                      <Td key={cell}>
                        <Skeleton style={{ height: 16, width: cell === 1 ? 140 : 80 }} />
                      </Td>
                    ))}
                  </tr>
                ))}

              {users.isSuccess && users.data.meta.total === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={<Users size={18} aria-hidden="true" />}
                      title={
                        debouncedSearch || role !== 'all' || status !== 'all'
                          ? 'No matching users'
                          : 'No users yet'
                      }
                      description={
                        debouncedSearch || role !== 'all' || status !== 'all'
                          ? 'Try adjusting your search or filters.'
                          : 'Invite your first team member to get started.'
                      }
                      action={
                        debouncedSearch ||
                        role !== 'all' ||
                        status !== 'all' ? undefined : (
                          <Button variant="primary" onClick={() => setCreateOpen(true)}>
                            <UserPlus size={15} aria-hidden="true" />
                            Add user
                          </Button>
                        )
                      }
                    />
                  </td>
                </tr>
              )}

              {users.isSuccess &&
                users.data.data.map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar
                          name={user.name}
                          src={user.avatarUrl ?? undefined}
                          size="sm"
                        />
                        <Link
                          to={`/users/${user.id}`}
                          className="table__cell-primary truncate"
                        >
                          {user.name}
                        </Link>
                      </span>
                    </Td>
                    <Td className="table__cell-muted">{user.email}</Td>
                    <Td>
                      <UserRoleBadge role={user.role} />
                    </Td>
                    <Td>
                      <UserStatusBadge status={user.status} />
                    </Td>
                    <Td className="table__cell-muted">{formatDate(user.createdAt)}</Td>
                    <Td className="table__cell-muted">
                      {user.lastLoginAt === null ? 'Never' : formatDate(user.lastLoginAt)}
                    </Td>
                    <Td>
                      <div className="table__cell-actions">
                        <DropdownMenu
                          label={`Actions for ${user.name}`}
                          items={[
                            {
                              label: 'View details',
                              icon: <Eye size={14} aria-hidden="true" />,
                              onSelect: () => navigate(`/users/${user.id}`),
                            },
                            {
                              label: 'Edit',
                              icon: <Pencil size={14} aria-hidden="true" />,
                              onSelect: () => setEditingUser(user),
                            },
                            {
                              label: 'Delete',
                              icon: <Trash2 size={14} aria-hidden="true" />,
                              tone: 'danger',
                              onSelect: () => setDeletingUser(user),
                            },
                          ]}
                          trigger={(triggerProps) => (
                            <button
                              type="button"
                              className="icon-btn"
                              aria-label={`Actions for ${user.name}`}
                              {...triggerProps}
                            >
                              <MoreHorizontal size={16} aria-hidden="true" />
                            </button>
                          )}
                        />
                      </div>
                    </Td>
                  </Tr>
                ))}
            </tbody>
          </TableRoot>

          {!users.isPending && !users.isError && users.data !== undefined && (
            <Pagination
              meta={users.data.meta}
              onPageChange={(p) => updateParam('page', String(p))}
              noun="users"
            />
          )}
          {users.isFetching && !users.isPending && (
            <p className="text-xs text-muted" role="status" style={{ marginTop: 8 }}>
              Updating…
            </p>
          )}
        </>
      )}

      <UserFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <UserFormDialog
        open={editingUser !== null}
        onClose={() => setEditingUser(null)}
        user={editingUser ?? undefined}
      />
      <DeleteUserDialog user={deletingUser} onClose={() => setDeletingUser(null)} />
    </>
  )
}

function columnState(
  field: string,
  activeField: string,
  direction: SortState,
): SortState {
  return activeField === field ? direction : null
}
