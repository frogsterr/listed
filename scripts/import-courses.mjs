import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import { validateCatalog, offeringKey } from './lib/catalog.mjs'

// node --env-file=.env.local scripts/import-courses.mjs courses.json [--apply]
const file = process.argv[2]
if (!file || file.startsWith('--')) throw new Error('Provide a verified course JSON file; see supabase/README.md.')
const entries = validateCatalog(JSON.parse(await readFile(file, 'utf8')))
const apply = process.argv.slice(3).includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Configure the Supabase URL and service role key.')
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const checked = ({ data, error }) => { if (error) throw new Error(error.message); return data }
async function readAll(table, select) {
  const rows = []
  for (let offset = 0; ; offset += 1000) {
    const page = checked(await db.from(table).select(select).order('id').range(offset, offset + 999))
    rows.push(...page)
    if (page.length < 1000) return rows
  }
}
const [professors, classes] = await Promise.all([
  readAll('professors', 'id, name'), readAll('classes', '*'),
])
const normalized = s => s.trim().toLowerCase().replace(/\./g, '')
const names = new Map()
for (const p of professors) {
  const list = names.get(normalized(p.name)) ?? []
  names.set(normalized(p.name), [...list, p.id])
}
const professorById = new Map(professors.map(p => [p.id, p.name]))
const existing = new Map(classes.map(c => [offeringKey({ ...c, catalog_instructors: c.catalog_instructors?.length ? c.catalog_instructors : (professorById.get(c.professor_id) ? [professorById.get(c.professor_id)] : []) }), c]))
const planned = []
let skipped = 0
for (const entry of entries) {
  for (const name of entry.professors) {
    if ((names.get(normalized(name))?.length ?? 0) > 1) throw new Error(`Multiple professors match ${name}; resolve their identities before importing.`)
  }
  const key = offeringKey(entry)
  const match = existing.get(key)
  if (match) {
    if (JSON.stringify([...(match.course_codes ?? [])].sort()) !== JSON.stringify([...entry.course_codes].sort()) || match.credits !== entry.credits || match.category !== entry.category || JSON.stringify([...(match.requirements ?? [])].sort()) !== JSON.stringify([...entry.requirements].sort())) {
      throw new Error(`Existing offering has different catalog metadata: ${entry.title}. Review this change separately.`)
    }
    skipped++
  } else {
    planned.push(entry)
    existing.set(key, entry)
  }
}
console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', insert: planned.length, alreadyPresent: skipped, offerings: planned }, null, 2))
if (!apply) { console.log('No changes made. After reviewing, rerun with --apply.'); process.exit(0) }
// Run one import at a time. Successful rows are recognized on retry after a partial failure.
for (const entry of planned) {
  const professorIds = []
  for (const name of entry.professors) {
    let professorId = names.get(normalized(name))?.[0]
    if (!professorId) {
      const professor = checked(await db.from('professors').insert({ name }).select('id').single())
      professorId = professor.id
      names.set(normalized(name), [professorId])
    }
    professorIds.push(professorId)
  }
  const data = {
    title: entry.title, semester: entry.semester, category: entry.category,
    meeting_days: entry.meeting_days, start_time: entry.start_time, end_time: entry.end_time,
    requirements: entry.requirements, course_codes: entry.course_codes, credits: entry.credits,
    catalog_instructors: entry.professors, professor_id: professorIds[0] ?? null,
  }
  const inserted = checked(await db.from('classes').insert(data).select('id, title').single())
  if (professorIds.length) checked(await db.from('class_professors').upsert(professorIds.map(professor_id => ({ class_id: inserted.id, professor_id })), { onConflict: 'class_id,professor_id' }))
  console.log(`Inserted ${inserted.id}: ${inserted.title}`)
}
// Repair teaching assignments for matching offerings too, so a partial failed
// import can safely be retried after the class itself was inserted.
const finalClasses = await readAll('classes', '*')
for (const entry of entries) {
  const matched = finalClasses.filter(c => offeringKey({ ...c, catalog_instructors: c.catalog_instructors?.length ? c.catalog_instructors : (professorById.get(c.professor_id) ? [professorById.get(c.professor_id)] : []) }) === offeringKey(entry))
  if (matched.length !== 1) throw new Error(`Verification expected exactly one offering: ${entry.title}`)
  const assignments = entry.professors.map(name => ({ class_id: matched[0].id, professor_id: names.get(normalized(name))?.[0] }))
  if (assignments.some(a => !a.professor_id)) throw new Error(`Missing professor: ${entry.title}`)
  if (assignments.length) checked(await db.from('class_professors').upsert(assignments, { onConflict: 'class_id,professor_id' }))
}
console.log(`Completed and verified: ${planned.length} inserted, ${skipped} already present.`)
