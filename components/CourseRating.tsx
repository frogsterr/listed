import type { RatingStats } from '@/lib/course-planner'

export default function CourseRating({ label, stats }: { label: string; stats: RatingStats }) {
  return <div className="text-xs text-gray-500"><span className="font-semibold text-gray-700">{label}: </span>
    {stats.average === null ? 'No reviews yet' : `${stats.average.toFixed(1)} / 5 · ${stats.count} review${stats.count === 1 ? '' : 's'}`}
  </div>
}
