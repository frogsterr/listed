'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { addProfessor } from '@/actions/professors'

export default function AddProfessorPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; name: string }[]>([])
  const [searched, setSearched] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch() {
    if (!searchQuery.trim()) return
    const supabase = createClient()
    const { data } = await supabase
      .from('professors')
      .select('id, name')
      .ilike('name', `%${searchQuery}%`)
      .limit(5)
    setSearchResults(data ?? [])
    setSearched(true)
  }

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    const { error: err, id } = await addProfessor(name || searchQuery)
    setSubmitting(false)
    if (err) { setError(err); return }
    router.push(`/professors/${id}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/professors" className="text-primary text-sm">← Back</Link>
        <h1 className="text-lg font-bold text-gray-900">Add a Professor</h1>
      </div>

      {!showForm ? (
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-cream-border rounded-xl p-5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
              Search first to avoid duplicates
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Professor name..."
                className="flex-1 border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
              />
              <button onClick={handleSearch} className="bg-primary text-white text-sm px-4 py-2.5 rounded-lg font-semibold">
                Search
              </button>
            </div>
          </div>

          {searched && (
            <div className="flex flex-col gap-2">
              {searchResults.length > 0 ? (
                <>
                  <p className="text-sm text-gray-500">Found these existing professors:</p>
                  {searchResults.map(p => (
                    <Link key={p.id} href={`/professors/${p.id}`}>
                      <div className="bg-white border border-cream-border rounded-lg px-4 py-3 hover:border-primary transition-colors text-sm font-semibold">
                        {p.name}
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={() => { setName(searchQuery); setShowForm(true) }}
                    className="text-sm text-primary font-semibold text-center py-2"
                  >
                    None of these match — add as new →
                  </button>
                </>
              ) : (
                <div className="bg-white border border-cream-border rounded-xl p-5 text-center">
                  <p className="text-sm text-gray-500 mb-3">No professor found for "{searchQuery}"</p>
                  <button
                    onClick={() => { setName(searchQuery); setShowForm(true) }}
                    className="bg-primary text-white text-sm px-5 py-2.5 rounded-lg font-semibold"
                  >
                    Add them now →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-cream-border rounded-xl p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Professor Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
            />
          </div>
          {error && <div className="text-red-500 text-xs">{error}</div>}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary text-white font-bold text-sm py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Adding...' : 'Add Professor'}
          </button>
        </div>
      )}
    </div>
  )
}
