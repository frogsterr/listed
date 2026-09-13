import type { Class, Professor } from '@/lib/types'

export function classProfessors(cls: Pick<Class, 'professor' | 'instructors'>): Professor[] {
  const people = [...(cls.professor ? [cls.professor] : []), ...(cls.instructors ?? []).flatMap(i => i.professor ? [i.professor] : [])]
  return [...new Map(people.map(p => [p.id, p])).values()]
}
