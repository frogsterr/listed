'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CURRENT_SEMESTER, DAYS, SEMESTERS } from '@/lib/constants'
import { formatTime } from '@/lib/utils'
import type { PlannerClass } from '@/lib/course-planner'
import { CATALOG_SUBJECTS, DEFAULT_CATALOG_FILTERS, catalogTaxonomy, catalogUrl, filterCatalogClasses, hasAvailability, hasCompleteSchedule, readCatalogFilters, type CatalogFilters } from '@/lib/class-catalog'
import Rating from '@/components/CourseRating'

export default function CourseCatalog({ classes }: { classes: PlannerClass[] }) {
  const params = useSearchParams()
  const filters = readCatalogFilters(params)
  const [showFilters, setShowFilters] = useState(false)
  const availability = hasAvailability(filters)
  const invalidWindow = Boolean(filters.earliest && filters.latest && filters.earliest > filters.latest)
  const results = filterCatalogClasses(classes, filters)
  const semesters = [...new Set([CURRENT_SEMESTER, ...SEMESTERS.slice().reverse(), ...classes.map(c => c.semester), filters.semester])].filter(s => s && s !== 'all')
  const topics = [...new Set(classes.filter(c => (filters.semester === 'all' || c.semester === filters.semester) &&
    (!filters.subject || catalogTaxonomy(c).subjects.some(s => s === filters.subject)))
    .flatMap(c => catalogTaxonomy(c).topics).concat(filters.topic ? [filters.topic] : []))].sort()
  const hasFilters = Boolean(filters.query || filters.subject || filters.topic || availability)
  const extraCount = [filters.days.length, filters.earliest, filters.latest].filter(Boolean).length
  const field = 'w-full rounded-lg border border-cream-border bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'

  function update(patch: Partial<CatalogFilters>, replace = false) {
    const next = { ...filters, ...patch }
    if (!hasAvailability(next)) next.includeUnscheduled = false
    // Native history keeps live filtering local while preserving reload/back/share behavior.
    window.history[replace ? 'replaceState' : 'pushState'](null, '', catalogUrl(next))
  }
  function clearFilters() {
    update({ ...DEFAULT_CATALOG_FILTERS, semester: filters.semester })
  }
  const chips: { label: string; clear: Partial<CatalogFilters> }[] = [
    ...(filters.query ? [{ label: `Search: ${filters.query}`, clear: { query: '' } }] : []),
    ...(filters.subject ? [{ label: filters.subject, clear: { subject: '', topic: '' } }] : []),
    ...(filters.topic ? [{ label: filters.topic, clear: { topic: '' } }] : []),
    ...(filters.days.length ? [{ label: `Days: ${filters.days.join(', ')}`, clear: { days: [] } }] : []),
    ...(filters.earliest ? [{ label: `From ${formatTime(filters.earliest)}`, clear: { earliest: '' } }] : []),
    ...(filters.latest ? [{ label: `Until ${formatTime(filters.latest)}`, clear: { latest: '' } }] : []),
    ...(availability && filters.includeUnscheduled ? [{ label: 'Includes unposted times', clear: { includeUnscheduled: false } }] : []),
  ]

  return <div className="mx-auto max-w-6xl px-4 py-7 sm:py-9">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Classes</h1>
        <p className="mt-1.5 text-sm text-gray-600">Find your next class. See what students thought.</p>
      </div>
      <label className="w-full text-xs font-semibold text-gray-600 sm:w-48">Semester
        <select className={`${field} mt-1`} value={filters.semester} onChange={e => update({ semester: e.target.value, topic: '' })}>
          {semesters.map(s => <option key={s}>{s}</option>)}
          <option value="all">All semesters</option>
        </select>
      </label>
    </div>

    <div className="rounded-xl border border-cream-border bg-white p-4 sm:p-5">
      <label htmlFor="catalog-search" className="sr-only">Search classes</label>
      <div className="relative">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-gray-400"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
        <input id="catalog-search" type="search" autoComplete="off" value={filters.query}
          onChange={e => update({ query: e.target.value }, true)}
          placeholder="Search by course title, code, or professor"
          className={`${field} py-3 pl-11 text-base`} />
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 basis-48 text-xs font-semibold text-gray-600 sm:max-w-64">Subject
          <select className={`${field} mt-1`} value={filters.subject} onChange={e => update({ subject: e.target.value, topic: '' })}>
            <option value="">All subjects</option>
            {CATALOG_SUBJECTS.map(s => <option key={s}>{s}</option>)}
            {filters.subject && !CATALOG_SUBJECTS.some(s => s === filters.subject) && <option>{filters.subject}</option>}
          </select>
        </label>
        {topics.length > 0 && <label className="min-w-0 flex-1 basis-48 text-xs font-semibold text-gray-600 sm:max-w-64">Topic <span className="font-normal text-gray-400">(optional)</span>
          <select className={`${field} mt-1`} value={filters.topic} onChange={e => update({ topic: e.target.value })}>
            <option value="">All topics</option>{topics.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>}
        <button aria-expanded={showFilters} aria-controls="catalog-availability" onClick={() => setShowFilters(!showFilters)}
          className={`rounded-lg border px-3 py-2.5 text-sm ${showFilters || availability ? 'border-primary bg-cream-hover text-primary' : 'border-cream-border text-gray-700 hover:border-primary'}`}>
          More filters{extraCount > 0 ? ` (${extraCount})` : ''}
        </button>
        <Link href={`/schedule?semester=${encodeURIComponent(filters.semester === 'all' ? CURRENT_SEMESTER : filters.semester)}`} className="py-2.5 text-sm text-primary hover:underline sm:ml-auto">View calendar →</Link>
      </div>

      {showFilters && <div id="catalog-availability" className="mt-5 border-t border-cream-border pt-4">
        <div className="grid gap-5 md:grid-cols-2">
          <fieldset>
            <legend className="text-sm font-semibold text-gray-800">Days I’m available</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {DAYS.map(day => <button key={day} aria-pressed={filters.days.includes(day)} onClick={() => update({ days: DAYS.filter(d => d === day ? !filters.days.includes(day) : filters.days.includes(d)) })}
                className={`min-h-10 rounded-lg border px-3 text-sm ${filters.days.includes(day) ? 'border-primary bg-primary text-white' : 'border-cream-border hover:border-primary'}`}>{day}</button>)}
              {filters.days.length > 0 && <button onClick={() => update({ days: [] })} className="px-2 text-xs text-primary">Any day</button>}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">No selection means any day. Every meeting must fit your selected days.</p>
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <label className="min-w-0 text-xs font-semibold text-gray-600">Earliest start
              <input type="time" className={`${field} mt-2 min-w-0`} value={filters.earliest} aria-invalid={invalidWindow} aria-describedby={invalidWindow ? 'catalog-time-error' : undefined} onChange={e => update({ earliest: e.target.value })} />
            </label>
            <label className="min-w-0 text-xs font-semibold text-gray-600">Latest finish
              <input type="time" className={`${field} mt-2 min-w-0`} value={filters.latest} aria-invalid={invalidWindow} aria-describedby={invalidWindow ? 'catalog-time-error' : undefined} onChange={e => update({ latest: e.target.value })} />
            </label>
            <p className="col-span-2 text-xs text-gray-500">The entire class must fit within this time window.</p>
          </div>
        </div>
        {availability ? <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" className="h-4 w-4 accent-primary" checked={filters.includeUnscheduled} onChange={e => update({ includeUnscheduled: e.target.checked })} />
          Include courses without posted times
        </label> : <p className="mt-3 text-xs text-gray-500">Courses without posted times are included until you set your availability.</p>}
      </div>}
    </div>

    {chips.length > 0 && <div aria-label="Active filters" className="mt-3 flex flex-wrap items-center gap-2">
      {chips.map(chip => <button key={chip.label} aria-label={`Remove ${chip.label}`} onClick={() => update(chip.clear)} className="max-w-full break-words rounded-full border border-primary/20 bg-cream-hover px-3 py-1.5 text-left text-xs text-primary">{chip.label} <span aria-hidden="true">×</span></button>)}
      <button onClick={clearFilters} className="px-2 py-1.5 text-xs text-gray-600 underline underline-offset-2">Clear filters</button>
    </div>}
    {invalidWindow && <p id="catalog-time-error" role="alert" className="mt-3 text-sm text-red-700">Earliest start must be before or equal to latest finish.</p>}
    <div className="mb-4 mt-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p role="status" aria-live="polite" className="text-sm font-semibold text-gray-800">{filters.semester === 'all' ? 'All semesters' : filters.semester} · {results.length} {results.length === 1 ? 'offering' : 'offerings'}</p>
        <p className="mt-1 text-xs text-gray-500">Ratings and reviews include previous semesters.</p>
      </div>
      <select aria-label="Sort classes" className="rounded-lg border border-cream-border bg-white px-3 py-2 text-sm text-gray-700" value={filters.sort} onChange={e => update({ sort: e.target.value as CatalogFilters['sort'] })}>
        <option value="title">Course title A–Z</option><option value="rating">Highest course rating</option>
      </select>
    </div>

    {!results.length ? <div className="rounded-xl border border-cream-border bg-white px-5 py-12 text-center">
      <h2 className="font-semibold text-gray-900">No classes match these filters</h2>
      <p className="mt-2 text-sm text-gray-500">Try a different search or give yourself a wider time window.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {hasFilters && <button onClick={clearFilters} className="text-sm text-primary hover:underline">Clear filters</button>}
        {filters.semester !== 'all' && <button onClick={() => update({ semester: 'all' })} className="text-sm text-primary hover:underline">Search all semesters</button>}
      </div>
    </div> : <div className="grid gap-4 md:grid-cols-2">
      {results.map(course => {
        const taxonomy = catalogTaxonomy(course)
        const subjects = taxonomy.subjects.join(' / ') || taxonomy.topics.filter(t => t !== 'Honors Theses').join(' / ') || 'General studies'
        const href = `/classes/group/${encodeURIComponent(course.title)}`
        return <article key={course.id} className="flex min-w-0 flex-col rounded-xl border border-cream-border bg-white p-5 transition-colors hover:border-primary/40">
          <p className="text-xs leading-relaxed text-gray-500">{subjects} <span aria-hidden="true">·</span> {course.semester}</p>
          <h2 className="mt-2 text-base font-semibold leading-snug text-gray-900"><Link href={href} className="hover:text-primary hover:underline">{course.title}</Link></h2>
          <p className="mt-1.5 text-xs text-gray-500">{[course.course_codes?.join(' / '), course.credits != null ? `${course.credits} credits` : ''].filter(Boolean).join(' · ')}</p>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {course.professorRatings.length ? course.professorRatings.map(({ professor }) => <Link key={professor.id} href={`/professors/${professor.id}`} className="text-primary hover:underline">{professor.name}</Link>)
              : <span className="text-gray-500">{course.catalog_instructors?.join(' / ') || 'Professor to be announced'}</span>}
          </div>
          <p className="mb-4 mt-2 text-sm text-gray-700">{hasCompleteSchedule(course) ? `${course.meeting_days.join(' / ')} · ${formatTime(course.start_time!)}–${formatTime(course.end_time!)}` : 'Meeting times to be announced'}</p>
          <div className="mt-auto flex flex-col gap-1.5 border-t border-cream-border pt-3">
            <Rating label="Course" stats={course.courseRating} />
            {course.professorRatings.filter(p => p.stats.count > 0).map(({ professor, stats }) => <Rating key={professor.id} label={professor.name} stats={stats} />)}
            <Link href={href} className="mt-1 self-start text-xs font-medium text-primary hover:underline">Course details & reviews →</Link>
          </div>
        </article>
      })}
    </div>}
  </div>
}
