# Supabase setup and operations

## Environment

Copy `.env.local.example` to `.env.local` and configure:

- `NEXT_PUBLIC_SUPABASE_URL`: project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: publishable/anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only secret/service-role key.
- `ADMIN_USER_ID`: UUID of the sole administrator in Supabase Authentication > Users.

Admin login uses a Supabase Auth email and password and verifies the user ID on the server for every privileged action. Unset `ADMIN_USER_ID` denies admin access. Remove the old `NEXT_PUBLIC_ADMIN_PASSWORD` deployment variable; it is no longer used. Never commit credentials.

## Database upgrade

For a new database, run migrations 001–009 in order.

For the production database inspected during this work, migrations 001–003 already exist. Run `supabase/upgrade-production.sql` **once** in the Supabase SQL editor. It applies 004 and 006–009 in one transaction, excluding data cleanup. Do not separately rerun these migrations after applying the bundle. It:

- Blocks catalog writes for public and ordinary authenticated users. Authenticated admin actions use the server-only service client.
- Adds downvotes from the existing site-improvements branch.
- Adds requirement mappings, course codes, credits, instructor metadata, and co-teaching assignments.
- Keeps anonymous reviews and voting available while preventing public review edits, fabricated starting vote counts, and direct vote-table inserts.

Use `/admin` to add classes/professors or moderate records after deploying the application and setting its environment variables. No public sign-up is exposed. Browser auth refresh is handled in `proxy.ts`.

## Import Fall 2026

After the schema upgrade, using Node 22 or later:

```sh
node --env-file=.env.local scripts/import-courses.mjs data/fall-2026.json
node --env-file=.env.local scripts/import-courses.mjs data/fall-2026.json --apply
```

The first command only previews. The second writes the reviewed entries, reuses matching professors, skips exact existing offerings, and verifies the resulting catalog and teaching assignments. Run only one import at a time. A failed partial import can be retried; changed metadata or ambiguous professor matches stop the import for review. See `data/README.md` for source and normalization decisions. The older `seed-fall-2026.ts` placeholder from the previous branch is superseded by this importer.

## Reported course removal

```sh
node --env-file=.env.local scripts/remove-reported-course.mjs
node --env-file=.env.local scripts/remove-reported-course.mjs --apply
```

This targets only the reported title in Spring 2026. It requires exactly one match, saves a private `.backups/` snapshot, deletes the course (cascading to associated reviews/votes), and verifies removal. It does not delete professor records or unrelated content. The reported live record was removed during this task.

## Validation

```sh
npm ci
npm test -- --run
npm run lint
npm run build
```

Tests include server-action authorization, actual PostgreSQL permission/migration behavior using PGlite, import validation, and course-selection logic. No test writes to production.
