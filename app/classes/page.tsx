import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StarDisplay from '@/components/StarDisplay'

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; semester?: string }>
}

export default async function ClassesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const query = params.q ?? ''

  let classQuery = supabase
    .from('classes')
    .select('*, professor:professors(id, name, created_at)')
    .order('title')

  if (params.category) classQuery = classQuery.eq('category', params.category)
  if (params.semester) classQuery = classQuery.eq('semester', params.semester)

  const { data: classes } = await classQuery

  // Get review stats for all classes
  const { data: reviews } = await supabase
    .from('reviews')
    .select('class_id, overall_rating')

  const statsMap = new Map<string, { sum: number; count: number }>()
  for (const r of reviews ?? []) {
    const existing = statsMap.get(r.class_id) ?? { sum: 0, count: 0 }
    statsMap.set(r.class_id, { sum: existing.sum + r.overall_rating, count: existing.count + 1 })
  }

  const filtered = (classes ?? []).filter(cls =>
    query
      ? cls.title.toLowerCase().includes(query.toLowerCase()) ||
        cls.professor?.name?.toLowerCase().includes(query.toLowerCase())
      : true
  )

  const categories = [...new Set((classes ?? []).map(c => c.category).filter(Boolean))]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-900">All Classes</h1>
        <Link
          href="/classes/add"
          className="text-sm bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          + Add Class
        </Link>
      </div>

      {/* Search bar */}
      <form className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search classes or professors..."
          className="w-full border border-cream-border rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:border-primary"
        />
      </form>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <Link
            href="/classes"
            className={`text-xs px-3 py-1 rounded-full border ${!params.category ? 'bg-primary text-white border-primary' : 'border-cream-border text-gray-500 bg-white'}`}
          >
            All
          </Link>
          {categories.map(cat => (
            <Link
              key={cat}
              href={`/classes?category=${encodeURIComponent(cat!)}`}
              className={`text-xs px-3 py-1 rounded-full border ${params.category === cat ? 'bg-primary text-white border-primary' : 'border-cream-border text-gray-500 bg-white'}`}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No classes found.{' '}
          <Link href="/classes/add" className="text-primary font-semibold">
            Add one?
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(cls => {
            const stats = statsMap.get(cls.id)
            const avg = stats ? stats.sum / stats.count : null
            return (
              <Link key={cls.id} href={`/classes/${cls.id}`}>
                <div className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-center hover:border-primary transition-colors">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{cls.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {cls.professor?.name ?? 'Unknown'} · {cls.semester}
                    </div>
                    {cls.category && (
                      <span className="text-[10px] text-primary font-semibold uppercase tracking-wide">
                        {cls.category}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-0.5 ml-4 shrink-0">
                    {avg != null ? (
                      <>
                        <span className="text-sm font-bold text-primary">{avg.toFixed(1)}</span>
                        <StarDisplay rating={avg} />
                        <span className="text-[10px] text-gray-400">{stats!.count} reviews</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-300">No reviews yet</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
