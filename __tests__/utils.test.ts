import { describe, it, expect } from 'vitest'
import { formatTime, workloadToLabel, starsArray } from '@/lib/utils'

describe('formatTime', () => {
  it('formats 24h time to 12h', () => {
    expect(formatTime('10:00')).toBe('10:00am')
    expect(formatTime('14:30')).toBe('2:30pm')
    expect(formatTime('12:00')).toBe('12:00pm')
    expect(formatTime('00:00')).toBe('12:00am')
  })
})

describe('workloadToLabel', () => {
  it('maps 1-5 to labels', () => {
    expect(workloadToLabel(1)).toBe('Very Light')
    expect(workloadToLabel(2)).toBe('Light')
    expect(workloadToLabel(3)).toBe('Medium')
    expect(workloadToLabel(4)).toBe('Heavy')
    expect(workloadToLabel(5)).toBe('Very Heavy')
  })
})

describe('starsArray', () => {
  it('returns array of full/empty star indicators', () => {
    expect(starsArray(3)).toEqual(['full','full','full','empty','empty'])
    expect(starsArray(5)).toEqual(['full','full','full','full','full'])
    expect(starsArray(1)).toEqual(['full','empty','empty','empty','empty'])
  })
})
