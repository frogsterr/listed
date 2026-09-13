import { expect, it } from 'vitest'
import { layoutDayClasses } from '@/lib/calendar'
import type { Class } from '@/lib/types'
const cls = (id: string, start_time: string | null, end_time: string | null): Class => ({
  id, title: id, start_time, end_time, professor_id: null, meeting_days: ['Mon'],
  category: null, semester: 'Fall 2026', created_at: '',
})
it('keeps chained overlapping classes in separate columns with consistent widths', () => {
  const rows = layoutDayClasses([
    cls('a', '09:00', '10:00'), cls('b', '09:30', '11:00'),
    cls('c', '10:00', '10:30'), cls('d', '11:00', '12:00'),
  ])
  expect(rows.map(({ cls, col, numCols }) => [cls.id, col, numCols])).toEqual([
    ['a', 0, 2], ['b', 1, 2], ['c', 0, 2], ['d', 0, 1],
  ])
})
it('omits unscheduled and invalid-length entries from the calendar', () => {
  expect(layoutDayClasses([cls('a', null, null), cls('b', '10:00', '09:00'), cls('c', '10:00', '10:00')])).toEqual([])
})
