export function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  let hour = parseInt(hourStr, 10)
  const minute = minuteStr ?? '00'
  const period = hour >= 12 ? 'pm' : 'am'
  if (hour > 12) hour -= 12
  if (hour === 0) hour = 12
  return `${hour}:${minute}${period}`
}

export function workloadToLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: 'Very Light',
    2: 'Light',
    3: 'Medium',
    4: 'Heavy',
    5: 'Very Heavy',
  }
  return labels[rating] ?? 'Unknown'
}

export function starsArray(rating: number): ('full' | 'empty')[] {
  return Array.from({ length: 5 }, (_, i) => (i < rating ? 'full' : 'empty'))
}

export function roundToHalf(num: number): number {
  return Math.round(num * 2) / 2
}
