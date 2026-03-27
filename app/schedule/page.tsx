import { createClient } from '@/lib/supabase/server'
import { CURRENT_SEMESTER, SEMESTERS } from '@/lib/constants'
import ScheduleCalendar from '@/components/ScheduleCalendar'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ semester?: string }>
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const { semester: semesterParam } = await searchParams
  const semester = semesterParam ?? CURRENT_SEMESTER
  const supabase = await createClient()

  const { data: classes } = await supabase
    .from('classes')
    .select('*, professor:professors(id, name, created_at)')
    .eq('semester', semester)
    .not('start_time', 'is', null)

  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-lg font-bold text-gray-900">Weekly Schedule</h1>
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

      <div className="bg-white border border-cream-border rounded-xl overflow-hidden">
        <ScheduleCalendar classes={classes ?? []} />
      </div>

      {(!classes || classes.length === 0) && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No classes with scheduled times for {semester}.
        </div>
      )}
    </div>
  )
}
