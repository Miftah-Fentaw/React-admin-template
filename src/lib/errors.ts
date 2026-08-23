import { ApiError, NetworkError, ValidationError } from '@/services/api/errors'

/**
 * Map any thrown error to a safe, human-readable message.
 *
 * Raw backend/transport details never reach the UI directly — this is the
 * single translation point between error classes and user-facing copy.
 */
export function getUserMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    if (Object.keys(error.fields ?? {}).length > 0) {
      return 'Please fix the highlighted fields.'
    }
    return error.message
  }

  if (error instanceof ApiError) {
    // Known codes get their typed messages; unknown statuses keep the
    // server-provided message only when it looks presentable.
    switch (error.code) {
      case 'unauthorized':
      case 'forbidden':
      case 'not_found':
      case 'conflict':
      case 'validation_error':
        return error.message
      case 'rate_limited':
        return 'Too many requests. Please wait a moment and try again.'
      default:
        return 'Something went wrong on our side. Please try again later.'
    }
  }

  if (error instanceof NetworkError || error instanceof DOMException) {
    return 'Unable to reach the server. Check your connection and try again.'
  }

  return 'An unexpected error occurred. Please try again.'
}
