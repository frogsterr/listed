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

export function generateVoterKey(): string {
  return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function isValidVoterKey(key: string): boolean {
  return typeof key === 'string' && key.length > 0 && key.length <= 128
}

export interface ReviewInput {
  class_id: string
  overall_rating: number
  workload_rating: number
  semester: string
  comment?: string
  tags?: string[]
}

export function validateReviewInput(input: ReviewInput): string | null {
  if (!input.class_id) return 'class is required'
  if (input.overall_rating < 1 || input.overall_rating > 5) return 'rating must be 1–5'
  if (input.workload_rating < 1 || input.workload_rating > 5) return 'workload must be 1–5'
  if (!input.semester) return 'semester is required'
  return null
}
