'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CURRENT_SEMESTER, DAYS, SEMESTERS } from '@/lib/constants'
import { formatTime } from '@/lib/utils'
import type { PlannerClass, RatingStats } from '@/lib/course-planner'
import { CATALOG_SUBJECTS, DEFAULT_CATALOG_FILTERS, catalogUrl, filterCatalogClasses, groupCatalogClasses, hasAvailability, readCatalogFilters, type CatalogFilters } from '@/lib/class-catalog'

const field = 'w-full rounded-xl border border-cream-border bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30'
const selectField = `${field} appearance-none py-3 pl-4 pr-12 text-sm font-medium`
const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
const clock = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
const timeLabel = (value: number) => value === 1440 ? '12am' : formatTime(clock(value))

function Chevron() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600"><path d="m5 7.5 5 5 5-5" /></svg>
}

function Rating({ label, stats, prominent = false }: { label: string; stats: RatingStats; prominent?: boolean }) {
  const description = stats.average === null ? `${label}: no reviews` : `${label}: ${stats.average.toFixed(1)} out of 5, ${stats.count} review${stats.count === 1 ? '' : 's'}`
  return <span aria-label={description} title={`${description}. Ratings include past semesters.`} className="inline-flex shrink-0 items-baseline gap-1 whitespace-nowrap tabular-nums">
    <span aria-hidden="true" className={`${prominent ? 'text-xl' : 'text-sm'} font-bold text-gray-900`}>{stats.average === null ? '—' : stats.average.toFixed(1)}</span>
    {stats.average !== null && <><span aria-hidden="true" className="text-sm text-primary">★</span><span aria-hidden="true" className="text-xs text-gray-500">({stats.count})</span></>}
  </span>
}

const rowColumns = 'md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_10.5rem_4.5rem]'

