import { createClient } from '@supabase/supabase-js'
import { mkdir, writeFile } from 'node:fs/promises'

// node --env-file=.env.local scripts/remove-reported-course.mjs [--apply]
const title = 'How to kidnap temani babies 101'
const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Configure Supabase URL and service role key in .env.local.')
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const checked = ({ data, error }) => { if (error) throw new Error(error.message); return data }
const classes = checked(await db.from('classes').select('*').eq('title', title))
if (!classes.length) { console.log('The reported course is already absent.'); process.exit(0) }
if (classes.length !== 1) throw new Error('Multiple matching courses found. Review their IDs before deleting.')
const cls = classes[0]
if (cls.semester !== 'Spring 2026') throw new Error('Semester differs from the reported course. No deletion performed.')
const reviews = checked(await db.from('reviews').select('*').eq('class_id', cls.id))
console.log(JSON.stringify({ classId: cls.id, title: cls.title, semester: cls.semester, reviews: reviews.length, apply }, null, 2))
if (!apply) { console.log('Dry run only. Use --apply to back up and delete this exact course and its dependent reviews/votes.'); process.exit(0) }
const ids = reviews.map(r => r.id)
const votes = ids.length ? checked(await db.from('review_votes').select('*').in('review_id', ids)) : []
let downvotes = []
if (ids.length) {
  const result = await db.from('review_downvotes').select('*').in('review_id', ids)
  if (result.error && !['PGRST205', '42P01'].includes(result.error.code)) throw new Error(result.error.message)
  downvotes = result.data ?? []
}
await mkdir('.backups', { recursive: true, mode: 0o700 })
const backup = `.backups/reported-course-${Date.now()}.json`
await writeFile(backup, JSON.stringify({ class: cls, reviews, votes, downvotes }, null, 2), { mode: 0o600 })
const removed = checked(await db.from('classes').delete().eq('id', cls.id).eq('title', title).eq('semester', cls.semester).select('id'))
if (removed.length !== 1) throw new Error('Expected exactly one deletion. Inspect the live record.')
const remaining = checked(await db.from('classes').select('id').eq('id', cls.id))
const remainingReviews = checked(await db.from('reviews').select('id').eq('class_id', cls.id))
if (remaining.length || remainingReviews.length) throw new Error('Post-deletion verification failed.')
console.log(`Verified course and reviews removed. Backup: ${backup}. Professor record was not changed.`)
