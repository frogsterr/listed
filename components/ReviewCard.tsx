'use client'

import { useState, useEffect } from 'react'
import { upvoteReview } from '@/actions/votes'
import { generateVoterKey } from '@/lib/utils'
import TagBadge from '@/components/TagBadge'
import StarDisplay from '@/components/StarDisplay'
import { workloadToLabel } from '@/lib/utils'
import type { Review } from '@/lib/types'

const VOTER_KEY_STORAGE = 'listed_voter_key'

function getOrCreateVoterKey(): string {
  if (typeof window === 'undefined') return ''
  let key = localStorage.getItem(VOTER_KEY_STORAGE)
  if (!key) {
    key = generateVoterKey()
    localStorage.setItem(VOTER_KEY_STORAGE, key)
  }
  return key
}

interface Props {
  review: Review
  classId: string
  highlighted?: boolean
}

export default function ReviewCard({ review, classId, highlighted = false }: Props) {
  const [count, setCount] = useState(review.helpful_count)
  const [voted, setVoted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const votedKey = `voted_${review.id}`
    if (localStorage.getItem(votedKey)) setVoted(true)
  }, [review.id])

  async function handleUpvote() {
    if (voted || loading) return
    setLoading(true)
    const voterKey = getOrCreateVoterKey()
    const { alreadyVoted } = await upvoteReview(review.id, voterKey, classId)
    if (!alreadyVoted) {
      setCount(c => c + 1)
      localStorage.setItem(`voted_${review.id}`, '1')
      setVoted(true)
    } else {
      setVoted(true)
    }
    setLoading(false)
  }

  return (
    <div
      className={`bg-white rounded-xl p-4 flex flex-col gap-3 ${
        highlighted ? 'border-2 border-primary' : 'border border-cream-border'
      }`}
    >
      <div className="flex justify-between items-center">
        <StarDisplay rating={review.overall_rating} size="md" />
        <span className="text-xs text-gray-400">{review.semester}</span>
      </div>

      {review.comment && (
        <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        <TagBadge tag={`Workload: ${workloadToLabel(review.workload_rating)}`} />
        {review.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
      </div>

      <div>
        <button
          onClick={handleUpvote}
          disabled={voted || loading}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            voted
              ? 'bg-cream-hover border-primary text-primary font-semibold'
              : 'bg-cream border-cream-border text-gray-500 hover:border-primary hover:text-primary'
          }`}
        >
          👍 Helpful ({count})
        </button>
      </div>
    </div>
  )
}
