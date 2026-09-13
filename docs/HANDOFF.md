# LISTED — production status, September 13, 2026

## Completed and deployed

Repository: `/Users/benshv/listed`. Production branch: `master`.
PR #3: https://github.com/frogsterr/listed/pull/3 — merged at `be2c9982a40b71c0b1ffe0d9f8e3c0ac899ebbba`.
Vercel production deployment `Eg73kxApJY8LhsuMAdjGdNuZvJqL` reported success. Public site: https://julpa.org; planner: https://julpa.org/schedule.

- Removed the reported troll course `de21c401-b504-4484-92bd-b2ca739d233c`, including its dependent review/votes. Verified production returns 404. Backup is in ignored `.backups/reported-course-1789314588887.json`. No unrelated courses or professor records were deleted.
- User applied `supabase/upgrade-production.sql`; schema was verified before import. The bundle is ALREADY APPLIED: do not rerun it or reapply migrations 004/006–009 separately.
- Imported and verified 34 Fall 2026 offerings: 22 scheduled, 12 honors-thesis entries, representing 39 academic source listings and 21 instructors. Five non-course registration placeholders were excluded. Dry-run recheck: 0 inserts, 34 already present.
- Added admin-only course/professor creation and moderation, using server-verified Supabase Auth and per-action checks. Database permissions also reject direct public catalog writes. Anonymous reviews and voting remain available; arbitrary public review edits and fabricated initial vote totals are blocked.
- Configured `ADMIN_USER_ID` in Vercel for Production, Preview, and Development. The sole account is `benjiblackk@yahoo.com`, UUID `cf596806-fb57-4ee0-b988-61428c1fd3c4`.
- Deployed the Fall-default course planner, list/calendar views, department and meeting-time filters, course/instructor rating thresholds, review counts, and deterministic sorting. Codes, sections, co-instructors, and historical reviews are preserved. Grouped pages label each offering's semester.

## Verification completed

- 45 tests pass, including PGlite PostgreSQL migration/permissions tests, server-action access control, import validation, co-instructor filtering, and overlapping calendar entries.
- ESLint, TypeScript, and production build pass.
- Browser-tested the local production build against real Supabase data: planner filters and calendar rendering, co-instructors, and separate Spring/Fall section labels.
- Production HTTP checks: schedule/classes/professors/admin pages return 200; the co-instructor Rachel Malaga's page includes List 101; deleted course returns 404; unauthenticated add routes redirect to `/admin`; real authenticated admin requests reach the admin panel and both add forms.
- Production public catalog insert tests with deliberately invalid/null required fields returned permission denied (42501), with no test records created.
- The protected Vercel preview sign-in redirect stalled in browser automation, so hosted verification used the public production domain. Browser control subsequently became unreliable. No safety protections were disabled.

## Remaining data/configuration follow-ups

- Obtain authoritative degree-requirement mappings. The provided RTF contains no such mappings, so `requirements` arrays remain empty and that filter honestly displays “Requirements not available yet.” Department labels are not claims of requirement fulfillment.
- Confirm whether HIS 3405 and MJS 3405 should be combined: titles differ, but instructor/time/room match. They remain separate pending confirmation.
- Rotate Supabase secret/service-role keys previously pasted into chat, and update Vercel plus `.env.local`. Rotation has NOT been performed. The existing Vercel service key was marked “Needs Attention” because it was stored as Config rather than Secret.

## Source and private files

Official source supplied by user: `/Users/benshv/Downloads/Fall 2026 JTS Courses.rtf`.
Normalized data and source decisions: `data/fall-2026.json`, `data/fall-2026-excluded.json`, and `data/README.md`.
Project ref: `ijnaxoimvkoghwntrich`.

`.env.local` contains working configuration and secrets; ignored by Git, mode 600. Never print or commit it.
Admin password is in `.backups/admin-login.txt`, also private/ignored. Do not paste it into chat or Git. Admin URL: https://julpa.org/admin.
Import/deletion logs and backups are in `.backups/`. These operations do not need repeating.

The branch `fix/admin-only-catalog` is retained; it incorporated the older site-improvements PR #2 and fixed its missing authorization. Master contains the final implementation. Read `AGENTS.md` and relevant local Next.js 16 documentation before new code changes. See `supabase/README.md` for maintenance commands.
