import { describe, expect, it } from 'vitest'
import {
  createUserSchema,
  loginSchema,
  updateOrderSchema,
  updateProfileSchema,
} from '@/models/schemas'

describe('loginSchema', () => {
  it('accepts a valid payload', () => {
    const result = loginSchema.safeParse({ email: 'a@b.co', password: 'longenough' })
    expect(result.success).toBe(true)
  })

  it('rejects a malformed email and short password', () => {
    const result = loginSchema.safeParse({ email: 'nope', password: 'short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0])
      expect(fields).toContain('email')
      expect(fields).toContain('password')
    }
  })
})

describe('updateProfileSchema', () => {
  it('trims and enforces a minimum name length', () => {
    const tooShort = updateProfileSchema.safeParse({ name: 'A', email: 'a@b.co' })
    expect(tooShort.success).toBe(false)

    const ok = updateProfileSchema.safeParse({
      name: '  Ada Lovelace ',
      email: 'ada@vantage.dev',
    })
    expect(ok.success).toBe(true)
    if (ok.success) expect(ok.data.name).toBe('Ada Lovelace')
  })
})

describe('createUserSchema', () => {
  it('defaults nothing — status stays optional', () => {
    const parsed = createUserSchema.parse({
      name: 'Grace Hopper',
      email: 'grace@vantage.dev',
      role: 'member',
    })
    expect(parsed.status).toBeUndefined()
  })

  it('rejects unknown roles', () => {
    const result = createUserSchema.safeParse({
      name: 'Grace Hopper',
      email: 'grace@vantage.dev',
      role: 'superadmin',
    })
    expect(result.success).toBe(false)
  })
})

describe('updateOrderSchema', () => {
  it('allows an empty patch (partial by design)', () => {
    expect(updateOrderSchema.safeParse({}).success).toBe(true)
  })

  it('rejects unknown status values', () => {
    expect(updateOrderSchema.safeParse({ status: 'teleported' }).success).toBe(false)
  })
})