function CourseRow({ course, showSemester, grouped }: { course: PlannerClass; showSemester: boolean; grouped: boolean }) {
  const Heading = grouped ? 'h3' : 'h2'
  const code = `${course.course_codes?.join(' / ') || course.category || 'Course'}${showSemester ? ` · ${course.semester}` : ''}`
  const days = course.meeting_days?.join(' / ')
  const time = course.start_time && course.end_time ? `${formatTime(course.start_time)}–${formatTime(course.end_time)}` : 'Time TBA'
  const tag = <span className="rounded bg-cream px-1.5 py-0.5 text-[11px] font-semibold text-primary">{code}</span>
  return <article className={`grid grid-cols-[minmax(0,1fr)_4rem] items-center gap-x-4 gap-y-1.5 px-4 py-3 md:py-2.5 ${rowColumns}`}>
    <div className="col-start-1 row-start-1 min-w-0">
      <Heading className="inline text-base font-bold leading-snug text-gray-900"><Link href={`/classes/group/${encodeURIComponent(course.title)}`} className="hover:text-primary">{course.title}</Link></Heading>
      <span className="ml-2 hidden align-middle md:inline">{tag}</span>
    </div>
    <div className="col-start-1 row-start-2 min-w-0 space-y-1 md:col-start-2 md:row-start-1">
      {course.professorRatings.length > 0 ? course.professorRatings.map(({ professor, stats }) => <div key={professor.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"><Link href={`/professors/${professor.id}`} className="text-sm font-semibold text-gray-800 hover:text-primary">{professor.name}</Link><Rating label={professor.name} stats={stats} /></div>)
        : <p className="text-sm font-medium text-gray-600">{course.catalog_instructors?.join(' / ') || 'Professor TBA'}</p>}
    </div>
    <div className="col-span-2 col-start-1 row-start-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-gray-600 md:col-span-1 md:col-start-3 md:row-start-1 md:block">
      <span className="md:hidden">{tag}</span>
      {days && <span className="md:block">{days}<span className="ml-2 md:hidden">·</span></span>}
      <span className="md:mt-0.5 md:block">{time}</span>
    </div>
    <div className="col-start-2 row-span-2 row-start-1 self-start text-right md:col-start-4 md:row-span-1 md:self-center"><Rating label="Course" stats={course.courseRating} prominent /><p className="text-[10px] text-gray-500 md:hidden">Course</p></div>
  </article>
}

export default function CourseCatalog({ classes }: { classes: PlannerClass[] }) {
  const filters = readCatalogFilters(useSearchParams())
  const [subjectsOpen, setSubjectsOpen] = useState(false)
  const subjectMenu = useRef<HTMLDivElement>(null)
  const subjectButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!subjectsOpen) return
    function outside(event: PointerEvent) {
      if (!subjectMenu.current?.contains(event.target as Node)) setSubjectsOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [subjectsOpen])

  const results = filterCatalogClasses(classes, filters)
  const groups = filters.sort === 'subject' ? groupCatalogClasses(results, filters.subjects) : [{ subject: '', classes: results }]
  const hiddenTheses = filters.showHonorsTheses ? 0 : filterCatalogClasses(classes, { ...filters, showHonorsTheses: true }).length - results.length
  const availability = hasAvailability(filters)
  const hasFilters = Boolean(filters.query || filters.subjects.length || filters.topic || availability || filters.sort !== 'subject' || filters.showHonorsTheses)
  const semesters = [...new Set([CURRENT_SEMESTER, ...SEMESTERS.slice().reverse(), ...classes.map(c => c.semester), filters.semester])].filter(s => s && s !== 'all')
  const start = filters.earliest ? minutes(filters.earliest) : 0
  const finish = filters.latest ? minutes(filters.latest) : 1440
  const invalidWindow = start > finish
  const timeSummary = !filters.earliest && !filters.latest ? 'Any time' : `${timeLabel(start)} – ${timeLabel(finish)}`

  function update(patch: Partial<CatalogFilters>, replace = false) {
    // Read the current URL so rapid slider/checkbox events cannot overwrite one another.
    const next = { ...readCatalogFilters(new URLSearchParams(window.location.search)), ...patch }
    if (!hasAvailability(next)) next.includeUnscheduled = false
    window.history[replace ? 'replaceState' : 'pushState'](null, '', catalogUrl(next))
  }
  function clearFilters() { update({ ...DEFAULT_CATALOG_FILTERS, semester: filters.semester }) }
  function changeTime(handle: 'start' | 'finish', value: number) {
    const current = readCatalogFilters(new URLSearchParams(window.location.search))
    const lower = current.earliest ? minutes(current.earliest) : 0
    const upper = current.latest ? minutes(current.latest) : 1440
    if (handle === 'start') {
      const next = Math.max(0, Math.min(value, upper - 5))
      update({ earliest: next === 0 ? '' : clock(next) }, true)
    } else {
      const next = Math.min(1440, Math.max(value, lower + 5))
      update({ latest: next === 1440 ? '' : clock(next) }, true)
    }
  }

  return <div className="mx-auto max-w-6xl px-4 py-7 sm:py-9">
    <div className="mb-5 flex items-center justify-between gap-4">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Classes</h1>
      <div className="relative w-40 shrink-0 sm:w-44">
        <select aria-label="Semester" className={selectField} value={filters.semester} onChange={e => update({ semester: e.target.value, topic: '' })}>
          {semesters.map(s => <option key={s}>{s}</option>)}<option value="all">All semesters</option>
        </select><Chevron />
      </div>
    </div>

    <div className="rounded-2xl border border-cream-border bg-white p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="relative">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
          <input aria-label="Search classes" type="search" autoComplete="off" value={filters.query} onChange={e => update({ query: e.target.value }, true)} placeholder="Search courses or professors" className={`${field} py-3 pl-12 pr-4 text-base font-normal`} />
        </div>
        <div ref={subjectMenu} className="relative" onKeyDown={e => { if (e.key === 'Escape') { setSubjectsOpen(false); subjectButton.current?.focus() } }}>
          <button ref={subjectButton} aria-label="Subjects" aria-expanded={subjectsOpen} aria-controls="catalog-subjects" onClick={() => setSubjectsOpen(!subjectsOpen)} className={`${selectField} relative h-full text-left`}>
            <span className="block truncate">{filters.subjects.length === 0 ? 'All subjects' : filters.subjects.length === 1 ? filters.subjects[0] : `${filters.subjects.length} subjects`}</span><Chevron />
          </button>
          {subjectsOpen && <div id="catalog-subjects" role="group" aria-label="Choose subjects" className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-cream-border bg-white p-2 shadow-lg">
            {CATALOG_SUBJECTS.map(subject => <label key={subject} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-800 hover:bg-cream">
              <input type="checkbox" checked={filters.subjects.includes(subject)} onChange={e => update({ subjects: CATALOG_SUBJECTS.filter(s => s === subject ? e.target.checked : filters.subjects.includes(s)), topic: '' })} className="h-4 w-4 shrink-0 accent-primary" />{subject}
            </label>)}
          </div>}
        </div>
      </div>

      {filters.subjects.length > 0 && <div aria-label="Selected subjects" className="mt-3 flex flex-wrap gap-2">
        {filters.subjects.map(subject => <button key={subject} aria-label={`Remove ${subject}`} onClick={() => update({ subjects: filters.subjects.filter(s => s !== subject) })} className="rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-primary">{subject}<span aria-hidden="true" className="ml-2">×</span></button>)}
      </div>}

      <div className="mt-5 grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-10">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-gray-800">Days</legend>
          <div className="flex gap-2">
            {DAYS.map(day => <button type="button" key={day} aria-pressed={filters.days.includes(day)} onClick={() => update({ days: DAYS.filter(d => d === day ? !filters.days.includes(day) : filters.days.includes(d)) })} className={`min-h-[44px] flex-1 rounded-lg border px-2 py-2.5 text-sm font-semibold ${filters.days.includes(day) ? 'border-primary bg-primary text-white' : 'border-cream-border text-gray-700 hover:border-primary'}`}>{day}</button>)}
          </div>
        </fieldset>
        <div role="group" aria-label="Time window">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold text-gray-800">Time</span><output className="font-semibold tabular-nums text-primary">{timeSummary}</output>
          </div>
          <div className="relative mx-3 mt-1 h-10 cursor-pointer" onPointerDown={e => {
            if (e.target !== e.currentTarget) return
            const bounds = e.currentTarget.getBoundingClientRect()
            const value = Math.round(Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width)) * 1440 / 5) * 5
            changeTime(Math.abs(value - start) < Math.abs(value - finish) ? 'start' : 'finish', value)
          }}>
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gray-200" />
            <div className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary" style={{ left: `${start / 14.4}%`, right: `${100 - finish / 14.4}%` }} />
            <input aria-label="Earliest start" aria-valuetext={timeLabel(start)} aria-valuemax={Math.max(0, finish - 5)} type="range" min="0" max="1440" step="5" value={start} onChange={e => changeTime('start', Number(e.target.value))} className="catalog-range" />
            <input aria-label="Latest finish" aria-valuetext={timeLabel(finish)} aria-valuemin={Math.min(1440, start + 5)} type="range" min="0" max="1440" step="5" value={finish} onChange={e => changeTime('finish', Number(e.target.value))} className="catalog-range" />
          </div>
          <div aria-hidden="true" className="mx-3 flex justify-between text-[11px] text-gray-500"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>12am</span></div>
        </div>
      </div>
      {availability && <label className="mt-4 flex w-fit items-center gap-2 text-xs text-gray-600"><input type="checkbox" className="h-4 w-4 accent-primary" checked={filters.includeUnscheduled} onChange={e => update({ includeUnscheduled: e.target.checked })} />Include time TBA</label>}
      {invalidWindow && <p role="alert" className="mt-3 text-sm text-red-700">Start time must be before finish time. <button className="underline" onClick={() => update({ earliest: '', latest: '' })}>Reset time</button></p>}
      {filters.topic && <button onClick={() => update({ topic: '' })} className="mt-3 text-xs text-primary" aria-label={`Remove ${filters.topic}`}>{filters.topic} ×</button>}
    </div>

    <div className="my-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-4"><p role="status" aria-live="polite" className="text-sm font-semibold text-gray-800">{results.length} {results.length === 1 ? 'course' : 'courses'}</p>{hasFilters && <button onClick={clearFilters} className="text-xs text-gray-600 underline underline-offset-2">Clear filters</button>}</div>
      <div className="relative w-40 shrink-0"><select aria-label="Sort classes" className={`${field} appearance-none py-2 pl-4 pr-12 text-sm font-medium`} value={filters.sort} onChange={e => update({ sort: e.target.value as CatalogFilters['sort'] })}><option value="subject">By subject</option><option value="title">Title A–Z</option><option value="rating">Highest rated</option></select><Chevron /></div>
    </div>

    {!results.length ? <div className="rounded-xl border border-cream-border bg-white px-5 py-10 text-center"><h2 className="font-semibold text-gray-900">No matching courses</h2><button onClick={clearFilters} className="mt-3 text-sm text-primary underline">Clear filters</button></div>
      : <div>
        <div aria-hidden="true" className={`mb-2 hidden gap-x-4 px-4 text-[11px] font-semibold text-gray-500 md:grid ${rowColumns}`}><span>Course</span><span>Professor</span><span>Time</span><span className="whitespace-nowrap text-right">Course rating</span></div>
        <div className="space-y-3">{groups.map(group => <section key={group.subject || 'all'} aria-label={group.subject || 'Courses'} className="overflow-hidden rounded-xl border border-cream-border bg-white">
          {group.subject && <h2 className="flex items-center gap-2 border-b border-cream-border bg-cream/60 px-4 py-2 text-sm font-bold text-gray-800">{group.subject}<span className="text-xs font-normal text-gray-500">{group.classes.length}</span></h2>}
          <div className="divide-y divide-cream-border">{group.classes.map(course => <CourseRow key={course.id} course={course} showSemester={filters.semester === 'all'} grouped={Boolean(group.subject)} />)}</div>
        </section>)}</div>
      </div>}
    {(hiddenTheses > 0 || filters.showHonorsTheses) && <button onClick={() => update({ showHonorsTheses: !filters.showHonorsTheses, topic: filters.topic === 'Honors Theses' ? '' : filters.topic })} className="mt-5 text-xs text-gray-500 underline underline-offset-2">{filters.showHonorsTheses ? 'Hide honors theses' : `Show honors theses (${hiddenTheses})`}</button>}
  </div>
}
