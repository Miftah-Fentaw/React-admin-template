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
 * Backend-independent HTTP client.
 *
 * Responsibilities:
 * - resolve URLs against the configured base URL
 * - serialize JSON bodies / parse JSON responses
 * - attach the auth token when available
 * - translate transport + HTTP failures into typed `ApiError` subclasses
 *
 * It knows nothing about MSW, React, or any feature — swapping backends never
 * touches this file beyond the base URL in `appConfig`.
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

    let response: Response
    try {
      response = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: options.signal,
      })
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
