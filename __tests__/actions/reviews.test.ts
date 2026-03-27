import { describe, it, expect } from 'vitest'
import { validateReviewInput } from '@/actions/reviews'

describe('validateReviewInput', () => {
  const valid = {
    class_id: 'abc-123',
    overall_rating: 4,
    workload_rating: 3,
    semester: 'Spring 2026',
    comment: 'Great class',
    tags: ['Engaging Lectures'],
  }

  it('accepts valid input', () => {
    expect(validateReviewInput(valid)).toBe(null)
  })

  it('rejects missing class_id', () => {
    expect(validateReviewInput({ ...valid, class_id: '' })).toMatch(/class/)
  })

  it('rejects overall_rating out of range', () => {
    expect(validateReviewInput({ ...valid, overall_rating: 6 })).toMatch(/rating/)
    expect(validateReviewInput({ ...valid, overall_rating: 0 })).toMatch(/rating/)
  })

  it('rejects workload_rating out of range', () => {
    expect(validateReviewInput({ ...valid, workload_rating: 0 })).toMatch(/workload/)
  })

  it('rejects missing semester', () => {
    expect(validateReviewInput({ ...valid, semester: '' })).toMatch(/semester/)
  })
})
