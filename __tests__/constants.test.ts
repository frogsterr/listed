import { describe, it, expect } from 'vitest'
import { TAGS, WORKLOAD_LABELS, SEMESTERS } from '@/lib/constants'

describe('TAGS', () => {
  it('has three groups', () => {
    expect(TAGS).toHaveLength(3)
    expect(TAGS.map(g => g.group)).toEqual(['Professor Style', 'Time Commitment', 'Class Vibe'])
  })

  it('each group has at least one tag', () => {
    TAGS.forEach(group => {
      expect(group.tags.length).toBeGreaterThan(0)
    })
  })
})

describe('WORKLOAD_LABELS', () => {
  it('has entries for 1 through 5', () => {
    expect(WORKLOAD_LABELS[1]).toBeDefined()
    expect(WORKLOAD_LABELS[5]).toBeDefined()
  })
})

describe('SEMESTERS', () => {
  it('is a non-empty array of strings', () => {
    expect(Array.isArray(SEMESTERS)).toBe(true)
    expect(SEMESTERS.length).toBeGreaterThan(0)
    SEMESTERS.forEach(s => expect(typeof s).toBe('string'))
  })
})
