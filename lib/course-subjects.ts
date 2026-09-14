import type { Class } from '@/lib/types'

// Prefixes used by the verified Fall catalog's cross-listings.
// JGW: https://www.jtsa.edu/jewish-gender-and-womens-studies/
const CROSS_LIST_SUBJECTS: Record<string, string> = {
  BIB: 'Bible', ETH: 'Jewish Ethics', HIS: 'Jewish History',
  JGW: "Jewish Gender and Women's Studies", JTH: 'Jewish Thought',
  MED: 'Medieval Jewish Studies', MJS: 'Modern Jewish Studies',
}

export function courseSubjects(course: Pick<Class, 'category' | 'course_codes'>): string[] {
  return [...new Set([
    ...(course.category ? [course.category] : []),
    ...(course.course_codes ?? []).flatMap(code => {
      const subject = CROSS_LIST_SUBJECTS[code.trim().split(/\s+/)[0]]
      return subject ? [subject] : []
    }),
  ])]
}
