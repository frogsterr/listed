'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export function generateVoterKey(): string {
  return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function isValidVoterKey(key: string): boolean {
  return typeof key === 'string' && key.length > 0 && key.length <= 128
}

export async function upvoteReview(
  reviewId: string,
  voterKey: string,
  classId: string
): Promise<{ error: string | null; alreadyVoted?: boolean }> {
  if (!isValidVoterKey(voterKey)) return { error: 'invalid voter key' }

  const supabase = await createClient()

  // Use the atomic RPC that handles dedup and increment together
  const { data, error } = await supabase.rpc('increment_helpful_count', {
    review_id: reviewId,
    voter_key: voterKey,
  })

  if (error) return { error: error.message }

  const result = data as { already_voted: boolean } | null
  const alreadyVoted = result?.already_voted ?? false

  if (!alreadyVoted) {
    revalidatePath(`/classes/${classId}`)
  }

  return { error: null, alreadyVoted }
}
