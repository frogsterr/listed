import { describe, expect, it } from 'vitest'
import { buildPlannerClasses } from '@/lib/course-planner'
import { CATALOG_SUBJECTS, DEFAULT_CATALOG_FILTERS as defaults, catalogTaxonomy, catalogUrl, filterCatalogClasses, groupCatalogClasses, readCatalogFilters } from '@/lib/class-catalog'
import type { Class } from '@/lib/types'

function course(id: string, overrides: Partial<Class> = {}): Class {
  return { id, title: 'Hebrew Bet 1', category: 'Hebrew', semester: 'Spring 2027',
    professor_id: null, meeting_days: ['Mon', 'Wed'], start_time: '10:00:00', end_time: '11:00:00', created_at: '', ...overrides }
}
const rows = buildPlannerClasses([
  course('mw'), course('tth', { meeting_days: ['Tue', 'Thu'] }),
  course('late', { end_time: '11:30:00' }), course('early', { start_time: '09:30:00' }),
  course('unknown', { meeting_days: [], start_time: null, end_time: null }),
  course('partial', { meeting_days: ['Thu'], start_time: null }),
  course('old', { semester: 'Fall 2026', category: 'Hebrew Language' }),
], [{ class_id: 'old', overall_rating: 5 }])

describe('course catalog availability', () => {
  it('opens on Spring 2027 and includes offerings without posted schedules', () => {
    expect(readCatalogFilters(new URLSearchParams())).toEqual(defaults)
    expect(filterCatalogClasses(rows, defaults).map(c => c.id)).toEqual(expect.arrayContaining(['mw', 'unknown']))
    expect(filterCatalogClasses(rows, defaults).map(c => c.id)).not.toContain('old')
  })
  it('requires every meeting to fit selected days and inclusive time boundaries', () => {
    expect(filterCatalogClasses(rows, { ...defaults, days: ['Mon', 'Tue', 'Wed'], earliest: '10:00', latest: '11:00' }).map(c => c.id)).toEqual(['mw'])
  })
  it('includes unposted schedules only by opt-in and still checks known meetings', () => {
    const filters = { ...defaults, days: ['Mon', 'Wed'], earliest: '10:00', latest: '11:00' }
    expect(filterCatalogClasses(rows, { ...filters, includeUnscheduled: true }).map(c => c.id)).toEqual(['mw', 'unknown'])
  })
  it('handles a single time boundary and rejects inverted time windows', () => {
    expect(filterCatalogClasses(rows, { ...defaults, latest: '11:00' }).map(c => c.id)).toEqual(['early', 'mw', 'tth'])
    expect(filterCatalogClasses(rows, { ...defaults, earliest: '12:00', latest: '11:00', includeUnscheduled: true })).toEqual([])
  })
  it('keeps historical ratings on the new offering', () => {
    expect(filterCatalogClasses(rows, defaults).find(c => c.id === 'mw')?.courseRating).toEqual({ average: 5, count: 1 })
  })
})

