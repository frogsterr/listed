// @vitest-environment node
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { expect, it } from 'vitest'

it('upgrades the original schema and preserves anonymous review/vote flows without public catalog writes', async () => {
  const db = new PGlite()
  try {
    await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;')
    for (const migration of ['001_initial', '002_rls', '003_rpc']) {
      await db.exec(readFileSync(`supabase/migrations/${migration}.sql`, 'utf8').replace('create extension if not exists "pgcrypto";', ''))
    }
    await db.exec('GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;')
    await db.exec(readFileSync('supabase/upgrade-production.sql', 'utf8'))
    const cls = (await db.query<{ id: string }>("INSERT INTO classes (title, semester) VALUES ('Test', 'Fall 2026') RETURNING id")).rows[0].id
    await db.exec('SET ROLE anon')
    await expect(db.exec("INSERT INTO professors (name) VALUES ('spam')")).rejects.toThrow(/permission denied/)
    const review = (await db.query<{ id: string }>('INSERT INTO reviews (class_id, overall_rating, workload_rating, semester) VALUES ($1, 5, 3, $2) RETURNING id', [cls, 'Fall 2026'])).rows[0].id
    await expect(db.query('UPDATE reviews SET overall_rating = 1 WHERE id = $1', [review])).rejects.toThrow(/permission denied/)
    await expect(db.query('INSERT INTO reviews (class_id, overall_rating, workload_rating, semester, helpful_count) VALUES ($1, 5, 3, $2, 100)', [cls, 'Fall 2026'])).rejects.toThrow(/row-level security/)
    for (const fn of ['increment_helpful_count', 'increment_unhelpful_count']) {
      expect((await db.query(`SELECT ${fn}($1, 'voter') AS vote`, [review])).rows).toEqual([{ vote: { already_voted: false } }])
      expect((await db.query(`SELECT ${fn}($1, 'voter') AS vote`, [review])).rows).toEqual([{ vote: { already_voted: true } }])
      await expect(db.query(`SELECT ${fn}($1, '')`, [review])).rejects.toThrow(/invalid voter/)
    }
    expect((await db.query('SELECT helpful_count, unhelpful_count FROM reviews WHERE id = $1', [review])).rows).toEqual([{ helpful_count: 1, unhelpful_count: 1 }])
    await db.exec('RESET ROLE; SET ROLE service_role')
    await db.query('DELETE FROM classes WHERE id = $1', [cls])
    expect((await db.query('SELECT * FROM reviews')).rows).toEqual([])
    expect((await db.query('SELECT * FROM review_votes')).rows).toEqual([])
  } finally { await db.close() }
}, 20000)
