import { http, HttpResponse } from 'msw'
import type { Project, ProjectStatus } from '@/models/Project'
import { createProjectSchema, updateProjectSchema, zodFieldErrors } from '@/models/schemas'
import { db } from '../db'
import {
  applySort,
  getAuthUserId,
  jsonError,
  latency,
  matchesSearch,
  notFound,
  paginate,
  parseListQuery,
  unauthorized,
} from '../utils'

const SORTABLE_FIELDS = [
  'name',
  'client',
  'ownerName',
  'status',
  'progress',
  'dueDate',
  'createdAt',
] as const

export const projectsHandlers = [
  // GET /api/projects — paginated, searchable, filterable, sortable list
  http.get('*/api/projects', async ({ request }) => {
    await latency()
    if (!getAuthUserId(request)) return unauthorized()

    const url = new URL(request.url)
    const query = parseListQuery(url)
    const status = url.searchParams.get('status')

    let items = [...db.projects]
    if (status && status !== 'all') {
      items = items.filter((p) => p.status === (status as ProjectStatus))
    }
    items = items.filter((p) => matchesSearch(p, ['name', 'client', 'ownerName'], query.search))
    items = applySort(items, query.sortField, query.sortDirection, SORTABLE_FIELDS)

    return HttpResponse.json(paginate(items, query))
  }),

  // POST /api/projects — create
  http.post('*/api/projects', async ({ request }) => {
    await latency(250, 600)
    if (!getAuthUserId(request)) return unauthorized()

    const body = (await request.json().catch(() => null)) as unknown
    const parsed = createProjectSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(
        422,
        'validation_error',
        'Please fix the highlighted fields.',
        zodFieldErrors(parsed.error),
      )
    }

    const duplicate = db.projects.some(
      (p) =>
        p.name.toLowerCase() === parsed.data.name.toLowerCase() &&
        p.client.toLowerCase() === parsed.data.client.toLowerCase(),
    )
    if (duplicate) {
      return jsonError(422, 'validation_error', 'Please fix the highlighted fields.', {
        name: 'A project with this name already exists for this client.',
      })
    }

    const now = new Date().toISOString()
    const project: Project = {
      id: db.nextId('prj'),
      name: parsed.data.name,
      client: parsed.data.client,
      ownerName: parsed.data.ownerName ?? '',
      status: parsed.data.status ?? 'planning',
      progress: parsed.data.progress ?? 0,
      dueDate: parsed.data.dueDate ?? null,
      createdAt: now,
      updatedAt: now,
    }
    db.projects.unshift(project)

    return HttpResponse.json({ data: project }, { status: 201 })
  }),

  // GET /api/projects/:id — detail
  http.get('*/api/projects/:id', async ({ request, params }) => {
    await latency(120, 320)
    if (!getAuthUserId(request)) return unauthorized()

    const { id } = params as { id: string }
    const project = db.projects.find((p) => p.id === id)
    if (!project) return notFound('project')

    return HttpResponse.json({ data: project })
  }),

  // PATCH /api/projects/:id — partial update
  http.patch('*/api/projects/:id', async ({ request, params }) => {
    await latency(200, 500)
    if (!getAuthUserId(request)) return unauthorized()

    const { id } = params as { id: string }
    const project = db.projects.find((p) => p.id === id)
    if (!project) return notFound('project')

    const body = (await request.json().catch(() => null)) as unknown
    const parsed = updateProjectSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(
        422,
        'validation_error',
        'Please fix the highlighted fields.',
        zodFieldErrors(parsed.error),
      )
    }

    Object.assign(project, parsed.data, { updatedAt: new Date().toISOString() })

    return HttpResponse.json({ data: project })
  }),

  // DELETE /api/projects/:id
  http.delete('*/api/projects/:id', async ({ request, params }) => {
    await latency(150, 400)
    if (!getAuthUserId(request)) return unauthorized()

    const { id } = params as { id: string }
    const index = db.projects.findIndex((p) => p.id === id)
    if (index === -1) return notFound('project')

    db.projects.splice(index, 1)

    return new HttpResponse(null, { status: 204 })
  }),
]
