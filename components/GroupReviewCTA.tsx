'use client'

import { useState } from 'react'
import ReviewModal from '@/components/ReviewModal'

interface Section {
  id: string
  professorName: string
}

interface Props {
  title: string
  sections: Section[]
}

export default function GroupReviewCTA({ title, sections }: Props) {
  const [selectedId, setSelectedId] = useState(sections[0]?.id ?? '')
  const selected = sections.find(s => s.id === selectedId) ?? sections[0]

  if (!selected) return null

  return (
    <div className="flex flex-col gap-2">
      {sections.length > 1 && (
        <div className="bg-white border border-cream-border rounded-xl px-4 py-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
            Which section did you take?
          </label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
          >
            {sections.map(s => (
              <option key={s.id} value={s.id}>{s.professorName}</option>
            ))}
          </select>
        </div>
      )}
      <ReviewModal classId={selected.id} className={title} professorName={selected.professorName} />
    </div>
  )
}
