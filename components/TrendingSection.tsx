import { createClient } from '@/lib/supabase/server'
import { CURRENT_SEMESTER } from '@/lib/constants'
import ClassCard from '@/components/ClassCard'
import type { ClassWithStats } from '@/lib/types'

export default async function TrendingSection() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('class_id, overall_rating, class:classes(*, professor:professors(id, name, created_at))')
    .eq('semester', CURRENT_SEMESTER)

  if (!reviews || reviews.length === 0) return null

  const map = new Map<string, { sum: number; count: number; cls: unknown }>()
  for (const r of reviews) {
    const existing = map.get(r.class_id)
    map.set(r.class_id, {
      sum: (existing?.sum ?? 0) + r.overall_rating,
      count: (existing?.count ?? 0) + 1,
      cls: (r as unknown as { class: unknown }).class ?? existing?.cls,
    })
  }

  const ranked: ClassWithStats[] = [...map.entries()]
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].sum / b[1].count - a[1].sum / a[1].count)
    .slice(0, 5)
    .map(([, v]) => {
      const cls = v.cls as Record<string, unknown>
      return { ...cls, avg_overall: v.sum / v.count, review_count: v.count } as ClassWithStats
    })
    .filter(c => c.id)

  if (ranked.length === 0) return null

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
