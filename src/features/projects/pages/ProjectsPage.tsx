import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import type { Project, ProjectStatus } from '@/models/Project'
import { PROJECT_STATUSES } from '@/models/Project'
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
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { Skeleton } from '@/components/ui/Skeleton'
import { getUserMessage } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { ProjectStatusBadge } from '@/components/display/status-badges'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useProjects } from '../hooks/use-projects'
import { ProjectFormDialog } from '../components/ProjectFormDialog'
import { DeleteProjectDialog } from '../components/DeleteProjectDialog'

const PAGE_SIZE = 10

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...PROJECT_STATUSES.map((status) => ({
    value: status,
    label:
      status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
  })),
]

/**
 * Project list. All list state (search, filters, sorting, page) lives in the
 * URL so views are shareable and back/forward works.
 */
export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // ----- URL-synced list state ---------------------------------------------
  const search = searchParams.get('search') ?? ''
  const debouncedSearch = useDebouncedValue(search)
  const status = (searchParams.get('status') ?? 'all') as ProjectStatus | 'all'
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
    status,
    sort: sortParam || undefined,
  }

  const projects = useProjects(query)

  // ----- Dialog state --------------------------------------------------------
  const [createOpen, setCreateOpen] = useState(searchParams.get('create') === '1')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)

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
        title="Projects"
        description="Track client work, owners and delivery progress."
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus size={15} aria-hidden="true" />
            New project
          </Button>
        }
      />

      <div className="table__toolbar">
        <SearchInput
          value={search}
          onChange={(value) => updateParam('search', value || null)}
          placeholder="Search name, client or owner…"
          label="Search projects"
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

      {projects.isError ? (
        <ErrorState
          message={getUserMessage(projects.error)}
          onRetry={() => projects.refetch()}
        />
      ) : (
        <>
          <TableRoot caption="Client projects with owner, progress and due date">
            <THead>
              <tr>
                <SortableTh
                  label="Name"
                  state={columnState('name', sortField, sortDirection)}
                  onToggle={() => toggleSort('name')}
                />
                <SortableTh
                  label="Client"
                  state={columnState('client', sortField, sortDirection)}
                  onToggle={() => toggleSort('client')}
                />
                <SortableTh
                  label="Owner"
                  state={columnState('ownerName', sortField, sortDirection)}
                  onToggle={() => toggleSort('ownerName')}
                />
                <SortableTh
                  label="Status"
                  state={columnState('status', sortField, sortDirection)}
                  onToggle={() => toggleSort('status')}
                />
                <SortableTh
                  label="Progress"
                  state={columnState('progress', sortField, sortDirection)}
                  onToggle={() => toggleSort('progress')}
                />
                <SortableTh
                  label="Due date"
                  state={columnState('dueDate', sortField, sortDirection)}
                  onToggle={() => toggleSort('dueDate')}
                />
                <Th>
                  <span className="visually-hidden">Actions</span>
                </Th>
              </tr>
            </THead>
            <tbody>
              {projects.isPending &&
                [1, 2, 3, 4, 5].map((row) => (
                  <tr key={row}>
                    {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
                      <Td key={cell}>
                        <Skeleton style={{ height: 16, width: cell === 1 ? 140 : 80 }} />
                      </Td>
                    ))}
                  </tr>
                ))}

              {projects.isSuccess && projects.data.meta.total === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={<FolderKanban size={18} aria-hidden="true" />}
                      title={
                        debouncedSearch || status !== 'all'
                          ? 'No matching projects'
                          : 'No projects yet'
                      }
                      description={
                        debouncedSearch || status !== 'all'
                          ? 'Try adjusting your search or filters.'
                          : 'Create your first project to start tracking work.'
                      }
                      action={
                        debouncedSearch || status !== 'all' ? undefined : (
                          <Button variant="primary" onClick={() => setCreateOpen(true)}>
                            <Plus size={15} aria-hidden="true" />
                            New project
                          </Button>
                        )
                      }
                    />
                  </td>
                </tr>
              )}

              {projects.isSuccess &&
                projects.data.data.map((project) => (
                  <Tr key={project.id}>
                    <Td>
                      <span
                        className="table__cell-primary truncate"
                        style={{ maxWidth: 220 }}
                      >
                        {project.name}
                      </span>
                    </Td>
                    <Td className="table__cell-muted">{project.client}</Td>
                    <Td className="table__cell-muted">{project.ownerName || '—'}</Td>
                    <Td>
                      <ProjectStatusBadge status={project.status} />
                    </Td>
                    <Td>
                      <ProgressBar value={project.progress} />
                    </Td>
                    <Td className="table__cell-muted">
                      {project.dueDate === null ? '—' : formatDate(project.dueDate)}
                    </Td>
                    <Td>
                      <div className="table__cell-actions">
                        <DropdownMenu
                          label={`Actions for ${project.name}`}
                          items={[
                            {
                              label: 'Edit',
                              icon: <Pencil size={14} aria-hidden="true" />,
                              onSelect: () => setEditingProject(project),
                            },
                            {
                              label: 'Delete',
                              icon: <Trash2 size={14} aria-hidden="true" />,
                              tone: 'danger',
                              onSelect: () => setDeletingProject(project),
                            },
                          ]}
                          trigger={(triggerProps) => (
                            <button
                              type="button"
                              className="icon-btn"
                              aria-label={`Actions for ${project.name}`}
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

          {!projects.isPending && !projects.isError && projects.data !== undefined && (
            <Pagination
              meta={projects.data.meta}
              onPageChange={(p) => updateParam('page', String(p))}
              noun="projects"
            />
          )}
          {projects.isFetching && !projects.isPending && (
            <p className="text-xs text-muted" role="status" style={{ marginTop: 8 }}>
              Updating…
            </p>
          )}
        </>
      )}

      <ProjectFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <ProjectFormDialog
        open={editingProject !== null}
        onClose={() => setEditingProject(null)}
        project={editingProject ?? undefined}
      />
      <DeleteProjectDialog
        project={deletingProject}
        onClose={() => setDeletingProject(null)}
      />
    </>
  )
}

function ProgressBar({ value }: { value: number }): ReactNode {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        aria-hidden="true"
        style={{
          width: 90,
          height: 6,
          borderRadius: 9999,
          background: 'var(--subtle)',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            display: 'block',
            width: `${value}%`,
            height: '100%',
            borderRadius: 9999,
            background: 'var(--primary)',
          }}
        />
      </span>
      <span className="text-xs text-muted">{value}%</span>
    </span>
  )
}

function columnState(
  field: string,
  activeField: string,
  direction: SortState,
): SortState {
  return activeField === field ? direction : null
}
