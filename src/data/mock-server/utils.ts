import { delay, HttpResponse } from 'msw'
import type { ApiErrorCode, Paginated } from '@/types/api'

/**
 * Shared plumbing for mock handlers: simulated latency, response envelopes,
 * auth guards and list-query helpers (pagination / sorting).
 */

export async function latency(minMs = 150, maxMs = 450): Promise<void> {
  await delay(minMs + Math.random() * (maxMs - minMs))
}

export function jsonError(
  status: number,
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string>,
): ReturnType<typeof HttpResponse.json> {
  return HttpResponse.json({ error: { code, message, fields } }, { status })
}

export const unauthorized = () =>
  jsonError(401, 'unauthorized', 'Your session has expired. Please sign in again.')

export const notFound = (resource: string) =>
  jsonError(404, 'not_found', `The requested ${resource} was not found.`)

/**
 * Extract the authenticated user id from the Bearer token, or `null`.
 * The demo tokens have the shape `mock-token-<userId>`.
 */
export function getAuthUserId(request: Request): string | null {
  const header = request.headers.get('Authorization')
  if (!header?.startsWith('Bearer mock-token-')) return null
  return header.slice('Bearer mock-token-'.length)
}

// ---------------------------------------------------------------------------
// List query helpers
// ---------------------------------------------------------------------------

export interface ParsedListQuery {
  page: number
  pageSize: number
  search: string
  sortField: string | null
  sortDirection: 'asc' | 'desc'
}

const ALLOWED_PAGE_SIZES = [5, 10, 20, 50]

export function parseListQuery(url: URL): ParsedListQuery {
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const requestedPageSize = Number(url.searchParams.get('pageSize')) || 10
  const pageSize = Math.min(
    Math.max(1, closestAllowedPageSize(requestedPageSize)),
    100,
  )
  const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
  const rawSort = url.searchParams.get('sort') ?? ''
  const descending = rawSort.startsWith('-')
  const sortField = descending ? rawSort.slice(1) : rawSort || null

  return { page, pageSize, search, sortField, sortDirection: descending ? 'desc' : 'asc' }
}

function closestAllowedPageSize(requested: number): number {
  return ALLOWED_PAGE_SIZES.reduce((best, size) =>
    Math.abs(size - requested) < Math.abs(best - requested) ? size : best,
  )
}

/** Case-insensitive substring match across the given string fields. */
export function matchesSearch<T>(item: T, fields: Array<keyof T>, term: string): boolean {
  if (!term) return true
  return fields.some((field) => String(item[field] ?? '').toLowerCase().includes(term))
}

/** Sort records by an allow-listed field. Unknown fields fall back to input order. */
export function applySort<T>(
  items: T[],
  field: string | null,
  direction: 'asc' | 'desc',
  allowedFields: readonly string[],
): T[] {
  if (!field || !allowedFields.includes(field)) return items
  const factor = direction === 'asc' ? 1 : -1
  return [...items].sort((a, b) => {
    const av = a[field as keyof T]
    const bv = b[field as keyof T]
    if (av === bv) return 0
    if (av === null || av === undefined) return 1 * factor * -1
    if (bv === null || bv === undefined) return -1 * factor * -1
    if (typeof av === 'string' && typeof bv === 'string') {
      return av.localeCompare(bv) * factor
    }
    return ((av as number) > (bv as number) ? 1 : -1) * factor
  })
}

export function paginate<T>(items: T[], query: ParsedListQuery): Paginated<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize))
  const page = Math.min(query.page, totalPages)
  const start = (page - 1) * query.pageSize
  return {
    data: items.slice(start, start + query.pageSize),
    meta: { page, pageSize: query.pageSize, total, totalPages },
  }
}
