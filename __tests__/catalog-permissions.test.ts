// @vitest-environment node
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { describe, expect, it } from 'vitest'

describe('catalog database permissions', () => {
  it('blocks direct public and non-admin inserts while preserving reads and service writes', async () => {
    const db = new PGlite()
    try {
      await db.exec(`
        CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
        CREATE TABLE professors (id int, name text);
        CREATE TABLE classes (id int, title text);
        ALTER TABLE professors ENABLE ROW LEVEL SECURITY;
        ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
        GRANT ALL ON professors, classes TO anon, authenticated, service_role;
        CREATE POLICY "public read professors" ON professors FOR SELECT USING (true);
        CREATE POLICY "public read classes" ON classes FOR SELECT USING (true);
        CREATE POLICY "public insert professors" ON professors FOR INSERT WITH CHECK (true);
        CREATE POLICY "public insert classes" ON classes FOR INSERT WITH CHECK (true);
      `)
      await db.exec(readFileSync('supabase/migrations/006_admin_only_catalog.sql', 'utf8'))
      for (const role of ['anon', 'authenticated']) {
        await db.exec(`SET ROLE ${role}`)
        await expect(db.exec("INSERT INTO classes VALUES (1, 'spam')")).rejects.toThrow(/permission denied/)
        await expect(db.exec("INSERT INTO professors VALUES (1, 'spam')")).rejects.toThrow(/permission denied/)
        await expect(db.exec('DELETE FROM classes')).rejects.toThrow(/permission denied/)
        await expect(db.exec('SELECT * FROM classes')).resolves.toBeDefined()
        await db.exec('RESET ROLE')
      }
      await db.exec("SET ROLE service_role; INSERT INTO classes VALUES (1, 'Official'); INSERT INTO professors VALUES (1, 'Professor');")
      expect((await db.query('SELECT * FROM classes')).rows).toEqual([{ id: 1, title: 'Official' }])
    } finally { await db.close() }
  }, 20000)
})
