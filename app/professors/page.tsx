import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StarDisplay from '@/components/StarDisplay'

export default async function ProfessorsPage() {
  const supabase = await createClient()

  const { data: professors } = await supabase.from('professors').select('*').order('name')
  const { data: reviews } = await supabase
    .from('reviews')
    .select('overall_rating, class:classes(professor_id)')

  const statsMap = new Map<string, { sum: number; count: number }>()
  for (const r of reviews ?? []) {
    const profId = (r.class as unknown as { professor_id: string | null })?.professor_id
    if (!profId) continue
    const existing = statsMap.get(profId) ?? { sum: 0, count: 0 }
    statsMap.set(profId, { sum: existing.sum + r.overall_rating, count: existing.count + 1 })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-900">All Professors</h1>
        <Link
          href="/professors/add"
          className="text-sm bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          + Add Professor
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {(professors ?? []).map(prof => {
          const stats = statsMap.get(prof.id)
          const avg = stats ? stats.sum / stats.count : null
          return (
            <Link key={prof.id} href={`/professors/${prof.id}`}>
              <div className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-center hover:border-primary transition-colors">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{prof.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {stats ? `${stats.count} reviews` : 'No reviews yet'}
                  </div>
                </div>
                {avg != null && (
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-sm font-bold text-primary">{avg.toFixed(1)}</span>
                    <StarDisplay rating={avg} />
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
