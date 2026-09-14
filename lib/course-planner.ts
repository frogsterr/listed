import { courseSubjects } from '@/lib/course-subjects'
import { classProfessors } from '@/lib/class-professors'
import type { Class, Professor } from '@/lib/types'

export interface RatingStats { average: number | null; count: number }
export interface PlannerClass extends Class {
  courseRating: RatingStats
  professorRating: RatingStats
  professorRatings: { professor: Professor; stats: RatingStats }[]
}
export interface PlannerFilters {
  query: string
  category: string
  requirement: string
  day: string
  earliest: string
  latest: string
  minCourseRating: number
  minProfessorRating: number
  minReviews: number
  sort: 'title' | 'course' | 'professor'
}
export const DEFAULT_FILTERS: PlannerFilters = {
  query: '', category: '', requirement: '', day: '', earliest: '', latest: '',
  minCourseRating: 0, minProfessorRating: 0, minReviews: 0, sort: 'title',
}

// Historical course ratings use an exact title match across offerings and semesters.
// Professor ratings use the professor ID across all their offerings.
export function buildPlannerClasses(classes: Class[], reviews: { class_id: string; overall_rating: number }[]): PlannerClass[] {
  const byId = new Map(classes.map(c => [c.id, c]))
  const course = new Map<string, number[]>()
  const professor = new Map<string, number[]>()
  for (const review of reviews) {
    const cls = byId.get(review.class_id)
    if (!cls) continue
    const ratings = course.get(cls.title) ?? []
    ratings.push(review.overall_rating)
    course.set(cls.title, ratings)
    const ids = new Set([...(cls.professor_id ? [cls.professor_id] : []), ...classProfessors(cls).map(p => p.id)])
    for (const id of ids) {
      const ratings = professor.get(id) ?? []
      ratings.push(review.overall_rating)
      professor.set(id, ratings)
    }
  }
  const stats = (ratings: number[] = []): RatingStats => ({
    average: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    count: ratings.length,
  })
  return classes.map(cls => {
    const professorRatings = classProfessors(cls).map(p => ({ professor: p, stats: stats(professor.get(p.id)) }))
    const best = [...professorRatings].sort((a, b) => (b.stats.average ?? -1) - (a.stats.average ?? -1) || b.stats.count - a.stats.count)[0]
    return { ...cls, courseRating: stats(course.get(cls.title)), professorRating: best?.stats ?? stats(), professorRatings }
  })
}

export function filterPlannerClasses(classes: PlannerClass[], filters: PlannerFilters): PlannerClass[] {
  const query = filters.query.trim().toLowerCase()
  return classes.filter(c => {
    if (query && !`${c.title} ${(c.course_codes ?? []).join(' ')} ${classProfessors(c).map(p => p.name).join(' ')}`.toLowerCase().includes(query)) return false
    if (filters.category && !courseSubjects(c).includes(filters.category) && !c.course_codes?.some(code => code.startsWith(`${filters.category} `))) return false
    if (filters.requirement && !c.requirements?.includes(filters.requirement)) return false
    if (filters.day && !c.meeting_days?.includes(filters.day)) return false
    if (filters.earliest && (!c.start_time || c.start_time < filters.earliest)) return false
    if (filters.latest && (!c.end_time || c.end_time.slice(0, 5) > filters.latest)) return false
    if (filters.minCourseRating && (c.courseRating.average ?? 0) < filters.minCourseRating) return false
    if (filters.minProfessorRating && (c.professorRating.average ?? 0) < filters.minProfessorRating) return false
    if (filters.minReviews && c.courseRating.count < filters.minReviews) return false
    return true
  }).sort((a, b) => {
    const key = filters.sort === 'course' ? 'courseRating' : 'professorRating'
    if (filters.sort !== 'title') {
      const diff = (b[key].average ?? -1) - (a[key].average ?? -1)
      if (diff) return diff
      if (a[key].count !== b[key].count) return b[key].count - a[key].count
    }
    return a.title.localeCompare(b.title) || (a.professor?.name ?? '').localeCompare(b.professor?.name ?? '') || a.id.localeCompare(b.id)
  })
}
