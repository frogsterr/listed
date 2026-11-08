# Verified catalogs

## Spring 2027

Source: the live [MyJTS course search](https://my.jtsa.edu/ICS/Courses/), read on November 8, 2026. The site owner requested List-accessible courses. Selected `2026-2027 - Spring Semester`, List College, all departments, all meeting days, and open or full sections; other filters were unrestricted. Both result pages were captured. A separate unrestricted `List / Graduate` search returned no rows.

`spring-2027-source.json` retains the 36 academic/registration rows and search provenance, without account or enrollment information. `spring-2027.json` contains 30 offerings: 17 scheduled, 12 department-specific honors theses, and one thesis-writing seminar by appointment. These represent 32 academic source listings and 14 named instructors. Four registration placeholders are recorded in `spring-2027-excluded.json`.

Normalization decisions:

- Combine ETH/JTH 3323 and JGW/LIT 3530 because title, faculty, meeting times, and credits match exactly; retain both codes and subjects.
- Retain both Sandra Fox and Isaac Y Landes as instructors for SEM 1012.
- Leave HEB 1101, HEB 2103, and SEM 3999 unassigned because the source says `TBA, Instructor`; do not create a professor named TBA.
- Preserve JTS local meeting times; `R` means Thursday. HEB 2201 meets Monday, Wednesday, and Thursday, not Tuesday.
- Normalize title casing, expand `INTRO`/`MOD.` in display titles, and correct the source typo `ADVACED` to `Advanced` for RLC 3624. Keep original text in the source snapshot.
- Qualify honors-thesis titles by department, consistent with Fall 2026. Retain exact existing titles for returning classes where applicable.
- Convert names to first-name-first order and ignore punctuation in initials when matching existing professors. The live professor directory lacked Benjamin D Sommer, Evan G Parks, and Jonathan Milgram at review time; the importer checks again before inserting.
- Omit enrollment availability and dates from application data; this is a catalog snapshot. Leave unknown degree requirements empty.

Import through the existing reviewed dry-run/apply workflow:

```sh
node --env-file=.env.local scripts/import-courses.mjs data/spring-2027.json
node --env-file=.env.local scripts/import-courses.mjs data/spring-2027.json --apply
```

Alternatively, `supabase/import-spring-2027.sql` applies the same snapshot atomically in the production SQL editor, rejecting ambiguous or conflicting records and preserving all previous semesters and reviews. Use one import method, not concurrent runs. Rerunning an unchanged snapshot is safe.

Deploy the semester selector/default changes only after the import succeeds. Existing Spring/Fall 2026 options remain available.

## Fall 2026

Source: `/Users/benshv/Downloads/Fall 2026 JTS Courses.rtf`, provided by the site owner. Extracted with macOS `textutil`. This is a saved registration-search snapshot, not a live enrollment feed.

`fall-2026.json` contains 33 offerings (21 scheduled, 12 unscheduled honors-thesis entries) representing 39 academic catalog listings and 21 distinct instructors. `fall-2026-excluded.json` records the five non-course registration/program placeholders excluded from the chooser.

Normalization:

- Convert displayed times to 24-hour local JTS meeting times. `R` means Thursday. Preserve both HEB 2103 sections and both SEM 1011 sections.
- Combine identical cross-listings: BIB/JGW/JTH 3224, ETH/JTH 3318, HIS/MED 1011, and HIS/JGW 3061. Retain all codes.
- The owner confirmed HIS 3405 and MJS 3405 are the same course. Merge under “Jewish Ceremonial Art in Context,” retaining both codes; the MJS listing originally used “Jewish Ceremonial Art.”
- Preserve the two instructors for LIS 101 as separate people and teaching assignments.
- Give each department's honors thesis a code-qualified title, so unrelated theses do not share reviews.
- Convert instructor names from “Last, First” to “First Last.” Import matching ignores periods in initials, preventing a duplicate of an existing professor such as Beverly J Bailis.
- Department labels are descriptive subjects inferred from code prefixes, not degree-requirement approvals. No requirement mappings are supplied; all `requirements` arrays remain empty.
- Seats, open/full/waitlisted state, and rooms are omitted from app data because this snapshot may be stale. A truncated end date appears for JGW 3061; no date range is imported.

The import command defaults to a read-only preview. See `supabase/README.md` for applying the schema and importing.
