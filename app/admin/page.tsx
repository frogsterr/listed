'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { deleteReview } from '@/actions/reviews'
import { deleteClass } from '@/actions/classes'
import { deleteProfessor } from '@/actions/professors'

const ADMIN_USERNAME = 'ben'

export default function AdminPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')

  const [reviews, setReviews] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [professors, setProfessors] = useState<any[]>([])
  const [tab, setTab] = useState<'reviews' | 'classes' | 'professors'>('reviews')

  function handleLogin() {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'admin'
    if (username === ADMIN_USERNAME && password === adminPassword) {
      setAuthed(true)
    } else {
      setAuthError('Incorrect credentials.')
    }
  }

  useEffect(() => {
    if (!authed) return
    const supabase = createClient()
    supabase.from('reviews').select('*, class:classes(title)').order('created_at', { ascending: false }).then(({ data }) => setReviews(data ?? []))
    supabase.from('classes').select('*, professor:professors(name)').order('title').then(({ data }) => setClasses(data ?? []))
    supabase.from('professors').select('*').order('name').then(({ data }) => setProfessors(data ?? []))
  }, [authed])

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16">
        <div className="bg-white border border-cream-border rounded-xl p-6 flex flex-col gap-4">
          <h1 className="text-lg font-bold text-gray-900">Admin Login</h1>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            className="border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Password"
            className="border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
          />
          {authError && <div className="text-red-500 text-xs">{authError}</div>}
          <button
            onClick={handleLogin}
            className="bg-primary text-white font-bold text-sm py-3 rounded-lg"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-lg font-bold text-gray-900 mb-4">Admin Panel</h1>

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
                <div className="text-xs text-primary font-semibold">{(r.class as any)?.title ?? 'Unknown class'}</div>
                <div className="text-sm text-gray-700 mt-0.5 truncate">{r.comment ?? '(no comment)'}</div>
                <div className="text-xs text-gray-400 mt-0.5">⭐ {r.overall_rating} · {r.semester}</div>
              </div>
              <button
                onClick={async () => {
                  await deleteReview(r.id)
                  setReviews(prev => prev.filter((x: any) => x.id !== r.id))
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
                <div className="text-xs text-gray-400">{(c.professor as any)?.name ?? 'No professor'} · {c.semester}</div>
              </div>
              <button
                onClick={async () => {
                  await deleteClass(c.id)
                  setClasses(prev => prev.filter((x: any) => x.id !== c.id))
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
                  await deleteProfessor(p.id)
                  setProfessors(prev => prev.filter((x: any) => x.id !== p.id))
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
