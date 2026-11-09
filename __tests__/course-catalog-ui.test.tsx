import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import CourseCatalog from '@/components/CourseCatalog'

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
