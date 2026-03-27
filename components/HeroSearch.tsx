'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/classes?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-6 text-center text-white">
      <h1 className="text-xl font-bold mb-1">Find your next class</h1>
      <p className="text-sm opacity-90 mb-4">Anonymous reviews from JTS students</p>
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="text-gray-300 text-sm">🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search classes or professors..."
            className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400"
          />
        </div>
      </form>
    </div>
  )
}
