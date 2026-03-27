'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  suggestions: string[]
  defaultValue?: string
  extraParams?: Record<string, string>
}

export default function ClassSearchInput({ suggestions, defaultValue = '', extraParams = {} }: Props) {
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  const matches = value.trim().length > 0
    ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : []

  function navigate(q: string) {
    const params = new URLSearchParams({ ...extraParams, ...(q ? { q } : {}) })
    router.push(`/classes?${params.toString()}`)
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || matches.length === 0) {
      if (e.key === 'Enter') navigate(value)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlighted >= 0) {
        setValue(matches[highlighted])
        navigate(matches[highlighted])
      } else {
        navigate(value)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative mb-4">
      <input
        type="text"
        value={value}
        onChange={e => { setValue(e.target.value); setOpen(true); setHighlighted(-1) }}
        onFocus={() => { if (matches.length > 0) setOpen(true) }}
        onKeyDown={handleKeyDown}
        placeholder="Search classes or professors..."
        className="w-full border border-cream-border rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:border-primary"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-20 top-full mt-1 w-full bg-white border border-cream-border rounded-lg shadow-lg overflow-hidden">
          {matches.map((s, i) => (
            <li
              key={s}
              onMouseDown={() => { setValue(s); navigate(s) }}
              onMouseEnter={() => setHighlighted(i)}
              className={`px-4 py-2.5 text-sm cursor-pointer ${i === highlighted ? 'bg-cream-hover text-primary font-semibold' : 'text-gray-800 hover:bg-cream-hover'}`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
