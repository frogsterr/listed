'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function addProfessor(name: string): Promise<{ error: string | null; id?: string }> {
  if (!name.trim()) return { error: 'Name is required' }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('professors')
    .insert({ name: name.trim() })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/professors')
  return { error: null, id: data.id }
}

export async function deleteProfessor(professorId: string): Promise<{ error: string | null }> {
  const supabase = createServiceClient()
  const { error } = await supabase.from('professors').delete().eq('id', professorId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { error: null }
}
