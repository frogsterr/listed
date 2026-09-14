'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { layoutDayClasses, timeToMinutes } from '@/lib/calendar'
import { DAYS } from '@/lib/constants'
import { formatTime } from '@/lib/utils'
import type { PlannerClass } from '@/lib/course-planner'
import Rating from '@/components/CourseRating'
import { subjectColor } from '@/lib/subject-colors'
import type { Day } from '@/lib/constants'

const HOUR_START = 8
const HOUR_END = 21
const TOTAL_HOURS = HOUR_END - HOUR_START
const SLOT_HEIGHT = 64

function ClassPopup({ cls, onClose, color }: { cls: PlannerClass; onClose: () => void; color: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current!
    element.showModal()
    return () => element.close()
  }, [])
  return (
    <dialog ref={dialog} aria-labelledby="calendar-course-title" onCancel={onClose}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm max-h-[85vh] rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/30">
      <div className="relative p-6">
        <button aria-label="Close course details" onClick={onClose} className="absolute top-3 right-3 rounded-lg p-2 text-gray-500 hover:bg-gray-100">✕</button>
        {cls.category && <span className="inline-flex items-center gap-2 pr-8 text-xs text-gray-600"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{cls.category}</span>}
        <h2 id="calendar-course-title" className="mt-2 pr-6 text-lg font-bold text-gray-900">{cls.title}</h2>
        <p className="mt-1 text-xs text-gray-500">{cls.course_codes?.join(' / ')}{cls.credits != null ? ` · ${cls.credits} credits` : ''}</p>
        <div className="my-4 flex flex-col gap-2 text-sm text-gray-600">
          {cls.professorRatings.length ? cls.professorRatings.map(({ professor }) => <Link key={professor.id} href={`/professors/${professor.id}`} className="text-primary hover:underline">{professor.name}</Link>) : <p>Professor to be announced</p>}
          <p>{cls.meeting_days.join(', ')} · {formatTime(cls.start_time!)}–{formatTime(cls.end_time!)}</p>
          <p>{cls.semester}</p>
          {Boolean(cls.requirements?.length) && <p>Requirements: {cls.requirements!.join(', ')}</p>}
        </div>
        <div className="mb-5 space-y-2 rounded-lg bg-cream p-3">
          <Rating label="Course" stats={cls.courseRating} />
          {cls.professorRatings.map(({ professor, stats }) => <Rating key={professor.id} label={professor.name} stats={stats} />)}
          <p className="text-[11px] text-gray-500">Ratings include past offerings.</p>
        </div>
        <Link href={`/classes/group/${encodeURIComponent(cls.title)}`} className="block rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white hover:bg-primary/90">View reviews →</Link>
      </div>
    </dialog>
  )
}

function minutesToTop(minutes: number): number {
  return ((minutes - HOUR_START * 60) / 60) * SLOT_HEIGHT
}

function minutesToHeight(startMin: number, endMin: number): number {
  return ((endMin - startMin) / 60) * SLOT_HEIGHT
}

interface Props {
  classes: PlannerClass[]
  categories: string[]
  activeDay: Day
  onDayChange: (day: Day) => void
}

export default function ScheduleCalendar({ classes, categories, activeDay, onDayChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = classes.find(c => c.id === selectedId)
  const items = layoutDayClasses(classes.filter(c => c.meeting_days?.includes(activeDay)))
  const visibleSubjects = [...new Set(items.map(({ cls }) => cls.category))].sort((a, b) => (a ?? '').localeCompare(b ?? ''))

  return (
    <>
      {selected && (
        <ClassPopup cls={selected} onClose={() => setSelectedId(null)} color={subjectColor(selected.category, categories)} />
      )}

      <div className="p-4 flex flex-col gap-3 border-b border-cream-border">
        {/* Day selector */}
        <div className="flex gap-2">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => onDayChange(day)}
              aria-pressed={activeDay === day}
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

        {visibleSubjects.length > 0 && <div aria-label="Calendar color legend" className="space-y-2">
          <p className="text-xs font-medium text-gray-600">Colors by subject</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
            {visibleSubjects.map(subject => <li key={subject ?? 'uncategorized'} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: subjectColor(subject, categories) }} />
              {subject ?? 'Uncategorized'}
            </li>)}
          </ul>
        </div>}
        <p role="status" className="text-xs text-gray-500">{items.length} {items.length === 1 ? 'class' : 'classes'} on {activeDay} · Select a class for details</p>
      </div>

      {items.length === 0 && <p className="p-4 text-sm text-gray-500">No scheduled classes for {activeDay} with these filters.</p>}
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
            const color = subjectColor(cls.category, categories)

            return (
              <button
                key={cls.id}
                onClick={() => setSelectedId(cls.id)}
                aria-label={`${cls.title}, ${cls.category ?? "Uncategorized"}, ${formatTime(cls.start_time!)}–${formatTime(cls.end_time!)}`}
                style={{
                  backgroundColor: color,
                  top,
                  height,
                  left: `calc(${leftPct}% + 2px)`,
                  width: `calc(${widthPct}% - 4px)`,
                }}
                className={`absolute text-white text-xs rounded-md px-1.5 py-1 overflow-hidden text-left hover:opacity-90 transition-opacity`}
              >
                <div className="font-semibold leading-tight line-clamp-3">{cls.title}</div>
                <div className="opacity-80 text-[10px] mt-1">
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
