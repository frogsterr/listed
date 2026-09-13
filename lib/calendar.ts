import type { Class } from '@/lib/types'
export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}
export function layoutDayClasses(classes: Class[]): { cls: Class; col: number; numCols: number }[] {
  const sorted = classes.filter(c => c.start_time && c.end_time && timeToMinutes(c.end_time) > timeToMinutes(c.start_time))
    .sort((a, b) => timeToMinutes(a.start_time!) - timeToMinutes(b.start_time!) || a.id.localeCompare(b.id))
  const output: { cls: Class; col: number; numCols: number }[] = []
  let group: { cls: Class; col: number }[] = []
  let ends: number[] = []
  let groupEnd = -1
  const flush = () => {
    output.push(...group.map(item => ({ ...item, numCols: ends.length })))
    group = []; ends = []; groupEnd = -1
  }
  for (const cls of sorted) {
    const start = timeToMinutes(cls.start_time!), end = timeToMinutes(cls.end_time!)
    if (start >= groupEnd && group.length) flush()
    let col = ends.findIndex(value => value <= start)
    if (col < 0) { col = ends.length; ends.push(end) }
    else ends[col] = end
    group.push({ cls, col })
    groupEnd = Math.max(groupEnd, end)
  }
  flush()
  return output
}
