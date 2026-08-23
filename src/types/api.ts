/**
 * Generic API contract shared by every feature. The mock server implements
 * these envelopes and your real backend should too — that is what makes the
 * swap between them seamless.
 */

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/** Envelope returned by paginated list endpoints. */
export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PageQuery {
  page?: number
  pageSize?: number
}

/** Free-text search applied across an endpoint's searchable fields. */
export interface SearchQuery {
  search?: string
}

/**
 * Sort syntax: `field` or `-field` for descending, e.g. `createdAt.desc`
 * is expressed as `sort=-createdAt`.
 */
export interface SortQuery {
  sort?: string
}

export interface ListQuery extends PageQuery, SearchQuery, SortQuery {}

export type ApiErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'validation_error'
  | 'rate_limited'
  | 'internal_error'
  | 'network_error'

/** Error body shape produced by the API layer (mock server included). */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode
    message: string
    /** Per-field messages for validation errors, keyed by field name. */
    fields?: Record<string, string>
  }
}

export function buildQueryString(query: Record<string, unknown>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== '') {
          params.append(key, String(item))
        }
      }
    } else {
      params.set(key, String(value))
    }
  }
  const encoded = params.toString()
  return encoded ? `?${encoded}` : ''
}
