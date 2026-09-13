import { createClient } from '@/lib/supabase/server'
import ProfessorCard from '@/components/ProfessorCard'
import { classProfessors } from '@/lib/class-professors'
import type { Class, ProfessorWithStats } from '@/lib/types'

export default async function TopProfessorsSection() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('overall_rating, class:classes(professor_id, professor:professors!classes_professor_id_fkey(*), instructors:class_professors(professor:professors(*)))')

  if (!reviews || reviews.length === 0) return null

  const map = new Map<string, { sum: number; count: number; prof: unknown }>()
  for (const r of reviews) {
    const cls = r.class as unknown as Class | null
    if (!cls) continue
    for (const prof of classProfessors(cls)) {
      const existing = map.get(prof.id)
      map.set(prof.id, { sum: (existing?.sum ?? 0) + r.overall_rating, count: (existing?.count ?? 0) + 1, prof })
    }
  }

  const ranked: ProfessorWithStats[] = [...map.entries()]
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].sum / b[1].count - a[1].sum / a[1].count)
    .slice(0, 5)
    .map(([, v]) => {
      const prof = v.prof as Record<string, unknown>
      return { ...prof, avg_overall: v.sum / v.count, review_count: v.count } as ProfessorWithStats
    })
    .filter(p => p.id)

  if (ranked.length === 0) return null

  return (
    <div>
      <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
        🏆 Top Professors
      </h2>
      <div className="flex flex-col gap-2">
        {ranked.map(prof => <ProfessorCard key={prof.id} professor={prof} />)}
      </div>
    </div>
  )
}
