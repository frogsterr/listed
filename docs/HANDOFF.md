# Resume LISTED work — September 13, 2026

User paused to close the laptop. Repository: `/Users/benshv/listed`, branch `fix/admin-only-catalog`.

## User scope and decisions

- Remove the reported troll course and its review.
- Make course/professor additions admin-only.
- Import Fall 2026 courses from `/Users/benshv/Downloads/Fall 2026 JTS Courses.rtf`.
- Improve class selection via ratings, requirements, meeting times, and a calendar.
- Sole administrator email: `benjiblackk@yahoo.com`.

## Completed LIVE

- Removed exactly the reported Spring 2026 course, ID `de21c401-b504-4484-92bd-b2ca739d233c`, and its dependent review/votes. Verified absent. No professors or unrelated courses deleted.
- Backup stored in ignored `.backups/reported-course-1789314588887.json`.
- User successfully ran `supabase/upgrade-production.sql` in Supabase SQL Editor. API verification confirmed the added columns/tables. Do NOT rerun the bundle; it is intended for the original 001–003 schema and was applied already.
- Imported and verified 34 Fall 2026 offerings (22 scheduled, 12 honors-thesis entries) from 39 academic source listings; five registration/program placeholders excluded. Preserved codes, credits, co-instructors and explicit sections. Requirements are empty because the source did not supply mappings.
- Created Supabase Auth admin user `cf596806-fb57-4ee0-b988-61428c1fd3c4`. Generated password is saved privately in `.backups/admin-login.txt` (mode 600), NOT in Git/chat.

## Completed locally, NOT deployed to production

- Built on existing unmerged PR #2 (`feature/site-improvements`, commit c0623b5). This working branch contains its history plus the new changes. Production/master was `db34767`.
- Server-verified Supabase Auth admin login and per-action authorization. Public add buttons removed, forms protected, admin links retained. `ADMIN_USER_ID` fails closed when absent.
- Database migrations deny public catalog writes and arbitrary review updates; anonymous reviews and vote RPCs continue working.
- Schedule tab includes Fall 2026 default, list/calendar views, course/instructor ratings with counts, department, requirement, day/time filters, and deterministic sorting.
- Historical course ratings match exact titles; instructor ratings follow person IDs. For co-taught offerings, instructor filters/sorts use highest-rated instructor; each person's ratings are shown.
- Importer is dry-run by default, validates input, matches professor names ignoring periods, detects duplicates, verifies writes, and repairs teaching assignments on retry. Source decisions documented in `data/README.md`.
- SQL cleanup inherited from PR #2 was narrowed to the single user-reported course; other originally listed deletes are not authorized and were not performed.

## Configuration and secrets

- `.env.local` exists (mode 600), ignored by Git. Contains project URL, public key, server secret, ADMIN_USER_ID. Never print or commit it.
- Project ref: `ijnaxoimvkoghwntrich`; domains `julpa.org` and `listed-ashy.vercel.app`.
- User pasted secret/service-role keys into chat. Advised rotating them after work and updating Vercel. Rotation is still outstanding.
- Set Vercel `ADMIN_USER_ID=cf596806-fb57-4ee0-b988-61428c1fd3c4` before deploying. Existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` were already configured there; old service key showed “Needs Attention.” Do not expose server secrets via NEXT_PUBLIC variables. Remove obsolete NEXT_PUBLIC_ADMIN_PASSWORD if present.

## Validation and remaining work

- 42 tests passed, including real PostgreSQL migration/permissions behavior in PGlite, admin-action access control, planner filtering, and import validation.
- Lint passed. Production build passed before the last small co-instructor/calendar changes. TypeScript passed after those final changes.
- Repeat tests/lint/build on resume; add targeted co-instructor and calendar-overlap coverage, then visually verify with real Fall data.
- Confirm HIS 3405 and MJS 3405 cross-listing: different titles but same instructor/time/room, retained separately pending confirmation.
- Obtain authoritative requirement mappings before populating them. Departments are not asserted to fulfill degree requirements.
- Review deployment/PR strategy: existing PR #2 is still open; no existing PR or master was modified. This branch can supersede or extend it.
- Deploy the app after Vercel environment setup, and verify admin login, unauthenticated action denial, course pages, professor pages, ratings/filtering, and schedule. IMPORTANT: production still runs old code with unguarded service-role server actions until deployment, even though direct public database writes are now blocked.
- No production deployment was performed during this session.

## Tools/access notes

- GitHub CLI authenticated; repository clone/push supported.
- Browser connector reported none. Native Chrome was available via cua.getApp('com.google.Chrome'), with Supabase/Vercel tabs already open. Supabase dashboard became blank on reload; user ran SQL manually instead. Do not interrupt their tabs needlessly.
- Use cua_repl for all browser/computer interactions. Use Supabase JS/API with ignored local credentials for data operations.
- Read `AGENTS.md`; this repo requires relevant local Next.js 16 docs before coding.
