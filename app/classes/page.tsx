import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { buildPlannerClasses } from '@/lib/course-planner'
import CourseCatalog from '@/components/CourseCatalog'

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

export default async function ClassesPage() {
  const supabase = await createClient()
  const [classes, reviews] = await Promise.all([
    supabase.from('classes').select('*, professor:professors!classes_professor_id_fkey(id, name, created_at), instructors:class_professors(professor:professors(*))'),
    supabase.from('reviews').select('class_id, overall_rating'),
  ])
  if (classes.error || reviews.error) {
    return <p role="alert" className="mx-auto max-w-6xl p-6">Unable to load classes. Please try again.</p>
  }
  const offerings = buildPlannerClasses(classes.data ?? [], reviews.data ?? [])
  return <Suspense fallback={<p role="status" className="p-6 text-sm text-gray-500">Loading classes…</p>}>
    <CourseCatalog classes={offerings} />
  </Suspense>
}
