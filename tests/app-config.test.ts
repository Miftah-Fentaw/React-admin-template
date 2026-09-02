import { describe, expect, it } from 'vitest'
import { resolveApiBaseUrl } from '@/config/app'

describe('resolveApiBaseUrl', () => {
  it('defaults to /api when the env var is missing or blank', () => {
    expect(resolveApiBaseUrl(undefined)).toBe('/api')
    expect(resolveApiBaseUrl('')).toBe('/api')
    expect(resolveApiBaseUrl('   ')).toBe('/api')
  })

  it('keeps an explicit backend URL', () => {
    expect(resolveApiBaseUrl('https://api.example.com')).toBe('https://api.example.com')
    expect(resolveApiBaseUrl('/api')).toBe('/api')
  })
})
