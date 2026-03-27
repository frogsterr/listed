'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DAYS } from '@/lib/constants'
import { formatTime } from '@/lib/utils'
import type { Class } from '@/lib/types'

const HOUR_START = 8
const HOUR_END = 21
const TOTAL_HOURS = HOUR_END - HOUR_START
const SLOT_HEIGHT = 64

function ClassPopup({ cls, onClose }: { cls: Class; onClose: () => void }) {
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
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{cls.category}</span>
          )}
          <h2 className="text-base font-bold text-gray-900 mt-1 pr-6">{cls.title}</h2>
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

  // For each class, numCols = max column of any class it overlaps with + 1
  return assigned.map(item => {
    const numCols = assigned
      .filter(other => other.startMin < item.endMin && other.endMin > item.startMin)
      .reduce((max, other) => Math.max(max, other.col + 1), 1)
    return { cls: item.cls, col: item.col, numCols }
  })
}

const COLORS = [
  'bg-primary',
  'bg-orange-400',
  'bg-amber-500',
  'bg-orange-600',
  'bg-yellow-500',
]

export default function ScheduleCalendar({ classes }: { classes: Class[] }) {
  const [selected, setSelected] = useState<Class | null>(null)

  return (
    <>
      {selected && <ClassPopup cls={selected} onClose={() => setSelected(null)} />}
      <div>
      <div>
        {/* Header */}
        <div className="grid border-b border-cream-border" style={{ gridTemplateColumns: `52px repeat(${DAYS.length}, 1fr)` }}>
          <div />
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-500 py-2 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="grid" style={{ gridTemplateColumns: `52px repeat(${DAYS.length}, 1fr)` }}>
          {/* Hour labels */}
          <div className="flex flex-col">
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

          {/* Day columns */}
          {DAYS.map(day => {
            const dayClasses = classes.filter(c => c.meeting_days?.includes(day))
            const items = layoutDayClasses(dayClasses)

            return (
              <div
                key={day}
                className="relative border-l border-cream-border"
                style={{ height: TOTAL_HOURS * SLOT_HEIGHT }}
              >
                {/* Hour grid lines */}
                {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                  <div
                    key={i}
                    style={{ top: i * SLOT_HEIGHT }}
                    className="absolute w-full border-t border-cream-border/60"
                  />
                ))}

                {/* Class blocks */}
                {items.map(({ cls, col, numCols }, idx) => {
                  const startMin = timeToMinutes(cls.start_time!)
                  const endMin = timeToMinutes(cls.end_time!)
                  const top = minutesToTop(startMin)
                  const height = minutesToHeight(startMin, endMin)
                  const widthPct = 100 / numCols
                  const leftPct = (col / numCols) * 100

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
                      className={`absolute ${COLORS[idx % COLORS.length]} text-white text-[10px] rounded-md px-1.5 py-1 overflow-hidden text-left hover:opacity-90 transition-opacity`}
                    >
                      <div className="font-semibold leading-tight truncate">{cls.title}</div>
                      <div className="opacity-80 text-[9px] mt-0.5">
                        {formatTime(cls.start_time!)}–{formatTime(cls.end_time!)}
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
      </div>
    </>
  )
}
