export const CURRENT_SEMESTER = 'Spring 2026'

export const SEMESTERS = [
  'Spring 2026',
  'Fall 2026',
]

export const WORKLOAD_LABELS: Record<number, string> = {
  1: 'Very Light',
  2: 'Light',
  3: 'Medium',
  4: 'Heavy',
  5: 'Very Heavy',
}

export const TAGS = [
  {
    group: 'Professor Style',
    tags: [
      'Harsh Grader',
      'Easy Grader',
      'Engaging Lectures',
      'Dry Lectures',
      'Very Accessible',
      'Hard to Reach',
    ],
  },
  {
    group: 'Time Commitment',
    tags: [
      '<2 hrs/week',
      '2–5 hrs/week',
      '5–10 hrs/week',
      '10–20 hrs/week',
      '20+ hrs/week',
    ],
  },
  {
    group: 'Class Vibe',
    tags: [
      'Attendance Required',
      'Skip-Friendly',
      'Lots of Discussion',
      'Mostly Lecture',
      'Would Retake',
    ],
  },
]

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu'] as const
export type Day = typeof DAYS[number]
