import { createClient } from '@/lib/supabase/server'
import { CURRENT_SEMESTER, SEMESTERS } from '@/lib/constants'
import CoursePlanner from '@/components/CoursePlanner'
import { buildPlannerClasses } from '@/lib/course-planner'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ semester?: string }>
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const { semester: semesterParam } = await searchParams
  const semester = semesterParam ?? CURRENT_SEMESTER
  const supabase = await createClient()

  const [classes, reviews] = await Promise.all([
    supabase.from('classes').select('*, professor:professors!classes_professor_id_fkey(id, name, created_at), instructors:class_professors(professor:professors(*))'),
    supabase.from('reviews').select('class_id, overall_rating'),
  ])
  if (classes.error || reviews.error) {
    return <p role="alert" className="p-6">Unable to load course offerings. Please try again.</p>
  }
  const allClasses = buildPlannerClasses(classes.data ?? [], reviews.data ?? []).filter(c => c.semester === semester)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-lg font-bold text-gray-900">Choose Your Classes</h1>
        <div className="flex gap-2 flex-wrap">
          {SEMESTERS.map(s => (
            <Link
              key={s}
              href={`/schedule?semester=${encodeURIComponent(s)}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                s === semester
                  ? 'bg-primary text-white border-primary'
                  : 'border-cream-border text-gray-500 bg-white hover:border-primary'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {allClasses.length ? <CoursePlanner key={semester} classes={allClasses} /> : (
        <div className="text-center py-8 text-gray-500 text-sm">
          No course offerings have been added for {semester} yet.
        </div>
      )}
    </div>
  )
}
