import { describe, expect, it } from 'vitest'
import { buildPlannerClasses, filterPlannerClasses, DEFAULT_FILTERS } from '@/lib/course-planner'
import type { Class } from '@/lib/types'

const makeClass = (id: string, overrides: Partial<Class> = {}): Class => ({
  id, title: 'Bible', semester: 'Fall 2026', professor_id: 'p1', category: 'Bible',
  professor: { id: 'p1', name: 'Professor One', created_at: '' },
  meeting_days: ['Mon', 'Wed'], start_time: '10:00:00', end_time: '11:00:00',
  created_at: '', requirements: ['Core Bible'], ...overrides,
})
const classes = [
  makeClass('old', { semester: 'Spring 2026' }),
  makeClass('new'),
  makeClass('other', { title: 'Talmud', requirements: ['Core Talmud'] }),
  makeClass('unrated', { title: 'History', professor_id: null, professor: undefined, requirements: [], start_time: null, end_time: null }),
]
const reviews = [
  { class_id: 'old', overall_rating: 5 },
  { class_id: 'old', overall_rating: 3 },
  { class_id: 'other', overall_rating: 1 },
]
const offerings = buildPlannerClasses(classes, reviews).filter(c => c.semester === 'Fall 2026')

describe('course selection', () => {
  it('carries historical course ratings to new offerings, with review-weighted professor ratings', () => {
    const fresh = offerings.find(c => c.id === 'new')!
    expect(fresh.courseRating).toEqual({ average: 4, count: 2 })
    expect(fresh.professorRating).toEqual({ average: 3, count: 3 })
  })
  it('keeps unrated and unscheduled offerings discoverable with no filters', () => {
    expect(filterPlannerClasses(offerings, DEFAULT_FILTERS).map(c => c.id)).toContain('unrated')
  })
  it('combines requirement, rating, review-count, day, and inclusive time filters', () => {
    const result = filterPlannerClasses(offerings, {
      ...DEFAULT_FILTERS, requirement: 'Core Bible', minCourseRating: 4,
      minProfessorRating: 3, minReviews: 2, day: 'Wed', earliest: '10:00', latest: '11:00',
    })
    expect(result.map(c => c.id)).toEqual(['new'])
  })
  it('does not mistake categories for confirmed requirements', () => {
    expect(filterPlannerClasses(offerings, { ...DEFAULT_FILTERS, requirement: 'Bible' })).toEqual([])
  })
  it('excludes unknown ratings and times when a corresponding minimum/window is set', () => {
    expect(filterPlannerClasses(offerings, { ...DEFAULT_FILTERS, minCourseRating: 4 }).map(c => c.id)).toEqual(['new'])
    expect(filterPlannerClasses(offerings, { ...DEFAULT_FILTERS, earliest: '11:00' })).toEqual([])
    expect(filterPlannerClasses(offerings, { ...DEFAULT_FILTERS, minProfessorRating: 4 })).toEqual([])
  })
  it('sorts rated offerings above unrated, with stable tie-breaking', () => {
    expect(filterPlannerClasses([...offerings].reverse(), { ...DEFAULT_FILTERS, sort: 'course' }).map(c => c.id)).toEqual(['new', 'other', 'unrated'])
  })
})

it('counts co-taught reviews once per instructor and supports secondary-instructor and cross-listed-code search', () => {
  const primary = { id: 'p1', name: 'Professor One', created_at: '' }
  const secondary = { id: 'p2', name: 'Professor Two', created_at: '' }
  const coTaught = makeClass('team', {
    course_codes: ['BIB 3000', 'JGW 3000'],
    instructors: [{ professor: primary }, { professor: secondary }],
  })
  const other = makeClass('solo', { title: 'Other', professor_id: secondary.id, professor: secondary })
  const rows = buildPlannerClasses([coTaught, other], [
    { class_id: 'team', overall_rating: 3 }, { class_id: 'solo', overall_rating: 5 },
  ])
  expect(rows[0].professorRatings.map(r => r.stats)).toEqual([{ average: 3, count: 1 }, { average: 4, count: 2 }])
  expect(filterPlannerClasses(rows, { ...DEFAULT_FILTERS, query: 'Professor Two', category: 'JGW', minProfessorRating: 4 }).map(c => c.id)).toEqual(['team'])
  expect(filterPlannerClasses(rows, { ...DEFAULT_FILTERS, query: 'JGW 3000' }).map(c => c.id)).toEqual(['team'])
})
