import { isAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import AdminLogin from '@/components/AdminLogin'
import AdminPanel from '@/components/AdminPanel'

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin />
  const supabase = await createClient()
  const [reviews, classes, professors] = await Promise.all([
    supabase.from('reviews').select('*, class:classes(title)').order('created_at', { ascending: false }),
    supabase.from('classes').select('*, professor:professors!classes_professor_id_fkey(*)').order('title'),
    supabase.from('professors').select('*').order('name'),
  ])
  if (reviews.error || classes.error || professors.error) {
    return <p role="alert" className="p-6">Unable to load admin data. Please try again.</p>
  }
  return <AdminPanel initialReviews={reviews.data ?? []} initialClasses={classes.data ?? []} initialProfessors={professors.data ?? []} />
}
