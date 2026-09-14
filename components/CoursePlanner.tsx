'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Day } from '@/lib/constants'
import { courseSubjects } from '@/lib/course-subjects'
import { subjectColor } from '@/lib/subject-colors'
import Rating from '@/components/CourseRating'
import { formatTime } from '@/lib/utils'
import { DEFAULT_FILTERS, filterPlannerClasses, type PlannerClass, type PlannerFilters } from '@/lib/course-planner'
import ScheduleCalendar from '@/components/ScheduleCalendar'

export default function CoursePlanner({ classes }: { classes: PlannerClass[] }) {
  const [filters, setFilters] = useState<PlannerFilters>(DEFAULT_FILTERS)
  const [view, setView] = useState<'list' | 'calendar'>('calendar')
  const [showFilters, setShowFilters] = useState(false)
  const [activeDay, setActiveDay] = useState<Day>('Mon')
  const update = <K extends keyof PlannerFilters>(key: K, value: PlannerFilters[K]) => setFilters(prev => ({ ...prev, [key]: value }))
  const requirements = [...new Set(classes.flatMap(c => c.requirements ?? []))].sort()
  const categories = [...new Set(classes.flatMap(courseSubjects))].sort()
  const extraFilterCount = [filters.query.trim(), filters.requirement, filters.earliest, filters.latest, filters.minCourseRating, filters.minProfessorRating, filters.minReviews].filter(Boolean).length
  const hasFilters = Boolean(filters.category || extraFilterCount)
  const results = filterPlannerClasses(classes, filters)
  const unscheduled = results.filter(c => !c.start_time || !c.end_time || !c.meeting_days?.length).length
  const field = 'mt-1 w-full rounded-lg border border-cream-border bg-white p-2 text-sm text-gray-800'
  return <div className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 sm:flex-none sm:w-64">
        <span aria-hidden="true" className="absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full" style={{ backgroundColor: subjectColor(filters.category || null, categories) }} />
        <select aria-label="Subject" className="w-full rounded-lg border border-cream-border bg-white py-2.5 pl-8 pr-8 text-sm text-gray-800" value={filters.category} onChange={e => update('category', e.target.value)}>
          <option value="">All subjects</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <button aria-expanded={showFilters} aria-controls="planner-filters" onClick={() => setShowFilters(!showFilters)} className={`rounded-lg border px-3 py-2.5 text-sm ${showFilters || extraFilterCount ? 'border-primary text-primary bg-cream-hover' : 'border-cream-border bg-white text-gray-600'}`}>
        More filters{extraFilterCount > 0 ? ` (${extraFilterCount})` : ''}
      </button>
      {hasFilters && <button onClick={() => setFilters(DEFAULT_FILTERS)} className="px-2 py-2 text-sm text-primary">Clear filters</button>}
      <button onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')} className="ml-auto px-2 py-2 text-sm text-gray-500 hover:text-primary">
        {view === 'calendar' ? 'List view' : 'Back to calendar'}
      </button>
    </div>
    {showFilters && <div id="planner-filters" className="bg-white border border-cream-border rounded-xl p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs text-gray-600">Class or professor
          <input className={field} value={filters.query} onChange={e => update('query', e.target.value)} placeholder="Title, code, or instructor" />
        </label>
        {requirements.length > 0 && <label className="text-xs text-gray-600">Requirement
          <select className={field} value={filters.requirement} onChange={e => update('requirement', e.target.value)}>
            <option value="">All requirements</option>{requirements.map(r => <option key={r}>{r}</option>)}
          </select>
        </label>}
        <label className="text-xs text-gray-600">Minimum course rating
          <select className={field} value={filters.minCourseRating} onChange={e => update('minCourseRating', Number(e.target.value))}>
            <option value={0}>Any, including unrated</option>{[3, 3.5, 4, 4.5].map(n => <option key={n} value={n}>{n}+ / 5</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-600">Minimum professor rating
          <select className={field} value={filters.minProfessorRating} onChange={e => update('minProfessorRating', Number(e.target.value))}>
            <option value={0}>Any, including unrated</option>{[3, 3.5, 4, 4.5].map(n => <option key={n} value={n}>{n}+ / 5</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-600">Minimum course reviews
          <select className={field} value={filters.minReviews} onChange={e => update('minReviews', Number(e.target.value))}>
            <option value={0}>Any number</option>{[3, 5, 10].map(n => <option key={n} value={n}>{n}+ reviews</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">Starts after<input type="time" className={field} value={filters.earliest} onChange={e => update('earliest', e.target.value)} /></label>
          <label className="text-xs text-gray-600">Ends before<input type="time" className={field} value={filters.latest} onChange={e => update('latest', e.target.value)} /></label>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">Ratings include past offerings. Instructor filters use the highest-rated instructor for co-taught classes.</p>
    </div>}
    {view === 'list' && <div className="flex flex-wrap items-center justify-between gap-2">
      <p role="status" className="text-sm text-gray-500">{results.length} offerings</p>
      <select aria-label="Sort classes" className="rounded-lg border border-cream-border bg-white p-2 text-sm" value={filters.sort} onChange={e => update('sort', e.target.value as PlannerFilters['sort'])}>
        <option value="title">Class title</option><option value="course">Highest course rating</option><option value="professor">Highest professor rating</option>
      </select>
    </div>}
    {!results.length ? <p className="rounded-xl border border-cream-border bg-white p-8 text-center text-sm text-gray-500">No offerings match these filters.</p> : view === 'calendar' ? <>
      <div className="rounded-xl border border-cream-border bg-white overflow-hidden"><ScheduleCalendar activeDay={activeDay} onDayChange={setActiveDay} classes={results} categories={categories} /></div>
      {unscheduled > 0 && <button onClick={() => setView('list')} className="self-start text-xs text-gray-500 hover:text-primary">{unscheduled} {unscheduled === 1 ? 'offering' : 'offerings'} without meeting times · View in list →</button>}
    </> : <div className="grid gap-3 md:grid-cols-2">
      {results.map(c => <article key={c.id} className="bg-white rounded-xl border border-cream-border p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-600"><span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: subjectColor(c.category, categories) }} />{courseSubjects(c).join(' / ') || 'Uncategorized'} · {c.semester}</div>
        <Link href={`/classes/group/${encodeURIComponent(c.title)}`} className="font-semibold text-gray-900 hover:text-primary">{c.title}</Link>
        <p className="text-xs text-gray-500">{c.course_codes?.join(' / ')}{c.credits != null ? ` · ${c.credits} credit${c.credits === 1 ? '' : 's'}` : ''}</p>
        {c.professorRatings.length ? c.professorRatings.map(({ professor }) => <Link key={professor.id} className="text-sm text-primary" href={`/professors/${professor.id}`}>{professor.name}</Link>) : <p className="text-sm text-gray-500">Professor to be announced</p>}
        <p className="text-xs text-gray-500">{c.start_time && c.end_time && c.meeting_days?.length ? `${c.meeting_days.join('/')} · ${formatTime(c.start_time)}–${formatTime(c.end_time)}` : 'Meeting time to be announced'}</p>
        <Rating label="Course" stats={c.courseRating} />{c.professorRatings.map(({ professor, stats }) => <Rating key={professor.id} label={professor.name} stats={stats} />)}
        {Boolean(c.requirements?.length) && <p className="text-xs text-gray-500">Requirements: {c.requirements!.join(', ')}</p>}
      </article>)}
    </div>}
  </div>
}
