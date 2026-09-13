'use server'

import { isAdmin } from '@/lib/admin'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

interface ClassInput {
  title: string
  category?: string
  requirements?: string[]
  professor_id?: string
  meeting_days: string[]
  start_time?: string
  end_time?: string
  semester: string
}

export async function addClass(input: ClassInput): Promise<{ error: string | null; id?: string }> {
  if (!(await isAdmin())) return { error: 'Admin access required.' }
  if (!input.title.trim()) return { error: 'Title is required' }
  if (!input.semester) return { error: 'Semester is required' }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('classes')
    .insert({
      title: input.title.trim(),
      category: input.category?.trim() || null,
      professor_id: input.professor_id || null,
      meeting_days: input.meeting_days,
      requirements: input.requirements ?? [],
      start_time: input.start_time || null,
      end_time: input.end_time || null,
      semester: input.semester,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { error: null, id: data.id }
}

export async function deleteClass(classId: string): Promise<{ error: string | null }> {
  if (!(await isAdmin())) return { error: 'Admin access required.' }
  const supabase = createServiceClient()
  const { error } = await supabase.from('classes').delete().eq('id', classId)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { error: null }
}
