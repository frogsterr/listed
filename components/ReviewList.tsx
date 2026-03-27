'use client'

import { useState } from 'react'
import ReviewCard from '@/components/ReviewCard'
import type { Review } from '@/lib/types'

interface Props {
  reviews: Review[]
  classId: string
  classIdToProfessor?: Record<string, string>
}

export default function ReviewList({ reviews, classId, classIdToProfessor }: Props) {
  const [sort, setSort] = useState<'recent' | 'helpful'>('recent')

  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'helpful') return b.helpful_count - a.helpful_count
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xs font-bold text-primary uppercase tracking-widest">
          All Reviews
        </h2>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as 'recent' | 'helpful')}
          className="text-xs border border-cream-border rounded-lg px-2 py-1.5 bg-white text-gray-600 outline-none"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>
      <div className="flex flex-col gap-3">
        {sorted.map(r => (
          <ReviewCard
            key={r.id}
            review={r}
            classId={classId}
            professorName={classIdToProfessor?.[r.class_id]}
          />
        ))}
      </div>
    </div>
  )
}
