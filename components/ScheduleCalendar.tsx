'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DAYS } from '@/lib/constants'
import { formatTime } from '@/lib/utils'
import type { Class } from '@/lib/types'
import type { Day } from '@/lib/constants'

const HOUR_START = 8
const HOUR_END = 21
const TOTAL_HOURS = HOUR_END - HOUR_START
const SLOT_HEIGHT = 64

const PALETTE = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-green-600',
]

function categoryColor(category: string | null, sortedCategories: string[]): string {
  if (!category) return 'bg-gray-400'
  const idx = sortedCategories.indexOf(category)
  return idx >= 0 ? PALETTE[idx % PALETTE.length] : 'bg-gray-400'
}

function ClassPopup({ cls, onClose, colorClass }: { cls: Class; onClose: () => void; colorClass: string }) {
  const prof = (cls as unknown as { professor?: { name: string } }).professor
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-xl leading-none"
        >
          ✕
        </button>
        <div className="mb-4">
          {cls.category && (
            <span className={`inline-block text-[10px] font-bold text-white uppercase tracking-widest px-2 py-0.5 rounded-full ${colorClass}`}>
              {cls.category}
            </span>
          )}
          <h2 className="text-base font-bold text-gray-900 mt-2 pr-6">{cls.title}</h2>
        </div>
        <div className="flex flex-col gap-2 text-sm text-gray-600 mb-6">
          {prof?.name && (
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-base">👤</span>
              <span>{prof.name}</span>
            </div>
          )}
          {cls.meeting_days && cls.start_time && (
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-base">🕐</span>
              <span>{cls.meeting_days.join(', ')} · {formatTime(cls.start_time)}–{formatTime(cls.end_time ?? '')}</span>
            </div>
          )}
          {cls.semester && (
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-base">📅</span>
              <span>{cls.semester}</span>
            </div>
          )}
        </div>
        <Link
          href={`/classes/${cls.id}`}
          className="block w-full bg-primary text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          View Reviews →
        </Link>
      </div>
    </div>
  )
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTop(minutes: number): number {
  return ((minutes - HOUR_START * 60) / 60) * SLOT_HEIGHT
}

function minutesToHeight(startMin: number, endMin: number): number {
  return ((endMin - startMin) / 60) * SLOT_HEIGHT
}

interface LayoutItem {
  cls: Class
  col: number
  numCols: number
}

function layoutDayClasses(classes: Class[]): LayoutItem[] {
  const valid = classes.filter(c => c.start_time && c.end_time)
  const sorted = [...valid].sort((a, b) => timeToMinutes(a.start_time!) - timeToMinutes(b.start_time!))

  const colEnds: number[] = []
  const assigned = sorted.map(cls => {
    const s = timeToMinutes(cls.start_time!)
    const e = timeToMinutes(cls.end_time!)
    let col = colEnds.findIndex(end => end <= s)
    if (col === -1) { col = colEnds.length; colEnds.push(e) }
    else colEnds[col] = e
    return { cls, col, startMin: s, endMin: e }
  })

  return assigned.map(item => {
    const numCols = assigned
      .filter(other => other.startMin < item.endMin && other.endMin > item.startMin)
      .reduce((max, other) => Math.max(max, other.col + 1), 1)
    return { cls: item.cls, col: item.col, numCols }
  })
}

function defaultDay(): Day {
  const d = new Date().getDay() // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  return (d >= 1 && d <= 4) ? DAYS[d - 1] : DAYS[0]
}

interface Props {
  classes: Class[]
  categories: string[]
}

export default function ScheduleCalendar({ classes, categories }: Props) {
  const sortedCategories = [...categories].sort()
  const [activeDay, setActiveDay] = useState<Day>(defaultDay())
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [selected, setSelected] = useState<Class | null>(null)

  function toggleCategory(cat: string) {
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const filtered = classes
    .filter(c => c.meeting_days?.includes(activeDay))
    .filter(c => activeCategories.length === 0 || activeCategories.includes(c.category ?? ''))

  const items = layoutDayClasses(filtered)

  const selectedColor = selected ? categoryColor(selected.category, sortedCategories) : ''

  return (
    <>
      {selected && (
        <ClassPopup cls={selected} onClose={() => setSelected(null)} colorClass={selectedColor} />
      )}

      <div className="p-4 flex flex-col gap-3 border-b border-cream-border">
        {/* Day selector */}
        <div className="flex gap-2">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wide transition-colors ${
                activeDay === day
                  ? 'bg-primary text-white border-primary'
                  : 'border-cream-border text-gray-500 bg-white hover:border-primary'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {sortedCategories.length > 0 && (
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => setActiveCategories([])}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                activeCategories.length === 0
                  ? 'bg-primary text-white border-primary'
                  : 'border-cream-border text-gray-500 bg-white hover:border-primary'
              }`}
            >
              All
            </button>
            {sortedCategories.map(cat => {
              const active = activeCategories.includes(cat)
              const color = categoryColor(cat, sortedCategories)
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    active
                      ? `${color} text-white border-transparent`
                      : 'border-cream-border text-gray-500 bg-white hover:border-gray-400'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
            {activeCategories.length > 0 && (
              <button
                onClick={() => setActiveCategories([])}
                className="text-xs text-gray-400 hover:text-gray-600 underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Time grid */}
      <div className="flex">
        {/* Hour labels */}
        <div className="flex flex-col shrink-0" style={{ width: 52 }}>
          {Array.from({ length: TOTAL_HOURS }, (_, i) => (
            <div
              key={i}
              style={{ height: SLOT_HEIGHT }}
              className="text-[10px] text-gray-400 text-right pr-2 pt-0.5"
            >
              {formatTime(`${HOUR_START + i}:00`)}
            </div>
          ))}
        </div>

        {/* Single day column */}
        <div
          className="relative flex-1 border-l border-cream-border"
          style={{ height: TOTAL_HOURS * SLOT_HEIGHT }}
        >
          {Array.from({ length: TOTAL_HOURS }, (_, i) => (
            <div
              key={i}
              style={{ top: i * SLOT_HEIGHT }}
              className="absolute w-full border-t border-cream-border/60"
            />
          ))}

          {items.map(({ cls, col, numCols }) => {
            const startMin = timeToMinutes(cls.start_time!)
            const endMin = timeToMinutes(cls.end_time!)
            const top = minutesToTop(startMin)
            const height = minutesToHeight(startMin, endMin)
            const widthPct = 100 / numCols
            const leftPct = (col / numCols) * 100
            const colorClass = categoryColor(cls.category, sortedCategories)

            return (
              <button
                key={cls.id}
                onClick={() => setSelected(cls)}
                style={{
                  top,
                  height,
                  left: `calc(${leftPct}% + 2px)`,
                  width: `calc(${widthPct}% - 4px)`,
                }}
                className={`absolute ${colorClass} text-white text-[10px] rounded-md px-1.5 py-1 overflow-hidden text-left hover:opacity-90 transition-opacity`}
              >
                <div className="font-semibold leading-tight truncate">{cls.title}</div>
                <div className="opacity-80 text-[9px] mt-0.5">
                  {formatTime(cls.start_time!)}–{formatTime(cls.end_time!)}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
