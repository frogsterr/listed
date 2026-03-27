'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface Suggestion {
  label: string
  href: string
}

interface Props {
  suggestions: Suggestion[]
}

function SearchInput({
  suggestions,
  inputClassName,
  wrapperClassName,
  dropdownClassName,
  placeholder,
  prefix,
}: {
  suggestions: Suggestion[]
  inputClassName: string
  wrapperClassName?: string
  dropdownClassName: string
  placeholder: string
  prefix?: React.ReactNode
}) {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  const matches = value.trim().length > 0
    ? suggestions.filter(s => s.label.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : []

  function navigate(suggestion: Suggestion | null) {
    const href = suggestion
      ? suggestion.href
      : value.trim() ? `/classes?q=${encodeURIComponent(value.trim())}` : '/classes'
    router.push(href)
    setOpen(false)
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, matches.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, -1)) }
    else if (e.key === 'Enter') { e.preventDefault(); navigate(highlighted >= 0 ? matches[highlighted] : null) }
    else if (e.key === 'Escape') setOpen(false)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${wrapperClassName ?? ''}`}>
      {prefix ? (
        <div className="bg-white rounded-lg px-4 py-3 flex items-center gap-2">
          {prefix}
          <input
            value={value}
            onChange={e => { setValue(e.target.value); setOpen(true); setHighlighted(-1) }}
            onFocus={() => { if (matches.length > 0) setOpen(true) }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={inputClassName}
          />
        </div>
      ) : (
        <input
          value={value}
          onChange={e => { setValue(e.target.value); setOpen(true); setHighlighted(-1) }}
          onFocus={() => { if (matches.length > 0) setOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClassName}
        />
      )}
      {open && matches.length > 0 && (
        <ul className={dropdownClassName}>
          {matches.map((s, i) => (
            <li
              key={s.href}
              onMouseDown={() => { navigate(s) }}
              onMouseEnter={() => setHighlighted(i)}
              className={`px-5 py-3 text-sm cursor-pointer ${
                i === highlighted ? 'bg-cream-hover text-primary font-semibold' : 'text-gray-700 hover:bg-cream-hover'
              }`}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function HeroSearch({ suggestions }: Props) {
  return (
    <>
      {/* ── Desktop: centered hero search ── */}
      <div className="hidden md:flex flex-col items-center justify-center min-h-[45vh] px-8">
        <div className="text-center mb-10">
          <h1 className="text-7xl font-black text-primary tracking-tight leading-none">LISTED</h1>
          <p className="text-gray-400 text-sm mt-3 tracking-[0.2em] uppercase font-medium">JTS Course Reviews</p>
        </div>
        <SearchInput
          suggestions={suggestions}
          placeholder="Search class or professor..."
          inputClassName="w-full border-2 border-cream-border rounded-2xl px-7 py-5 text-lg text-gray-700 outline-none focus:border-primary placeholder-gray-300 bg-white shadow-sm transition-colors"
          wrapperClassName="w-full max-w-2xl"
          dropdownClassName="absolute z-20 top-full mt-2 w-full bg-white border border-cream-border rounded-xl shadow-xl overflow-hidden"
        />
        <p className="text-gray-300 text-xs mt-4">Enter to search · ↑↓ to navigate</p>
      </div>

      {/* ── Mobile: orange card ── */}
      <div className="md:hidden px-4 pt-6">
        <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-6 text-center text-white">
          <h1 className="text-xl font-bold mb-1">Find your next class</h1>
          <p className="text-sm opacity-90 mb-4">Anonymous reviews from JTS students</p>
          <SearchInput
            suggestions={suggestions}
            placeholder="Search classes or professors..."
            wrapperClassName=""
            inputClassName="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400"
            dropdownClassName="absolute z-20 top-full mt-1 w-full bg-white border border-cream-border rounded-lg shadow-xl overflow-hidden text-left"
            prefix={<span className="text-gray-300 text-sm">🔍</span>}
          />
        </div>
      </div>
    </>
  )
}
