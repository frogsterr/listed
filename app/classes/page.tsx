import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ClassSearchInput from '@/components/ClassSearchInput'
import GroupedClassCard from '@/components/GroupedClassCard'

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string }>
}

export interface ClassSection {
  id: string
  professor_name: string | null
  meeting_days: string[] | null
  start_time: string | null
  end_time: string | null
  avg_rating: number | null
  review_count: number
}

export interface ClassGroup {
  title: string
  category: string | null
  semester: string | null
  sections: ClassSection[]
  total_reviews: number
  avg_rating: number | null
}

export default async function ClassesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const query = params.q ?? ''

  const [{ data: classes }, { data: reviews }] = await Promise.all([
    supabase
      .from('classes')
      .select('*, professor:professors(id, name)')
      .order('title'),
    supabase
      .from('reviews')
      .select('class_id, overall_rating'),
  ])

  // Build stats map
  const statsMap = new Map<string, { sum: number; count: number }>()
  for (const r of reviews ?? []) {
    const existing = statsMap.get(r.class_id) ?? { sum: 0, count: 0 }
    statsMap.set(r.class_id, { sum: existing.sum + r.overall_rating, count: existing.count + 1 })
  }

  // Filter by query and category
  const filtered = (classes ?? []).filter(cls => {
    const matchesQuery = query
      ? cls.title.toLowerCase().includes(query.toLowerCase()) ||
        (cls.professor as unknown as { name: string } | null)?.name?.toLowerCase().includes(query.toLowerCase())
      : true
    const matchesCategory = params.category ? cls.category === params.category : true
    return matchesQuery && matchesCategory
  })

  // Group by title
  const groupMap = new Map<string, ClassGroup>()
  for (const cls of filtered) {
    const profName = (cls.professor as unknown as { name: string } | null)?.name ?? null
    const stats = statsMap.get(cls.id)

    if (!groupMap.has(cls.title)) {
      groupMap.set(cls.title, {
        title: cls.title,
        category: cls.category ?? null,
        semester: cls.semester ?? null,
        sections: [],
        total_reviews: 0,
        avg_rating: null,
      })
    }
    const group = groupMap.get(cls.title)!
    group.sections.push({
      id: cls.id,
      professor_name: profName,
      meeting_days: cls.meeting_days ?? null,
      start_time: cls.start_time ?? null,
      end_time: cls.end_time ?? null,
      avg_rating: stats ? stats.sum / stats.count : null,
      review_count: stats?.count ?? 0,
    })
    if (stats) {
      const prevTotal = (group.avg_rating ?? 0) * group.total_reviews
      group.total_reviews += stats.count
      group.avg_rating = (prevTotal + stats.sum) / group.total_reviews
    }
  }

  const groups = [...groupMap.values()]
  const categories = [...new Set((classes ?? []).map(c => c.category).filter(Boolean))]
  const titleSuggestions = [...new Set((classes ?? []).map(c => c.title))].sort()

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

      <ClassSearchInput
        suggestions={titleSuggestions}
        defaultValue={query}
        extraParams={{ ...(params.category ? { category: params.category } : {}) }}
      />

      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <Link
            href={params.category ? '/classes' : '#'}
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

      {groups.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No classes found.{' '}
          <Link href="/classes/add" className="text-primary font-semibold">Add one?</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map(group => (
            <GroupedClassCard key={group.title} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}
