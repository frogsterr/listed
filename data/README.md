# Fall 2026 catalog

Source: `/Users/benshv/Downloads/Fall 2026 JTS Courses.rtf`, provided by the site owner. Extracted with macOS `textutil`. This is a saved registration-search snapshot, not a live enrollment feed.

`fall-2026.json` contains 34 offerings (22 scheduled, 12 unscheduled honors-thesis entries) representing 39 academic catalog listings and 21 distinct instructors. `fall-2026-excluded.json` records the five non-course registration/program placeholders excluded from the chooser.

Normalization:

- Convert displayed times to 24-hour local JTS meeting times. `R` means Thursday. Preserve both HEB 2103 sections and both SEM 1011 sections.
- Combine identical cross-listings: BIB/JGW/JTH 3224, ETH/JTH 3318, HIS/MED 1011, and HIS/JGW 3061. Retain all codes.
- Keep HIS 3405 and MJS 3405 separate: the snapshot gives different titles, though instructor, room, and time coincide. Confirm whether these should be combined.
- Preserve the two instructors for LIS 101 as separate people and teaching assignments.
- Give each department's honors thesis a code-qualified title, so unrelated theses do not share reviews.
- Convert instructor names from “Last, First” to “First Last.” Import matching ignores periods in initials, preventing a duplicate of an existing professor such as Beverly J Bailis.
- Department labels are descriptive subjects inferred from code prefixes, not degree-requirement approvals. No requirement mappings are supplied; all `requirements` arrays remain empty.
- Seats, open/full/waitlisted state, and rooms are omitted from app data because this snapshot may be stale. A truncated end date appears for JGW 3061; no date range is imported.

The import command defaults to a read-only preview. See `supabase/README.md` for applying the schema and importing.
