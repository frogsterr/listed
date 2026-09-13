'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function loginAdmin(email: string, password: string): Promise<{ error: string | null }> {
  if (!process.env.ADMIN_USER_ID) return { error: 'Admin access has not been configured.' }
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return { error: 'Enter your email and password.' }
  }
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error || data.user?.id !== process.env.ADMIN_USER_ID) {
    if (data.session) await supabase.auth.signOut()
    return { error: 'Unable to sign in with these admin credentials.' }
  }
  revalidatePath('/admin')
  return { error: null }
}

export async function logoutAdmin(): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) return { error: 'Unable to sign out. Please try again.' }
  revalidatePath('/', 'layout')
  return { error: null }
}
