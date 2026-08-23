import type { ApiErrorBody, ApiErrorCode } from '@/types/api'

/**
 * Typed error hierarchy for the API layer. The UI can branch on error classes
 * (or codes) without parsing raw fetch failures or backend-specific payloads.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  /** Per-field messages, present on validation errors. */
  readonly fields?: Record<string, string>

  constructor(
    message: string,
    options: {
      status: number
      code: ApiErrorCode
      fields?: Record<string, string>
    },
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.fields = options.fields
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message, { status: 401, code: 'unauthorized' })
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, { status: 403, code: 'forbidden' })
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'The requested resource was not found.') {
    super(message, { status: 404, code: 'not_found' })
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends ApiError {
  constructor(
    fields: Record<string, string>,
    message = 'Please fix the highlighted fields.',
  ) {
    super(message, { status: 422, code: 'validation_error', fields })
    this.name = 'ValidationError'
  }
}

/** Thrown when the request never reached the API (offline, DNS, aborted). */
export class NetworkError extends ApiError {
  constructor(cause?: unknown) {
    super('Unable to reach the server. Check your connection and try again.', {
      status: 0,
      code: 'network_error',
    })
    this.name = 'NetworkError'
    this.cause = cause
  }
}

const STATUS_TO_ERROR: Record<number, (message: string) => ApiError> = {
  401: (m) => new UnauthorizedError(m),
  403: (m) => new ForbiddenError(m),
  404: (m) => new NotFoundError(m),
  422: (m) => new ValidationError({}, m),
}

/**
 * Convert a non-2xx response + parsed body into the most specific typed error.
 */
export function apiErrorFromResponse(status: number, body: unknown): ApiError {
  const payload = body as Partial<ApiErrorBody> | null
  const message = payload?.error?.message ?? fallbackMessageForStatus(status)
  const fields = payload?.error?.fields

  if (status === 422 && fields && Object.keys(fields).length > 0) {
    return new ValidationError(fields, message)
  }

  if (status === 401) return new UnauthorizedError(message)
  if (status === 403) return new ForbiddenError(message)
  if (status === 404) return new NotFoundError(message)

  const factory = STATUS_TO_ERROR[status]
  if (factory) return factory(message)

  return new ApiError(message, { status, code: 'internal_error', fields })
}

function fallbackMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'The request could not be processed.'
    case 429:
      return 'Too many requests. Please slow down and try again.'
    default:
      return 'Something went wrong on our side. Please try again later.'
  }
}
