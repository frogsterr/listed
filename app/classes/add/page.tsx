'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { addClass } from '@/actions/classes'
import { addProfessor } from '@/actions/professors'
import { DAYS, SEMESTERS, CURRENT_SEMESTER } from '@/lib/constants'

export default function AddClassPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; semester: string }[]>([])
  const [searched, setSearched] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [semester, setSemester] = useState(CURRENT_SEMESTER)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [profSearch, setProfSearch] = useState('')
  const [profResults, setProfResults] = useState<{ id: string; name: string }[]>([])
  const [selectedProfId, setSelectedProfId] = useState('')
  const [selectedProfName, setSelectedProfName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSearch() {
    if (!searchQuery.trim()) return
    const { data } = await supabase
      .from('classes')
      .select('id, title, semester')
      .ilike('title', `%${searchQuery}%`)
      .limit(5)
    setSearchResults(data ?? [])
    setSearched(true)
  }

  async function handleProfSearch(q: string) {
    setProfSearch(q)
    setSelectedProfId('')
    setSelectedProfName('')
    if (!q.trim()) { setProfResults([]); return }
    const { data } = await supabase
      .from('professors')
      .select('id, name')
      .ilike('name', `%${q}%`)
      .limit(5)
    setProfResults(data ?? [])
  }

  function toggleDay(day: string) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  async function handleSubmit() {
    setError(null)
    let profId = selectedProfId

    if (profSearch.trim() && !selectedProfId) {
      const { id, error: profError } = await addProfessor(profSearch.trim())
      if (profError) { setError(profError); return }
      profId = id!
    }

    setSubmitting(true)
    const { error: err, id } = await addClass({
      title: title || searchQuery,
      category,
      professor_id: profId,
      meeting_days: selectedDays,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
      semester,
    })
    setSubmitting(false)

    if (err) { setError(err); return }
    router.push(`/classes/${id}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/classes" className="text-primary text-sm">← Back</Link>
        <h1 className="text-lg font-bold text-gray-900">Add a Class</h1>
      </div>

      {!showForm ? (
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-cream-border rounded-xl p-5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
              First, search to make sure it doesn't already exist
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search class name..."
                className="flex-1 border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
              />
              <button
                onClick={handleSearch}
                className="bg-primary text-white text-sm px-4 py-2.5 rounded-lg font-semibold"
              >
                Search
              </button>
            </div>
          </div>

          {searched && (
            <div className="flex flex-col gap-2">
              {searchResults.length > 0 ? (
                <>
                  <p className="text-sm text-gray-500">Found these existing classes:</p>
                  {searchResults.map(r => (
                    <Link key={r.id} href={`/classes/${r.id}`}>
                      <div className="bg-white border border-cream-border rounded-lg px-4 py-3 hover:border-primary transition-colors">
                        <div className="text-sm font-semibold">{r.title}</div>
                        <div className="text-xs text-gray-400">{r.semester}</div>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={() => { setTitle(searchQuery); setShowForm(true) }}
                    className="text-sm text-primary font-semibold text-center py-2"
                  >
                    None of these match — add as new class →
                  </button>
                </>
              ) : (
                <div className="bg-white border border-cream-border rounded-xl p-5 text-center">
                  <p className="text-sm text-gray-500 mb-3">No existing class found for "{searchQuery}"</p>
                  <button
                    onClick={() => { setTitle(searchQuery); setShowForm(true) }}
                    className="bg-primary text-white text-sm px-5 py-2.5 rounded-lg font-semibold"
                  >
                    Add it now →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-cream-border rounded-xl p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Class Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Category</label>
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Talmud & Rabbinics"
              className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Semester</label>
            <select
              value={semester}
              onChange={e => setSemester(e.target.value)}
              className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none"
            >
              {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Professor</label>
            <input
              value={profSearch}
              onChange={e => handleProfSearch(e.target.value)}
              placeholder="Search or type new professor name..."
              className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
            />
            {profResults.length > 0 && !selectedProfId && (
              <div className="mt-1 border border-cream-border rounded-lg overflow-hidden bg-white">
                {profResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProfId(p.id); setSelectedProfName(p.name); setProfSearch(p.name); setProfResults([]) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-cream border-b border-cream-border last:border-0"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
            {selectedProfName && (
              <div className="text-xs text-primary mt-1">✓ {selectedProfName} selected</div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Meeting Days</label>
            <div className="flex gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                    selectedDays.includes(day)
                      ? 'bg-primary text-white border-primary'
                      : 'border-cream-border text-gray-500 bg-cream'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-xs">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary text-white font-bold text-sm py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Adding...' : 'Add Class'}
          </button>
        </div>
      )}
    </div>
  )
}
