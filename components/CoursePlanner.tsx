'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DAYS } from '@/lib/constants'
import { formatTime } from '@/lib/utils'
import { DEFAULT_FILTERS, filterPlannerClasses, type PlannerClass, type PlannerFilters, type RatingStats } from '@/lib/course-planner'
import ScheduleCalendar from '@/components/ScheduleCalendar'

function Rating({ label, stats }: { label: string; stats: RatingStats }) {
  return <div className="text-xs text-gray-500"><span className="font-semibold text-gray-700">{label}: </span>
    {stats.average === null ? 'No reviews yet' : `${stats.average.toFixed(1)} / 5 · ${stats.count} review${stats.count === 1 ? '' : 's'}`}
  </div>
}

export default function CoursePlanner({ classes }: { classes: PlannerClass[] }) {
  const [filters, setFilters] = useState<PlannerFilters>(DEFAULT_FILTERS)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const update = <K extends keyof PlannerFilters>(key: K, value: PlannerFilters[K]) => setFilters(prev => ({ ...prev, [key]: value }))
  const requirements = [...new Set(classes.flatMap(c => c.requirements ?? []))].sort()
  const categories = [...new Set(classes.flatMap(c => c.category ? [c.category] : []))].sort()
  const departments = [...new Set(classes.flatMap(c => (c.course_codes ?? []).map(code => code.split(' ')[0])))].sort()
  const results = filterPlannerClasses(classes, filters)
  const unscheduled = results.filter(c => !c.start_time || !c.end_time || !c.meeting_days?.length).length
  const field = 'mt-1 w-full rounded-lg border border-cream-border bg-white p-2 text-sm text-gray-800'
  return <div className="flex flex-col gap-4">
    <div className="bg-white border border-cream-border rounded-xl p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs text-gray-600">Class or professor
          <input className={field} value={filters.query} onChange={e => update('query', e.target.value)} placeholder="Title, code, or instructor" />
        </label>
        <label className="text-xs text-gray-600">Department / subject
          <select className={field} value={filters.category} onChange={e => update('category', e.target.value)}>
            <option value="">All departments</option>
            {(departments.length ? departments : categories).map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-600">Requirement
          <select className={field} value={filters.requirement} disabled={!requirements.length} onChange={e => update('requirement', e.target.value)}>
            <option value="">{requirements.length ? 'All requirements' : 'Requirements not available yet'}</option>
            {requirements.map(r => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-600">Meeting day
          <select className={field} value={filters.day} onChange={e => update('day', e.target.value)}>
            <option value="">Any day</option>{DAYS.map(d => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-600">Sort by
          <select className={field} value={filters.sort} onChange={e => update('sort', e.target.value as PlannerFilters['sort'])}>
            <option value="title">Class title</option><option value="course">Highest course rating</option><option value="professor">Highest professor rating</option>
          </select>
        </label>
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
      <p className="mt-3 text-xs text-gray-500">Course ratings include past offerings with the same title. Professor ratings include all their courses. For co-taught classes, instructor filters and sorting use the highest-rated instructor. Ties sort by review count, then title.</p>
      {requirements.length > 0 && <p className="mt-1 text-xs text-gray-500">Requirement filters use recorded mappings; offerings without mappings are excluded when a requirement is selected.</p>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p role="status" className="text-sm text-gray-600">{results.length} offering{results.length === 1 ? '' : 's'} found</p>
      <div className="flex gap-2 text-sm">
        <button onClick={() => setFilters(DEFAULT_FILTERS)} className="px-3 py-2 text-primary">Reset filters</button>
        {(['list', 'calendar'] as const).map(v => <button key={v} aria-pressed={view === v} onClick={() => setView(v)} className={`rounded-lg px-3 py-2 capitalize ${view === v ? 'bg-primary text-white' : 'bg-white border border-cream-border'}`}>{v}</button>)}
      </div>
    </div>
    {!results.length ? <p className="rounded-xl border border-cream-border bg-white p-8 text-center text-sm text-gray-500">No offerings match these filters.</p> : view === 'calendar' ? <>
      {unscheduled > 0 && <p className="text-sm text-gray-500">{unscheduled} offering{unscheduled === 1 ? ' has' : 's have'} no complete meeting time; see the list for details.</p>}
      <div className="rounded-xl border border-cream-border bg-white overflow-hidden"><ScheduleCalendar key={filters.day || 'any'} initialDay={filters.day || undefined} classes={results} categories={categories} /></div>
    </> : <div className="grid gap-3 md:grid-cols-2">
      {results.map(c => <article key={c.id} className="bg-white rounded-xl border border-cream-border p-4 flex flex-col gap-2">
        <div className="text-xs text-primary">{c.category ?? 'Uncategorized'} · {c.semester}</div>
        <Link href={`/classes/group/${encodeURIComponent(c.title)}`} className="font-semibold text-gray-900 hover:text-primary">{c.title}</Link>
        <p className="text-xs text-gray-500">{c.course_codes?.join(' / ')}{c.credits != null ? ` · ${c.credits} credits` : ''}</p>
        {c.professorRatings.length ? c.professorRatings.map(({ professor }) => <Link key={professor.id} className="text-sm text-primary" href={`/professors/${professor.id}`}>{professor.name}</Link>) : <p className="text-sm text-gray-500">Professor to be announced</p>}
        <p className="text-xs text-gray-500">{c.start_time && c.end_time && c.meeting_days?.length ? `${c.meeting_days.join('/')} · ${formatTime(c.start_time)}–${formatTime(c.end_time)}` : 'Meeting time to be announced'}</p>
        <Rating label="Course" stats={c.courseRating} />{c.professorRatings.map(({ professor, stats }) => <Rating key={professor.id} label={professor.name} stats={stats} />)}
        <p className="text-xs text-gray-500">Requirements: {c.requirements?.length ? c.requirements.join(', ') : 'Not recorded'}</p>
      </article>)}
    </div>}
  </div>
}
