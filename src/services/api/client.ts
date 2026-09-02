import { appConfig } from '@/config/app'
import { buildQueryString } from '@/types/api'
import { ApiError, NetworkError, apiErrorFromResponse } from './errors'

export interface RequestOptions {
  /** Query string parameters. `undefined`/`null`/empty values are skipped. */
  query?: object
  /** JSON-serializable request body. */
  body?: unknown
  signal?: AbortSignal
  /**
   * Attach the stored auth token as a Bearer header (default: true).
   * Set to false for endpoints like login.
   */
  authenticated?: boolean
}

/**
 * Pluggable token source. The auth service wires this to the storage layer at
 * startup, keeping the client decoupled from any concrete persistence.
 */
let readAuthToken: () => string | null = () => null

export function setAuthTokenReader(reader: () => string | null): void {
  readAuthToken = reader
}

/**
 * In-process mock used by the bundled demo API. Loaded lazily from this
 * module so every `apiClient` instance resolves handlers itself — a setter
 * in `main.tsx` can miss a duplicated client chunk on the hosted build.
 */
type MockDispatcher = (request: Request) => Promise<Response | undefined>

let mockDispatchPromise: Promise<MockDispatcher> | null = null

function loadMockDispatcher(): Promise<MockDispatcher> | null {
  if (!appConfig.enableMockApi) return null
  mockDispatchPromise ??= import('@/data/mock-server/dispatch').then(
    (module) => module.dispatchMockRequest,
  )
  return mockDispatchPromise
}

function resolveRequestUrl(url: string): string {
  if (/^[a-z][a-z\d+\-.]*:/i.test(url)) return url
  if (typeof location !== 'undefined') return new URL(url, location.origin).href
  return new URL(url, 'http://localhost').href
}

/**
 * Backend-independent HTTP client.
 *
 * Responsibilities:
 * - resolve URLs against the configured base URL
 * - serialize JSON bodies / parse JSON responses
 * - attach the auth token when available
 * - translate transport + HTTP failures into typed `ApiError` subclasses
 *
 * It knows nothing about React or any feature. When `enableMockApi` is on it
 * lazily loads the bundled handlers; set `VITE_ENABLE_MOCK_API=false` and the
 * import is dropped from production builds.
 */
class HttpClient {
  async get<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
    return this.request<TResponse>('GET', path, options)
  }

  async post<TResponse>(
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<TResponse> {
    return this.request<TResponse>('POST', path, { ...options, body })
  }

  async patch<TResponse>(
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<TResponse> {
    return this.request<TResponse>('PATCH', path, { ...options, body })
  }

  async delete<TResponse>(
    path: string,
    options: RequestOptions = {},
  ): Promise<TResponse> {
    return this.request<TResponse>('DELETE', path, options)
  }

  private async request<TResponse>(
    method: string,
    path: string,
    options: RequestOptions,
  ): Promise<TResponse> {
    const url = this.buildUrl(path, options.query)
    const headers = new Headers({
      Accept: 'application/json',
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    })

    if (options.authenticated !== false) {
      const token = readAuthToken()
      if (token) headers.set('Authorization', `Bearer ${token}`)
    }

    const init: RequestInit = {
      method,
      headers,
      credentials: 'include',
      signal: options.signal,
    }
    if (options.body !== undefined) {
      init.body = JSON.stringify(options.body)
    }

    let response: Response
    try {
      const dispatcher = loadMockDispatcher()
      const mocked = dispatcher
        ? await (await dispatcher)(new Request(resolveRequestUrl(url), init))
        : undefined
      response = mocked ?? (await fetch(url, init))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error
      throw new NetworkError(error)
    }

    const payload = await this.parseBody(response)

    if (!response.ok) {
      throw apiErrorFromResponse(response.status, payload)
    }

    // Successful DELETE responses may be empty; anything else must be JSON.
    if (payload === null || payload === undefined) {
      return undefined as TResponse
    }
    return payload as TResponse
  }

  private buildUrl(path: string, query?: object): string {
    const base = appConfig.apiBaseUrl.replace(/\/$/, '')
    const suffix = path.startsWith('/') ? path : `/${path}`
    return `${base}${suffix}${query ? buildQueryString(query as Record<string, unknown>) : ''}`
  }

  private async parseBody(response: Response): Promise<unknown> {
    if (response.status === 204) return null
    try {
      return await response.json()
    } catch {
      if (!response.ok) {
        return new ApiError('Unexpected response from server.', {
          status: response.status,
          code: 'internal_error',
        })
      }
      return null
    }
  }
}

export const apiClient = new HttpClient()
