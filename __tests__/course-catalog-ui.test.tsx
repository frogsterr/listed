import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import CourseCatalog from '@/components/CourseCatalog'
import { buildPlannerClasses } from '@/lib/course-planner'
import type { Class } from '@/lib/types'

vi.mock('next/navigation', async () => {
  const { useSyncExternalStore } = await import('react')
  return {
    useSearchParams: () => new URLSearchParams(useSyncExternalStore(
      listener => { window.addEventListener('popstate', listener); return () => window.removeEventListener('popstate', listener) },
      () => window.location.search,
    )),
  }
})

beforeEach(() => {
  window.history.replaceState(null, '', '/classes')
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = window.history[method].bind(window.history)
    vi.spyOn(window.history, method).mockImplementation((...args) => {
      original(...args)
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
  }
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('catalog controls', () => {
  it('retains multiple subjects and lets users remove one independently', () => {
    render(<CourseCatalog classes={[]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Subjects' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Bible' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Hebrew' }))
    expect(screen.getByRole('checkbox', { name: 'Bible' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Hebrew' })).toBeChecked()
    expect(new URLSearchParams(window.location.search).get('subjects')).toBe('Bible,Hebrew')
    fireEvent.click(screen.getByRole('button', { name: 'Remove Bible' }))
    expect(new URLSearchParams(window.location.search).get('subjects')).toBe('Hebrew')
    fireEvent.keyDown(screen.getByRole('group', { name: 'Choose subjects' }), { key: 'Escape' })
    expect(screen.queryByRole('group', { name: 'Choose subjects' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Subjects' })).toHaveFocus()
  })

  it('keeps both time handles ordered, preserves subjects, and resets to any time', () => {
    window.history.replaceState(null, '', '/classes?subjects=Bible')
    render(<CourseCatalog classes={[]} />)
    const start = screen.getByRole('slider', { name: 'Earliest start' })
    const finish = screen.getByRole('slider', { name: 'Latest finish' })
    fireEvent.change(start, { target: { value: '540' } })
    fireEvent.change(finish, { target: { value: '1020' } })
    expect(new URLSearchParams(window.location.search).get('earliest')).toBe('09:00')
    expect(new URLSearchParams(window.location.search).get('latest')).toBe('17:00')
    expect(new URLSearchParams(window.location.search).get('subjects')).toBe('Bible')
    fireEvent.change(start, { target: { value: '1080' } })
    expect(start).toHaveValue('1015')
    fireEvent.change(finish, { target: { value: '600' } })
    expect(finish).toHaveValue('1020')
    fireEvent.change(start, { target: { value: '0' } })
    fireEvent.change(finish, { target: { value: '1440' } })
    expect(screen.getByText('Any time')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Include time TBA' })).not.toBeInTheDocument()
    expect(window.location.search).toBe('?subjects=Bible')
  })
})


it('opens in subject groups with theses hidden and allows explicit expansion and flat sorting', () => {
  const course = (id: string, title: string, category: string): Class => ({
    id, title, category, semester: 'Spring 2027', professor_id: null, created_at: '',
    meeting_days: ['Mon'], start_time: '10:00:00', end_time: '11:00:00',
  })
  render(<CourseCatalog classes={buildPlannerClasses([
    course('bible', 'Bible Course', 'Bible'), course('hebrew', 'Hebrew Course', 'Hebrew'),
    course('thesis', 'Honors Thesis (BIB)', 'Bible'),
  ], [])} />)
  expect(screen.getByRole('combobox', { name: 'Sort classes' })).toHaveValue('subject')
  expect(screen.getByRole('region', { name: 'Bible' })).toBeInTheDocument()
  expect(screen.getAllByRole('article')).toHaveLength(2)
  expect(screen.queryByRole('link', { name: 'Honors Thesis (BIB)' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Show honors theses (1)' }))
  expect(screen.getByRole('link', { name: 'Honors Thesis (BIB)' })).toBeInTheDocument()
  expect(new URLSearchParams(window.location.search).get('theses')).toBe('1')
  fireEvent.click(screen.getByRole('button', { name: 'Hide honors theses' }))
  expect(screen.getAllByRole('article')).toHaveLength(2)
  fireEvent.change(screen.getByRole('combobox', { name: 'Sort classes' }), { target: { value: 'title' } })
  expect(screen.queryByRole('region', { name: 'Bible' })).not.toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Courses' })).toBeInTheDocument()
  expect(screen.getAllByRole('article')).toHaveLength(2)
})
