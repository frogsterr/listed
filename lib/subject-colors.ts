const COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f43f5e', '#14b8a6', '#6366f1', '#f59e0b', '#16a34a']

// Always use the full semester's subject list so filtering does not change colors.
export function subjectColor(subject: string | null, subjects: string[]): string {
  const index = subject ? [...subjects].sort().indexOf(subject) : -1
  return index < 0 ? '#9ca3af' : COLORS[index % COLORS.length]
}
