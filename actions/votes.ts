'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isValidVoterKey } from '@/lib/utils'

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
