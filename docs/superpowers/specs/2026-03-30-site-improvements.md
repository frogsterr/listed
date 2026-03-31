# Site Improvements — Design Spec
**Date:** 2026-03-30

## Overview

Five improvements based on user feedback:
1. Remove public class/professor creation
2. Clean up bogus data
3. Add downvote ("Not Helpful") to reviews
4. Fall 2026 classes seed script
5. Schedule tab revamp

---

## 1. Remove Class/Professor Adding

**Goal:** Students can only browse classes/professors and write reviews. No public creation.

**Changes:**
- Remove `+ Add Class` button from `/classes` page
- Replace `/classes/add` page content with a redirect to `/classes` (or a simple "not available" message)
- Replace `/professors/add` page content with a redirect to `/professors`
- The `addClass` / `addProfessor` server actions and admin panel are untouched

---

## 2. Data Cleanup SQL Migration

**File:** `supabase/migrations/<timestamp>_cleanup_bogus_data.sql`

**Operations (in order):**
1. Delete reviews where `class_id` IN (SELECT id FROM classes WHERE title IN the bogus list)
2. Delete classes with titles: `'How to kidnap temani babies 101'`, `'Intro to Koyfer Avoda Zara'`
3. Delete professors with names: `'Reb Duvid Ben Reb Lipa Laizer Shlita'`, `'Usher Strell Ha Cohen'`
4. `UPDATE classes SET category = NULL WHERE category = 'Food class'`

Run via Supabase SQL editor or CLI.

---

## 3. Downvote / "Not Helpful" on Reviews

**Goal:** Students can mark a review as unhelpful (mirrors the existing helpful/upvote system).

### Database

- Add `unhelpful_count INTEGER NOT NULL DEFAULT 0` to `reviews` table
- Create `review_downvotes` table:
  ```sql
  CREATE TABLE review_downvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    voter_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(review_id, voter_key)
  );
  ```
- Create RPC `decrement_helpful_count` (mirrors `increment_helpful_count`):
  - Inserts into `review_downvotes`, returns `{ already_voted: boolean }`
  - On success, increments `reviews.unhelpful_count`

### Types

- `Review` gains `unhelpful_count: number`
- `ReviewDownvote` interface (mirrors `ReviewVote`)

### Server Action

- New `downvoteReview(reviewId, voterKey, classId)` in `actions/votes.ts` — mirrors `upvoteReview`

### UI (ReviewCard)

- Add `👎 Not Helpful (N)` button alongside the existing `👍 Helpful (N)` button
- Uses same localStorage dedup pattern (`downvoted_<reviewId>`)
- Both buttons independent — a user can do either or both
- Voted state styling matches the upvote button

---

## 4. Fall 2026 Classes Seed Script

**Goal:** Admin can paste class data and a script inserts them into the DB with correct professor linkage.

**File:** `scripts/seed-fall-2026.ts` (Node/ts-node script using the service client)

**Input format:** The user will supply class data directly in the script as a typed array:
```ts
const CLASSES = [
  {
    title: 'Class Title',
    category: 'Talmud & Rabbinics',   // must match existing categories
    professor: 'Professor Name',        // matched by name; created if not found
    days: ['Mon', 'Wed'],
    start_time: '09:00',
    end_time: '10:30',
    semester: 'Fall 2026',
  },
  // ...
]
```

**Logic:**
- For each class, look up professor by name in `professors` table; insert if not found
- Insert class with resolved `professor_id`
- Log success/failure per entry

**Run with:** `npx ts-node scripts/seed-fall-2026.ts`

---

## 5. Schedule Tab Revamp

**Goal:** Cleaner single-day view with day and category filters.

### Data Flow

- `SchedulePage` (server) fetches all classes for the selected semester + passes `categories` array derived from classes
- `ScheduleCalendar` (client) owns `activeDay` and `activeCategories` state — all filtering is client-side

### Day Selector

- Pills: `Mon | Tue | Wed | Thu` — one active at a time
- Default: current weekday if Mon–Thu, else Mon
- Displayed above the time grid

### Category Filter

- Multi-select pills derived from `category` values in the passed classes
- "All" pill (active when no categories selected) — clicking it clears all
- Clicking a category toggles it; multiple can be active simultaneously
- "Clear" button appears when ≥1 category is active

### Color Palette

- 8 distinct colors assigned by category (not by index): blue, green, teal, purple, rose, indigo, amber, emerald
- Same category always gets the same color across all days
- Fallback color for null/unknown categories

### Layout

- Single-column time grid (replaces the 4-day grid)
- Overlapping block resolution logic unchanged (columns within a day)
- Class popup (click-to-expand) unchanged

### Filtering Logic

```
displayedClasses = classes
  .filter(c => c.meeting_days?.includes(activeDay))
  .filter(c => activeCategories.length === 0 || activeCategories.includes(c.category))
```
