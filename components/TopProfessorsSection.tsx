import { createClient } from '@/lib/supabase/server'
import ProfessorCard from '@/components/ProfessorCard'
import type { ProfessorWithStats } from '@/lib/types'

export default async function TopProfessorsSection() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('overall_rating, class:classes(professor_id)')

  if (!reviews || reviews.length === 0) return null

  const map = new Map<string, { sum: number; count: number }>()
  for (const r of reviews) {
    const profId = (r.class as unknown as { professor_id: string | null })?.professor_id
    if (!profId) continue
    const existing = map.get(profId) ?? { sum: 0, count: 0 }
    map.set(profId, { sum: existing.sum + r.overall_rating, count: existing.count + 1 })
  }

  const qualifiedIds = [...map.entries()]
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].sum / b[1].count - a[1].sum / a[1].count)
    .slice(0, 5)
    .map(([id]) => id)

  if (qualifiedIds.length === 0) return null

  const { data: professors } = await supabase
    .from('professors')
    .select('*')
    .in('id', qualifiedIds)

  if (!professors) return null

  const ranked: ProfessorWithStats[] = qualifiedIds
    .map(id => {
      const prof = professors.find(p => p.id === id)
      if (!prof) return null
      const stats = map.get(id)!
      return { ...prof, avg_overall: stats.sum / stats.count, review_count: stats.count }
    })
    .filter(Boolean) as ProfessorWithStats[]

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
