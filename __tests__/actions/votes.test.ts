import { describe, it, expect } from 'vitest'
import { generateVoterKey, isValidVoterKey } from '@/lib/utils'

describe('generateVoterKey', () => {
  it('returns a non-empty string', () => {
    const key = generateVoterKey()
    expect(typeof key).toBe('string')
    expect(key.length).toBeGreaterThan(0)
  })

  it('returns unique values', () => {
    const keys = new Set(Array.from({ length: 100 }, () => generateVoterKey()))
    expect(keys.size).toBe(100)
  })
})

describe('isValidVoterKey', () => {
  it('accepts a valid UUID-like key', () => {
    expect(isValidVoterKey('abc123-def456')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(isValidVoterKey('')).toBe(false)
  })

  it('rejects very long strings', () => {
    expect(isValidVoterKey('x'.repeat(200))).toBe(false)
  })
})
