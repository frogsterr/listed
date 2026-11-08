// @vitest-environment node
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { expect, it } from 'vitest'

it('imports Spring atomically, reuses faculty, preserves reviews, and is safe to retry', async () => {
  const db = new PGlite()
  const sql = readFileSync('supabase/import-spring-2027.sql', 'utf8')
  try {
    await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;')
    for (const migration of ['001_initial', '002_rls', '003_rpc']) {
      await db.exec(readFileSync(`supabase/migrations/${migration}.sql`, 'utf8').replace('create extension if not exists "pgcrypto";', ''))
    }
    await db.exec(readFileSync('supabase/upgrade-production.sql', 'utf8'))
    await db.exec(`
      INSERT INTO professors(name) VALUES ('Beverly J. Bailis');
      INSERT INTO classes(title, semester) VALUES ('Historical course', 'Fall 2026');
      INSERT INTO reviews(class_id, overall_rating, workload_rating, semester, comment)
        SELECT id, 5, 3, semester, 'Keep this review' FROM classes;
    `)
    const snapshot = async () => Promise.all(['professors', 'classes', 'class_professors', 'reviews'].map(async table =>
      (await db.query(`SELECT * FROM ${table} ORDER BY id`)).rows))
    const oldReviews = (await db.query('SELECT * FROM reviews')).rows
    await db.exec(sql)
    expect((await db.query("SELECT count(*)::int AS n FROM classes WHERE semester = 'Spring 2027'")).rows).toEqual([{ n: 30 }])
    expect((await db.query('SELECT count(*)::int AS n FROM professors')).rows).toEqual([{ n: 14 }])
    expect((await db.query('SELECT count(*)::int AS n FROM class_professors')).rows).toEqual([{ n: 16 }])
    expect((await db.query('SELECT * FROM reviews')).rows).toEqual(oldReviews)
    const imported = await snapshot()
    await db.exec(sql)
    expect(await snapshot()).toEqual(imported)

    await db.exec("UPDATE classes SET credits = 99 WHERE course_codes @> ARRAY['BIB 3009'];")
    const beforeConflict = await snapshot()
    await expect(db.exec(sql)).rejects.toThrow(/Existing offering differs/)
    await db.exec('ROLLBACK')
    expect(await snapshot()).toEqual(beforeConflict)

    await db.exec("INSERT INTO professors(name) VALUES ('Ronald Androphy');")
    const beforeAmbiguity = await snapshot()
    await expect(db.exec(sql)).rejects.toThrow(/Ambiguous professor/)
    await db.exec('ROLLBACK')
    expect(await snapshot()).toEqual(beforeAmbiguity)
  } finally { await db.close() }
}, 20000)
