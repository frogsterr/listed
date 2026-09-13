'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteReview } from '@/actions/reviews'
import { deleteClass } from '@/actions/classes'
import { deleteProfessor } from '@/actions/professors'
import { logoutAdmin } from '@/actions/admin'
import type { Class, Professor, Review } from '@/lib/types'

type AdminReview = Review & { class: { title: string } | null }

export default function AdminPanel({ initialReviews, initialClasses, initialProfessors }: {
  initialReviews: AdminReview[]; initialClasses: Class[]; initialProfessors: Professor[]
}) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState<AdminReview[]>(initialReviews)
  const [classes, setClasses] = useState<Class[]>(initialClasses)
  const [professors, setProfessors] = useState<Professor[]>(initialProfessors)
  const [tab, setTab] = useState<'reviews' | 'classes' | 'professors'>('reviews')

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-lg font-bold text-gray-900 mb-4">Admin Panel</h1>
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-primary">
        <Link href="/classes/add">+ Add Class</Link>
        <Link href="/professors/add">+ Add Professor</Link>
        <button onClick={async () => {
          const result = await logoutAdmin()
          if (result.error) setError(result.error)
          else router.refresh()
        }}>Sign out</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex gap-2 mb-4">
        {(['reviews', 'classes', 'professors'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 rounded-lg font-semibold capitalize transition-colors ${
              tab === t ? 'bg-primary text-white' : 'bg-white border border-cream-border text-gray-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'reviews' && (
        <div className="flex flex-col gap-2">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-primary font-semibold">{r.class?.title ?? 'Unknown class'}</div>
                <div className="text-sm text-gray-700 mt-0.5 truncate">{r.comment ?? '(no comment)'}</div>
                <div className="text-xs text-gray-400 mt-0.5">⭐ {r.overall_rating} · {r.semester}</div>
              </div>
              <button
                onClick={async () => {
                  setError('')
                  const result = await deleteReview(r.id)
                  if (result.error) { setError(result.error); return }
                  setReviews(prev => prev.filter((x) => x.id !== r.id))
                }}
                className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'classes' && (
        <div className="flex flex-col gap-2">
          {classes.map(c => (
            <div key={c.id} className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-center gap-3">
              <div>
                <div className="text-sm font-semibold">{c.title}</div>
                <div className="text-xs text-gray-400">{c.professor?.name ?? 'No professor'} · {c.semester}</div>
              </div>
              <button
                onClick={async () => {
                  setError('')
                  const result = await deleteClass(c.id)
                  if (result.error) { setError(result.error); return }
                  setClasses(prev => prev.filter((x) => x.id !== c.id))
                }}
                className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'professors' && (
        <div className="flex flex-col gap-2">
          {professors.map(p => (
            <div key={p.id} className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-center gap-3">
              <div className="text-sm font-semibold">{p.name}</div>
              <button
                onClick={async () => {
                  setError('')
                  const result = await deleteProfessor(p.id)
                  if (result.error) { setError(result.error); return }
                  setProfessors(prev => prev.filter((x) => x.id !== p.id))
                }}
                className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
