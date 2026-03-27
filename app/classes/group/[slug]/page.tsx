import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatTime } from '@/lib/utils'
import RatingSummary from '@/components/RatingSummary'
import ReviewCard from '@/components/ReviewCard'
import ReviewList from '@/components/ReviewList'
import GroupReviewCTA from '@/components/GroupReviewCTA'
import type { Review } from '@/lib/types'

export default async function GroupClassPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const title = decodeURIComponent(slug)
  const supabase = await createClient()

  const { data: sections } = await supabase
    .from('classes')
    .select('*, professor:professors(id, name, created_at)')
    .eq('title', title)
    .order('start_time', { ascending: true })

  if (!sections || sections.length === 0) notFound()

  const classIds = sections.map(s => s.id)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .in('class_id', classIds)
    .order('created_at', { ascending: false })

  const allReviews: Review[] = reviews ?? []

  const classIdToProfessor: Record<string, string> = {}
  for (const s of sections) {
    const prof = s.professor as { id: string; name: string } | null
    classIdToProfessor[s.id] = prof?.name ?? 'Unknown'
  }

  const avgOverall = allReviews.length
    ? allReviews.reduce((sum, r) => sum + r.overall_rating, 0) / allReviews.length
    : 0
  const avgWorkload = allReviews.length
    ? allReviews.reduce((sum, r) => sum + r.workload_rating, 0) / allReviews.length
    : 0

  const topReview = allReviews.length
    ? [...allReviews].sort((a, b) => b.helpful_count - a.helpful_count)[0]
    : null

  const category = sections[0]?.category
  const semester = sections[0]?.semester

  const ctaSections = sections.map(s => ({
    id: s.id,
    professorName: (s.professor as { name: string } | null)?.name ?? 'Unknown',
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        {category && (
          <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
            {category}
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
        <div className="text-sm text-gray-400 mt-1">
          {sections.length} section{sections.length !== 1 ? 's' : ''} · {semester}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row-reverse gap-6">
        {/* Sidebar: professors & schedule */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white border border-cream-border rounded-xl p-4">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
              Professors
            </h2>
            <div className="flex flex-col gap-4">
              {sections.map(s => {
                const prof = s.professor as { id: string; name: string } | null
                const sectionReviews = allReviews.filter(r => r.class_id === s.id)
                const sectionAvg = sectionReviews.length
                  ? sectionReviews.reduce((sum, r) => sum + r.overall_rating, 0) / sectionReviews.length
                  : null
                return (
                  <div key={s.id} className="flex flex-col gap-0.5">
                    {prof ? (
                      <Link
                        href={`/professors/${prof.id}`}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {prof.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-gray-700">Unknown</span>
                    )}
                    {s.meeting_days?.length > 0 && s.start_time && (
                      <div className="text-xs text-gray-400">
                        {s.meeting_days.join('/')} · {formatTime(s.start_time)}–{formatTime(s.end_time ?? '')}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      {sectionReviews.length} review{sectionReviews.length !== 1 ? 's' : ''}
                      {sectionAvg != null && (
                        <span className="text-primary font-semibold ml-1">· {sectionAvg.toFixed(1)} ★</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {allReviews.length > 0 && (
            <RatingSummary
              avgOverall={avgOverall}
              avgWorkload={avgWorkload}
              reviewCount={allReviews.length}
            />
          )}

          {topReview && (
            <div>
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                Most Helpful Review
              </h2>
              <ReviewCard
                review={topReview}
                classId={topReview.class_id}
                professorName={classIdToProfessor[topReview.class_id]}
                highlighted
              />
            </div>
          )}

          {allReviews.length > 1 && (
            <ReviewList
              reviews={allReviews}
              classId={classIds[0]}
              classIdToProfessor={classIdToProfessor}
            />
          )}

          {allReviews.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No reviews yet — be the first!
            </div>
          )}

          <GroupReviewCTA title={title} sections={ctaSections} />
        </div>
      </div>
    </div>
  )
}
