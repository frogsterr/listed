'use client'

import { useState } from 'react'
import { submitReview } from '@/actions/reviews'
import { TAGS, WORKLOAD_LABELS, SEMESTERS } from '@/lib/constants'

interface Props {
  classId: string
  className: string
  professorName: string
}

export default function ReviewModal({ classId, className, professorName }: Props) {
  const [open, setOpen] = useState(false)
  const [overall, setOverall] = useState(0)
  const [workload, setWorkload] = useState(0)
  const [semester, setSemester] = useState(SEMESTERS[0])
  const [comment, setComment] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  async function handleSubmit() {
    if (overall === 0 || workload === 0) {
      setError('Please select an overall rating and workload.')
      return
    }
    setSubmitting(true)
    setError(null)
    const { error: err } = await submitReview({
      class_id: classId,
      overall_rating: overall,
      workload_rating: workload,
      semester,
      comment: comment || undefined,
      tags: selectedTags,
    })
    setSubmitting(false)
    if (err) {
      setError(err)
    } else {
      setSuccess(true)
      setTimeout(() => { setOpen(false); setSuccess(false) }, 1500)
    }
  }

  return (
    <>
      {/* CTA trigger */}
      <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-5 text-center text-white">
        <div className="font-bold text-sm mb-1">Taken this class?</div>
        <div className="text-xs opacity-90 mb-3">Your anonymous review helps future students.</div>
        <button
          onClick={() => setOpen(true)}
          className="bg-white text-primary font-bold text-sm px-5 py-2.5 rounded-lg w-full hover:bg-cream transition-colors"
        >
          + Write a Review
        </button>
      </div>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-primary text-white px-5 py-4 flex justify-between items-start rounded-t-2xl">
              <div>
                <div className="font-bold">Write a Review</div>
                <div className="text-xs opacity-85 mt-0.5">{className} · {professorName}</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-xl leading-none">✕</button>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {success ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">🎉</div>
                  <div className="font-bold text-gray-800">Review submitted!</div>
                  <div className="text-sm text-gray-500 mt-1">Thank you for helping your peers.</div>
                </div>
              ) : (
                <>
                  {/* Semester */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                      When did you take this?
                    </label>
                    <select
                      value={semester}
                      onChange={e => setSemester(e.target.value)}
                      className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
                    >
                      {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Overall rating */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                      Overall Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => setOverall(n)}
                          className={`flex-1 py-2.5 rounded-lg border text-center transition-colors ${
                            overall === n
                              ? 'border-primary bg-cream-hover text-primary font-bold'
                              : 'border-cream-border bg-cream text-gray-400'
                          }`}
                        >
                          <div className="text-sm">{'★'.repeat(n)}</div>
                          <div className="text-[10px] mt-0.5">{n}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Workload */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                      Workload
                    </label>
                    <div className="flex gap-1.5">
                      {([1, 2, 3, 4, 5] as const).map(n => (
                        <button
                          key={n}
                          onClick={() => setWorkload(n)}
                          className={`flex-1 py-2 rounded-lg border text-[10px] transition-colors leading-tight ${
                            workload === n
                              ? 'border-primary bg-cream-hover text-primary font-bold'
                              : 'border-cream-border bg-cream text-gray-400'
                          }`}
                        >
                          {WORKLOAD_LABELS[n]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-3">
                      Tags <span className="font-normal normal-case text-gray-400">(pick all that apply)</span>
                    </label>
                    <div className="flex flex-col gap-3">
                      {TAGS.map(group => (
                        <div key={group.group}>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">{group.group}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {group.tags.map(tag => (
                              <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
                                  selectedTags.includes(tag)
                                    ? 'bg-cream-hover border-primary text-primary font-semibold'
                                    : 'bg-white border-cream-border text-gray-500'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                      Your Review <span className="font-normal normal-case text-gray-400">(anonymous)</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your honest experience..."
                      rows={3}
                      className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary resize-none"
                    />
                  </div>

                  {error && <div className="text-red-500 text-xs">{error}</div>}

                  {/* Anonymous reminder + submit */}
                  <div className="flex items-center gap-2 bg-cream-hover rounded-lg px-3 py-2.5">
                    <span>🔒</span>
                    <span className="text-xs text-gray-500">Your review is completely anonymous. No account needed.</span>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-primary text-white font-bold text-sm py-3 rounded-lg w-full hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
