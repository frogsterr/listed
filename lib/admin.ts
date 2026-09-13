import { createClient } from '@/lib/supabase/server'

// The configured Auth user ID is server-only; user-editable metadata is never trusted.
export async function isAdmin(): Promise<boolean> {
  const adminId = process.env.ADMIN_USER_ID
  if (!adminId) return false
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    return !error && user?.id === adminId
  } catch {
    return false
  }
}
