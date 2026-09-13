const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/
export function offeringKey(c) {
  return JSON.stringify([
    c.title.trim(), c.semester, [...(c.professors ?? c.catalog_instructors ?? (c.professor ? [c.professor] : []))].map(p => p.trim().toLowerCase().replace(/\./g, '')).sort(),
    [...c.meeting_days].sort(), c.start_time?.slice(0, 5) ?? null, c.end_time?.slice(0, 5) ?? null,
  ])
}
export function validateCatalog(data) {
  if (!Array.isArray(data) || !data.length) throw new Error('Course data must be a non-empty array.')
  const seen = new Set()
  return data.map((row, i) => {
    const fail = message => { throw new Error(`Course ${i + 1}: ${message}`) }
    if (!row || typeof row !== 'object') fail('expected an object')
    if (typeof row.title !== 'string' || !row.title.trim() || row.title.trim().length > 300) fail('invalid title')
    if (typeof row.semester !== 'string' || !/^(Fall|Spring) \d{4}$/.test(row.semester)) fail('invalid semester')
    if (!Array.isArray(row.meeting_days) || row.meeting_days.some(d => !DAYS.includes(d))) fail('invalid meeting days')
    for (const field of ['professor', 'category']) {
      if (row[field] != null && (typeof row[field] !== 'string' || !row[field].trim() || row[field].trim().length > 200)) fail(`invalid ${field}`)
    }
    if (row.professors != null && (!Array.isArray(row.professors) || row.professors.some(p => typeof p !== 'string' || !p.trim()))) fail('invalid professors')
    if (row.course_codes != null && (!Array.isArray(row.course_codes) || row.course_codes.some(c => typeof c !== 'string' || !c.trim()))) fail('invalid course codes')
    if (row.credits != null && (!Number.isFinite(row.credits) || row.credits < 0)) fail('invalid credits')
    const start = row.start_time ?? null, end = row.end_time ?? null
    if (Boolean(start) !== Boolean(end) || (start && (!timePattern.test(start) || !timePattern.test(end) || end <= start))) fail('meeting times must be HH:MM with end after start')
    if (start && !row.meeting_days.length) fail('scheduled courses need meeting days')
    if (row.requirements != null && (!Array.isArray(row.requirements) || row.requirements.some(r => typeof r !== 'string' || !r.trim()))) fail('invalid requirement mappings')
    const entry = {
      title: row.title.trim(), semester: row.semester, category: row.category?.trim() ?? null,
      professor: row.professor?.trim() ?? null,
      professors: row.professors?.map(p => p.trim()) ?? (row.professor ? [row.professor.trim()] : []),
      course_codes: row.course_codes ?? [], credits: row.credits ?? null,
      meeting_days: DAYS.filter(d => row.meeting_days.includes(d)),
      start_time: start, end_time: end, requirements: [...new Set((row.requirements ?? []).map(r => r.trim()))].sort(),
    }
    const key = offeringKey(entry)
    if (seen.has(key)) fail('duplicate offering in input')
    seen.add(key)
    return entry
  })
}
