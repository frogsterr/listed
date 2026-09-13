import { describe, expect, it } from 'vitest'
import { validateCatalog, offeringKey } from '../scripts/lib/catalog.mjs'
const row = { title: 'Bible', semester: 'Fall 2026', professor: 'Professor One', category: 'Bible', meeting_days: ['Wed', 'Mon'], start_time: '10:00', end_time: '11:00', requirements: ['Core Bible'] }
describe('verified catalog imports', () => {
  it('recognizes existing database time formatting and day order', () => {
    expect(offeringKey(row)).toBe(offeringKey({ ...row, meeting_days: ['Mon', 'Wed'], start_time: '10:00:00', end_time: '11:00:00' }))
  })
  it('rejects duplicate input before making any writes', () => {
    expect(() => validateCatalog([row, row])).toThrow(/duplicate/)
  })
  it.each([
    { semester: 'Fall' }, { meeting_days: ['Someday'] }, { start_time: '25:00' },
    { end_time: '09:00' }, { end_time: null }, { requirements: 'Core' },
  ])('rejects invalid data: %j', overrides => {
    expect(() => validateCatalog([{ ...row, ...overrides }])).toThrow()
  })
  it('leaves unknown requirement mappings empty', () => {
    expect(validateCatalog([{ ...row, requirements: undefined }])[0].requirements).toEqual([])
  })
})
