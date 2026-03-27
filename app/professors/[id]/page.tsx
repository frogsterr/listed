import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReviewList from '@/components/ReviewList'
import ClassCard from '@/components/ClassCard'
import type { ClassWithStats, Review } from '@/lib/types'

export default async function ProfessorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: professor } = await supabase
    .from('professors')
    .select('*')
    .eq('id', id)
    .single()

  if (!professor) notFound()

  const { data: classes } = await supabase
    .from('classes')
    .select('*, professor:professors(id, name, created_at)')
    .eq('professor_id', id)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .in('class_id', (classes ?? []).map(c => c.id))
    .order('created_at', { ascending: false })

  const allReviews: Review[] = reviews ?? []

  const statsMap = new Map<string, { sum: number; count: number }>()
  for (const r of allReviews) {
    const existing = statsMap.get(r.class_id) ?? { sum: 0, count: 0 }
    statsMap.set(r.class_id, { sum: existing.sum + r.overall_rating, count: existing.count + 1 })
  }

  const classesWithStats: ClassWithStats[] = (classes ?? []).map(cls => {
    const stats = statsMap.get(cls.id) ?? { sum: 0, count: 0 }
    return {
      ...cls,
      avg_overall: stats.count > 0 ? stats.sum / stats.count : 0,
      review_count: stats.count,
    }
  })

  const avgOverall = allReviews.length
    ? allReviews.reduce((s, r) => s + r.overall_rating, 0) / allReviews.length
    : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      <div className="bg-white border border-cream-border rounded-xl p-5">
        <h1 className="text-2xl font-bold text-gray-900">{professor.name}</h1>
        <div className="flex gap-4 mt-2 text-sm text-gray-500">
          {allReviews.length > 0 && (
            <>
              <span className="text-primary font-bold text-lg">{avgOverall.toFixed(1)} ★</span>
              <span>{allReviews.length} total reviews</span>
            </>
          )}
        </div>
      </div>

      {classesWithStats.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Classes</h2>
          <div className="flex flex-col gap-2">
            {classesWithStats.map(cls => <ClassCard key={cls.id} cls={cls} />)}
          </div>
        </div>
      )}

      {allReviews.length > 0 && (
        <ReviewList reviews={allReviews} classId="" />
      )}

      {allReviews.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">No reviews yet.</div>
      )}
    </div>
  )
}