describe('course catalog subjects and discovery', () => {
  it('consolidates aliases into eight subjects', () => {
    expect(CATALOG_SUBJECTS).toHaveLength(8)
    for (const [alias, expected] of [['Hebrew Language', 'Hebrew'], ['Jewish Ethics', 'Ethics'], ['Talmud and Rabbinics', 'Talmud & Rabbinics'], ['Literature', 'Jewish Literature'], ['History', 'Jewish History'], ['Gender & Women', "Gender & Women's Studies"]]) {
      expect(catalogTaxonomy(course('a', { category: alias })).subjects).toContain(expected)
    }
  })
  it('finds one cross-listed course from either subject or compact course code', () => {
    const cross = buildPlannerClasses([course('golems', { title: 'Golems, Dybbuks & the Supernatural', category: 'Jewish Literature', course_codes: ['JGW 3530', 'LIT 3530'], catalog_instructors: ['Beverly J. Bailis', 'Sandra Fox'] })], [])
    for (const subject of ['Jewish Literature', "Gender & Women's Studies"]) {
      expect(filterCatalogClasses(cross, { ...defaults, subjects: [subject] }).map(c => c.id)).toEqual(['golems'])
    }
    for (const query of ['lit3530', 'JGW 3530', 'Sandra', 'Beverly J Bailis', 'golems supernatural']) {
      expect(filterCatalogClasses(cross, { ...defaults, query })).toHaveLength(1)
    }
  })
  it('does not turn a modern literature cross-list into a history course', () => {
    expect(catalogTaxonomy(course('lit', { category: 'Modern Jewish Studies', course_codes: ['MJS 1234', 'LIT 1234'] }))).toEqual({ subjects: ['Jewish Literature'], topics: ['Modern Jewish Studies'] })
    expect(catalogTaxonomy(course('med', { category: 'Medieval Jewish Studies', course_codes: ['MED 3999'] })).subjects).toEqual(['Jewish History'])
  })
  it('keeps non-major topics discoverable without forcing a subject and corrects legacy MDS', () => {
    expect(catalogTaxonomy(course('liturgy', { category: 'Liturgy' }))).toEqual({ subjects: [], topics: ['Prayer & Liturgy'] })
    expect(catalogTaxonomy(course('mds', { title: 'Honors Thesis (MDS)', category: 'Midrash', course_codes: ['MDS 3999'] }))).toEqual({ subjects: [], topics: ['Honors Theses', 'Interdisciplinary Studies'] })
    const extra = buildPlannerClasses([course('seminar', { category: 'Seminar' })], [])
    expect(filterCatalogClasses(extra, { ...defaults, topic: 'Seminars' })).toHaveLength(1)
  })
  it('preserves all filters in shareable URLs, including legacy category links', () => {
    const filters = { ...defaults, semester: 'all', query: 'Jewish & modern', subjects: ['Bible', 'Jewish History'], topic: 'Modern Jewish Studies', days: ['Mon', 'Wed'], earliest: '09:30', latest: '16:00', includeUnscheduled: true, sort: 'rating' as const }
    expect(readCatalogFilters(new URL(catalogUrl(filters), 'https://julpa.org').searchParams)).toEqual(filters)
    expect(readCatalogFilters(new URLSearchParams('category=Hebrew+Language')).subjects).toEqual(['Hebrew'])
    expect(readCatalogFilters(new URLSearchParams('subject=Jewish+History')).subjects).toEqual(['Jewish History'])
    expect(readCatalogFilters(new URLSearchParams('category=Liturgy')).topic).toBe('Prayer & Liturgy')
    expect(readCatalogFilters(new URLSearchParams('earliest=99:99&days=Mon,Fake')).days).toEqual(['Mon'])
    expect(readCatalogFilters(new URLSearchParams('earliest=99:99')).earliest).toBe('')
  })
  it('matches any selected subject without duplicating cross-listed offerings', () => {
    const courses = buildPlannerClasses([
      course('bible', { category: 'Bible' }), course('hebrew'),
      course('cross', { category: 'Jewish Literature', course_codes: ['JGW 3530', 'LIT 3530'] }),
    ], [])
    const matches = filterCatalogClasses(courses, { ...defaults, subjects: ['Bible', 'Jewish Literature', "Gender & Women's Studies"] })
    expect(matches.map(c => c.id).sort()).toEqual(['bible', 'cross'])
    expect(readCatalogFilters(new URLSearchParams('subjects=Bible,Bible,Unknown,Hebrew')).subjects).toEqual(['Bible', 'Hebrew'])
  })
})


describe('compact subject browsing', () => {
  it('hides honors theses by default without hiding ordinary seminars or losing the opt-in URL', () => {
    const courses = buildPlannerClasses([
      course('ordinary'), course('honors', { title: 'Honors Thesis (BIB)', category: 'Bible' }),
      course('seminar', { title: 'Thesis Writing Seminar', category: 'Seminar' }),
    ], [])
    expect(defaults.sort).toBe('subject')
    expect(filterCatalogClasses(courses, defaults).map(c => c.id)).toEqual(['ordinary', 'seminar'])
    const expanded = { ...defaults, showHonorsTheses: true }
    expect(filterCatalogClasses(courses, expanded)).toHaveLength(3)
    expect(readCatalogFilters(new URL(catalogUrl(expanded), 'https://julpa.org').searchParams)).toEqual(expanded)
    expect(readCatalogFilters(new URLSearchParams('sort=title')).sort).toBe('title')
    expect(readCatalogFilters(new URLSearchParams('sort=unknown')).sort).toBe('subject')
  })

  it('groups by subject once per offering and uses a selected cross-listed subject', () => {
    const courses = buildPlannerClasses([
      course('cross', { title: 'Golems', category: 'Jewish Literature', course_codes: ['JGW 3530', 'LIT 3530'] }),
      course('bible', { category: 'Bible' }), course('hebrew'),
      course('seminar', { category: 'Seminar' }),
    ], [])
    const groups = groupCatalogClasses(filterCatalogClasses(courses, defaults))
    expect(groups.map(g => g.subject)).toEqual(['Bible', 'Jewish Literature', 'Hebrew', 'Other courses'])
    expect(groups.flatMap(g => g.classes.map(c => c.id)).sort()).toEqual(['bible', 'cross', 'hebrew', 'seminar'])
    const subjects = ["Gender & Women's Studies"]
    const matching = filterCatalogClasses(courses, { ...defaults, subjects })
    expect(groupCatalogClasses(matching, subjects).map(g => [g.subject, g.classes.map(c => c.id)])).toEqual([["Gender & Women's Studies", ['cross']]])
  })
})
