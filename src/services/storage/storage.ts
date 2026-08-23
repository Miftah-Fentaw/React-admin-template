/**
 * Thin, defensive wrapper around `window.localStorage`.
 *
 * - JSON-aware get/set
 * - never throws (private browsing, quota, disabled storage)
 * - typed keys via `STORAGE_KEYS`
 */
import { STORAGE_KEYS } from '@/config/app'

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage unavailable — the app degrades to in-memory behavior.
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // no-op
  }
}

/** Persisted auth session: `{ user, token }`. Written by the auth service. */
export interface StoredSession {
  token: string
}

export const storage = {
  read,
  write,
  remove,
  readSession(): StoredSession | null {
    return read<StoredSession>(STORAGE_KEYS.authSession)
  },
  writeSession(session: StoredSession): void {
    write(STORAGE_KEYS.authSession, session)
  },
  clearSession(): void {
    remove(STORAGE_KEYS.authSession)
  },
}
