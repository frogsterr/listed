import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
try {
  const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
} catch {
  console.warn('Could not load .env.local — using existing env vars')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── PASTE CLASSES HERE ───────────────────────────────────────────────────────
interface ClassEntry {
  title: string
  category: string | null
  professor: string | null   // professor name; created if not found; null = no professor
  days: string[]             // e.g. ['Mon', 'Wed']
  start_time: string | null  // e.g. '09:00'
  end_time: string | null    // e.g. '10:30'
  semester: string           // e.g. 'Fall 2026'
}

const CLASSES: ClassEntry[] = [
  // Example (remove when filling in real data):
  // {
  //   title: 'Introduction to Talmud',
  //   category: 'Talmud & Rabbinics',
  //   professor: 'Rabbi Goldstein',
  //   days: ['Mon', 'Wed'],
  //   start_time: '09:00',
  //   end_time: '10:30',
  //   semester: 'Fall 2026',
  // },
]
// ─────────────────────────────────────────────────────────────────────────────

async function getOrCreateProfessor(name: string): Promise<string> {
  const { data: existing } = await supabase
    .from('professors')
    .select('id')
    .ilike('name', name)
    .limit(1)
    .single()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('professors')
    .insert({ name })
    .select('id')
    .single()

  if (error || !created) throw new Error(`Failed to create professor "${name}": ${error?.message}`)
  console.log(`  Created professor: ${name}`)
  return created.id
}

async function main() {
  if (CLASSES.length === 0) {
    console.log('No classes defined in CLASSES array. Add entries and re-run.')
    return
  }

  console.log(`Seeding ${CLASSES.length} classes for Fall 2026...\n`)
  let ok = 0
  let fail = 0

  for (const entry of CLASSES) {
    try {
      let professorId: string | null = null
      if (entry.professor) {
        professorId = await getOrCreateProfessor(entry.professor)
      }

      const { error } = await supabase.from('classes').insert({
        title: entry.title,
        category: entry.category ?? null,
        professor_id: professorId,
        meeting_days: entry.days,
        start_time: entry.start_time ?? null,
        end_time: entry.end_time ?? null,
        semester: entry.semester,
      })

      if (error) throw new Error(error.message)
      console.log(`  ✓ ${entry.title}`)
      ok++
    } catch (err) {
      console.error(`  ✗ ${entry.title}: ${(err as Error).message}`)
      fail++
    }
  }

  console.log(`\nDone: ${ok} inserted, ${fail} failed.`)
}

main().catch(console.error)
