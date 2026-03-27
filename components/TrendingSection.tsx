import { createClient } from '@/lib/supabase/server'
import { CURRENT_SEMESTER } from '@/lib/constants'
import ClassCard from '@/components/ClassCard'
import type { ClassWithStats } from '@/lib/types'

export default async function TrendingSection() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('class_id, overall_rating')
    .eq('semester', CURRENT_SEMESTER)

  if (!reviews || reviews.length === 0) return null

  const map = new Map<string, { sum: number; count: number }>()
  for (const r of reviews) {
    const existing = map.get(r.class_id) ?? { sum: 0, count: 0 }
    map.set(r.class_id, { sum: existing.sum + r.overall_rating, count: existing.count + 1 })
  }

  const qualifiedIds = [...map.entries()]
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].sum / b[1].count - a[1].sum / a[1].count)
    .slice(0, 5)
    .map(([id]) => id)

  if (qualifiedIds.length === 0) return null

  const { data: classes } = await supabase
    .from('classes')
    .select('*, professor:professors(id, name, created_at)')
    .in('id', qualifiedIds)

  if (!classes) return null

  const ranked: ClassWithStats[] = qualifiedIds
    .map(id => {
      const cls = classes.find(c => c.id === id)
      if (!cls) return null
      const stats = map.get(id)!
      return { ...cls, avg_overall: stats.sum / stats.count, review_count: stats.count }
    })
    .filter(Boolean) as ClassWithStats[]

  return (
    <div>
      <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
        🔥 Trending This Semester
      </h2>
      <div className="flex flex-col gap-2">
        {ranked.map(cls => <ClassCard key={cls.id} cls={cls} />)}
      </div>
    </div>
  )
}
