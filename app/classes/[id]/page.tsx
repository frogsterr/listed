import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatTime } from '@/lib/utils'
import RatingSummary from '@/components/RatingSummary'
import ReviewCard from '@/components/ReviewCard'
import ReviewList from '@/components/ReviewList'
import ReviewModal from '@/components/ReviewModal'
import type { Review } from '@/lib/types'

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cls } = await supabase
    .from('classes')
    .select('*, professor:professors(id, name, created_at)')
    .eq('id', id)
    .single()

  if (!cls) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('class_id', id)
    .order('created_at', { ascending: false })

  const allReviews: Review[] = reviews ?? []
  const avgOverall = allReviews.length
    ? allReviews.reduce((s, r) => s + r.overall_rating, 0) / allReviews.length
    : 0
  const avgWorkload = allReviews.length
    ? allReviews.reduce((s, r) => s + r.workload_rating, 0) / allReviews.length
    : 0

  const topReview = allReviews.length
    ? [...allReviews].sort((a, b) => b.helpful_count - a.helpful_count)[0]
    : null

  const timeLabel =
    cls.start_time && cls.end_time
      ? `${formatTime(cls.start_time)}–${formatTime(cls.end_time)}`
      : null

  const professor = cls.professor as { id: string; name: string } | null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        {cls.category && (
          <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
            {cls.category}
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{cls.title}</h1>
        <div className="text-sm text-gray-400 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          {professor && (
            <Link href={`/professors/${professor.id}`} className="text-primary font-semibold hover:underline">
              {professor.name}
            </Link>
          )}
          <span>{cls.semester}</span>
          {cls.meeting_days?.length > 0 && <span>{cls.meeting_days.join('/')}</span>}
          {timeLabel && <span>{timeLabel}</span>}
        </div>
      </div>

      {/* Rating summary */}
      {allReviews.length > 0 && (
        <RatingSummary
          avgOverall={avgOverall}
          avgWorkload={avgWorkload}
          reviewCount={allReviews.length}
        />
      )}

      {/* Most helpful review */}
      {topReview && (
        <div>
          <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
            🏅 Most Helpful Review
          </h2>
          <ReviewCard review={topReview} classId={id} highlighted />
        </div>
      )}

      {/* All reviews */}
      {allReviews.length > 1 && (
        <ReviewList reviews={allReviews} classId={id} />
      )}

      {allReviews.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No reviews yet — be the first!
        </div>
      )}

      {/* Write review CTA */}
      <ReviewModal
        classId={id}
        className={cls.title}
        professorName={professor?.name ?? 'Unknown professor'}
      />
    </div>
  )
}
