'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ReviewInput {
  class_id: string
  overall_rating: number
  workload_rating: number
  semester: string
  comment?: string
  tags?: string[]
}

export function validateReviewInput(input: ReviewInput): string | null {
  if (!input.class_id) return 'class is required'
  if (input.overall_rating < 1 || input.overall_rating > 5) return 'rating must be 1–5'
  if (input.workload_rating < 1 || input.workload_rating > 5) return 'workload must be 1–5'
  if (!input.semester) return 'semester is required'
  return null
}

export async function submitReview(input: ReviewInput): Promise<{ error: string | null }> {
  const error = validateReviewInput(input)
  if (error) return { error }

  const supabase = await createClient()
  const { error: dbError } = await supabase.from('reviews').insert({
    class_id: input.class_id,
    overall_rating: input.overall_rating,
    workload_rating: input.workload_rating,
    semester: input.semester,
    comment: input.comment ?? null,
    tags: input.tags ?? [],
  })

  if (dbError) return { error: dbError.message }

  revalidatePath(`/classes/${input.class_id}`)
  return { error: null }
}

export async function deleteReview(reviewId: string): Promise<{ error: string | null }> {
  const { createServiceClient } = await import('@/lib/supabase/service')
  const supabase = createServiceClient()
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { error: null }
}
