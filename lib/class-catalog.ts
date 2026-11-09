import { CURRENT_SEMESTER, DAYS } from '@/lib/constants'
import { classProfessors } from '@/lib/class-professors'
import type { PlannerClass } from '@/lib/course-planner'
import type { Class } from '@/lib/types'

export const CATALOG_SUBJECTS = [
  'Bible', 'Talmud & Rabbinics', 'Jewish Thought', 'Jewish History',
  'Ethics', 'Jewish Literature', "Gender & Women's Studies", 'Hebrew',
] as const

const SUBJECT_ALIASES: Record<string, string> = {
  Bible: 'Bible', Talmud: 'Talmud & Rabbinics', Rabbinics: 'Talmud & Rabbinics',
  'Talmud & Rabbinics': 'Talmud & Rabbinics', 'Talmud and Rabbinics': 'Talmud & Rabbinics',
  Midrash: 'Talmud & Rabbinics', 'Jewish Thought': 'Jewish Thought',
  'Jewish History': 'Jewish History', History: 'Jewish History',
  Ethics: 'Ethics', 'Jewish Ethics': 'Ethics', Literature: 'Jewish Literature',
  'Jewish Literature': 'Jewish Literature', 'Gender & Women': "Gender & Women's Studies",
  "Gender & Women's Studies": "Gender & Women's Studies",
  "Jewish Gender and Women's Studies": "Gender & Women's Studies",
  Hebrew: 'Hebrew', 'Hebrew Language': 'Hebrew',
}
const PREFIX_SUBJECTS: Record<string, string> = {
  BIB: 'Bible', RLC: 'Talmud & Rabbinics', TAL: 'Talmud & Rabbinics', MID: 'Talmud & Rabbinics',
  JTH: 'Jewish Thought', HIS: 'Jewish History', ETH: 'Ethics', LIT: 'Jewish Literature',
  JGW: "Gender & Women's Studies", HEB: 'Hebrew',
}
const TOPIC_ALIASES: Record<string, string> = {
  'Medieval Jewish Studies': 'Medieval Jewish Studies', 'Modern Jewish Studies': 'Modern Jewish Studies',
  Midrash: 'Midrash', Liturgy: 'Prayer & Liturgy',
  Music: 'Music & Cantorial Arts', 'Cantorial Arts': 'Music & Cantorial Arts',
  Professional: 'Professional Studies', Seminar: 'Seminars', 'List College': 'List College',
  'Interdisciplinary Studies': 'Interdisciplinary Studies',
  'Multidisciplinary Studies': 'Interdisciplinary Studies', 'Jewish Education': 'Jewish Education',
}

// Presentation-only taxonomy: keep original catalog labels and reviews intact.
// Period-based departments supplement explicit disciplines on cross-listed courses.
export function catalogTaxonomy(course: Pick<Class, 'title' | 'category' | 'course_codes'>) {
  const prefixes = (course.course_codes ?? []).map(c => c.trim().split(/\s+/)[0].toUpperCase())
  // The older MDS thesis was mislabeled Midrash; MDS is Multidisciplinary Studies.
  const category = prefixes.includes('MDS') ? 'Multidisciplinary Studies' : course.category ?? ''
  const subjects = new Set<string>([SUBJECT_ALIASES[category], ...prefixes.map(p => PREFIX_SUBJECTS[p])].filter(Boolean))
  const topics = new Set<string>([TOPIC_ALIASES[category]].filter(Boolean))
  if (prefixes.includes('MED')) topics.add('Medieval Jewish Studies')
  if (prefixes.includes('MJS')) topics.add('Modern Jewish Studies')
  if (prefixes.includes('MID')) topics.add('Midrash')
  if (prefixes.includes('LTG')) topics.add('Prayer & Liturgy')
  if (!subjects.size && (topics.has('Medieval Jewish Studies') || topics.has('Modern Jewish Studies'))) subjects.add('Jewish History')
  // Reviewed legacy course: its administrative category is "Professional".
  if (course.title === 'Introduction to Halakhah Part II: Jewish Festivals') subjects.add('Talmud & Rabbinics')
  if (course.title === 'Nusah for Shabbat and Weekday for Non-Musicians') topics.add('Prayer & Liturgy')
  if (/\bhonors thesis\b/i.test(course.title)) topics.add('Honors Theses')
  if (subjects.has('Jewish History') && /\bmedieval\b/i.test(course.title)) topics.add('Medieval Jewish Studies')
  if (subjects.has('Jewish History') && /\bmodern\b/i.test(course.title)) topics.add('Modern Jewish Studies')
  return { subjects: CATALOG_SUBJECTS.filter(s => subjects.has(s)), topics: [...topics].sort() }
}

export interface CatalogFilters {
  semester: string
  query: string
  subject: string
  topic: string
  days: string[]
  earliest: string
  latest: string
  includeUnscheduled: boolean
  sort: 'title' | 'rating'
}
export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  semester: CURRENT_SEMESTER, query: '', subject: '', topic: '', days: [],
  earliest: '', latest: '', includeUnscheduled: false, sort: 'title',
}
const validTime = (value: string | null) => value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : ''

export function readCatalogFilters(params: Pick<URLSearchParams, 'get'>): CatalogFilters {
  const legacy = params.get('category') ?? ''
  return {
    semester: params.get('semester') || CURRENT_SEMESTER,
    query: params.get('q') ?? '',
    subject: params.get('subject') ?? SUBJECT_ALIASES[legacy] ?? '',
    topic: params.get('topic') ?? TOPIC_ALIASES[legacy] ?? '',
    days: DAYS.filter(d => (params.get('days') ?? '').split(',').includes(d)),
    earliest: validTime(params.get('earliest')), latest: validTime(params.get('latest')),
    includeUnscheduled: params.get('unscheduled') === '1',
    sort: params.get('sort') === 'rating' ? 'rating' : 'title',
  }
}

export function catalogUrl(filters: CatalogFilters) {
  const params = new URLSearchParams()
  if (filters.semester !== CURRENT_SEMESTER) params.set('semester', filters.semester)
  if (filters.query) params.set('q', filters.query)
  if (filters.subject) params.set('subject', filters.subject)
  if (filters.topic) params.set('topic', filters.topic)
  if (filters.days.length) params.set('days', filters.days.join(','))
  if (filters.earliest) params.set('earliest', filters.earliest)
  if (filters.latest) params.set('latest', filters.latest)
  if (filters.includeUnscheduled) params.set('unscheduled', '1')
  if (filters.sort !== 'title') params.set('sort', filters.sort)
  return `/classes${params.size ? `?${params}` : ''}`
}

export function hasAvailability(filters: CatalogFilters) {
  return Boolean(filters.days.length || filters.earliest || filters.latest)
}
export function hasCompleteSchedule(course: Class) {
  return Boolean(course.meeting_days?.length && course.start_time && course.end_time)
}
export function fitsAvailability(course: Class, filters: CatalogFilters) {
  if (filters.earliest && filters.latest && filters.earliest > filters.latest) return false
  if (!hasAvailability(filters)) return true
  if (!hasCompleteSchedule(course) && !filters.includeUnscheduled) return false
  // Even when incomplete schedules are included, known meetings must fit.
  if (filters.days.length && course.meeting_days?.some(day => !filters.days.includes(day))) return false
  if (filters.earliest && course.start_time && course.start_time.slice(0, 5) < filters.earliest) return false
  if (filters.latest && course.end_time && course.end_time.slice(0, 5) > filters.latest) return false
  return true
}

const normalize = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '')
export function filterCatalogClasses(classes: PlannerClass[], filters: CatalogFilters) {
  const terms = filters.query.trim().split(/\s+/).map(normalize).filter(Boolean)
  return classes.filter(course => {
    if (filters.semester !== 'all' && course.semester !== filters.semester) return false
    const taxonomy = catalogTaxonomy(course)
    if (filters.subject && !taxonomy.subjects.some(s => s === filters.subject)) return false
    if (filters.topic && !taxonomy.topics.includes(filters.topic)) return false
    const search = normalize([course.title, ...(course.course_codes ?? []),
      ...classProfessors(course).map(p => p.name), ...(course.catalog_instructors ?? []),
      ...taxonomy.subjects, ...taxonomy.topics].join(' '))
    return terms.every(term => search.includes(term)) && fitsAvailability(course, filters)
  }).sort((a, b) => {
    if (filters.sort === 'rating') {
      const rating = (b.courseRating.average ?? -1) - (a.courseRating.average ?? -1)
      if (rating) return rating
      if (a.courseRating.count !== b.courseRating.count) return b.courseRating.count - a.courseRating.count
    }
    // Keep the current term first when browsing the archive as well.
    if (filters.semester === 'all' && a.semester !== b.semester) {
      if (a.semester === CURRENT_SEMESTER) return -1
      if (b.semester === CURRENT_SEMESTER) return 1
    }
    return a.title.localeCompare(b.title) || a.semester.localeCompare(b.semester) || a.id.localeCompare(b.id)
  })
}
