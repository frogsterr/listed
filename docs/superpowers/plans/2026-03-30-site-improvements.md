# Site Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove public class/professor creation, clean up bogus data, add downvote on reviews, create a Fall 2026 seed script, and revamp the schedule tab to single-day with filters.

**Architecture:** Five independent areas of change: SQL migrations for DB schema + data cleanup, UI gating of add pages, a new downvote feature mirroring the existing upvote pattern, a TS seed script using the service client, and a client-side schedule filter/display overhaul.

**Tech Stack:** Next.js 16, React 19, Supabase (PostgreSQL + RLS + RPCs), Vitest, Tailwind CSS

---

## File Map

**New files:**
- `supabase/migrations/004_downvotes.sql` — adds `unhelpful_count`, `review_downvotes` table, RLS, RPC
- `supabase/migrations/005_cleanup_bogus_data.sql` — deletes bogus classes/professors/reviews, fixes Food class category
- `scripts/seed-fall-2026.ts` — one-off seed script for Fall 2026 classes

**Modified files:**
- `lib/types.ts` — add `unhelpful_count` to `Review`, add `ReviewDownvote` interface
- `actions/votes.ts` — add `downvoteReview` server action
- `components/ReviewCard.tsx` — add Not Helpful button
- `app/classes/page.tsx` — remove `+ Add Class` button
- `app/classes/add/page.tsx` — replace with redirect to `/classes`
- `app/professors/add/page.tsx` — replace with redirect to `/professors`
- `app/schedule/page.tsx` — derive and pass `categories` prop to `ScheduleCalendar`
- `components/ScheduleCalendar.tsx` — single-day view, day/category filters, new color palette

---

## Task 1: Data Cleanup Migration

**Files:**
- Create: `supabase/migrations/005_cleanup_bogus_data.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Delete reviews belonging to bogus classes first (FK cascade would handle it, but explicit is safer)
DELETE FROM reviews
WHERE class_id IN (
  SELECT id FROM classes
  WHERE title IN (
    'How to kidnap temani babies 101',
    'Intro to Koyfer Avoda Zara'
  )
);

-- Delete the bogus classes
DELETE FROM classes
WHERE title IN (
  'How to kidnap temani babies 101',
  'Intro to Koyfer Avoda Zara'
);

-- Delete the bogus professors
DELETE FROM professors
WHERE name IN (
  'Reb Duvid Ben Reb Lipa Laizer Shlita',
  'Usher Strell Ha Cohen'
);

-- Fix the "Food class" category chip — null it out
UPDATE classes SET category = NULL WHERE category = 'Food class';
```

- [ ] **Step 2: Run in Supabase SQL editor**

Paste the file contents into the Supabase dashboard SQL editor and execute. Verify 0 errors.

- [ ] **Step 3: Confirm in admin panel**

Log in at `/admin`, check the Classes tab — the two bogus classes should be gone. Check the classes page — "Food class" category chip should no longer appear.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/005_cleanup_bogus_data.sql
git commit -m "chore: migration to clean up bogus classes, professors, and Food class category"
```

---

## Task 2: Remove Public Class/Professor Adding

**Files:**
- Modify: `app/classes/page.tsx`
- Modify: `app/classes/add/page.tsx`
- Modify: `app/professors/add/page.tsx`

- [ ] **Step 1: Remove + Add Class button from classes page**

In `app/classes/page.tsx`, remove the `Link` to `/classes/add` and the surrounding flex wrapper adjustment:

Remove this block (lines 101–108):
```tsx
<Link
  href="/classes/add"
  className="text-sm bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
>
  + Add Class
</Link>
```

The `<div className="flex items-center justify-between mb-4">` wrapper becomes:
```tsx
<div className="mb-4">
  <h1 className="text-lg font-bold text-gray-900">All Classes</h1>
</div>
```

Also remove the "No classes found — Add one?" link at the bottom (lines 138–140):
```tsx
{groups.length === 0 ? (
  <div className="text-center py-16 text-gray-400 text-sm">
    No classes found.
  </div>
) : (
```

- [ ] **Step 2: Replace /classes/add page with redirect**

Fully replace `app/classes/add/page.tsx` with:
```tsx
import { redirect } from 'next/navigation'

export default function AddClassPage() {
  redirect('/classes')
}
```

- [ ] **Step 3: Replace /professors/add page with redirect**

Fully replace `app/professors/add/page.tsx` with:
```tsx
import { redirect } from 'next/navigation'

export default function AddProfessorPage() {
  redirect('/professors')
}
```

- [ ] **Step 4: Verify**

Run `npm run dev`. Navigate to `/classes/add` — should redirect to `/classes`. Navigate to `/professors/add` — should redirect to `/professors`. The `+ Add Class` button should be gone from `/classes`.

- [ ] **Step 5: Commit**

```bash
git add app/classes/page.tsx app/classes/add/page.tsx app/professors/add/page.tsx
git commit -m "feat: disable public class and professor creation"
```

---

## Task 3: Downvote DB Schema Migration

**Files:**
- Create: `supabase/migrations/004_downvotes.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Add unhelpful_count to reviews
ALTER TABLE reviews ADD COLUMN unhelpful_count INTEGER NOT NULL DEFAULT 0;

-- Downvote dedup table
CREATE TABLE review_downvotes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id  uuid REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  voter_key  text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, voter_key)
);

CREATE INDEX ON review_downvotes(review_id);

-- RLS
ALTER TABLE review_downvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read downvotes"   ON review_downvotes FOR SELECT USING (true);
CREATE POLICY "public insert downvotes" ON review_downvotes FOR INSERT WITH CHECK (true);

-- RPC to atomically record downvote + increment count
CREATE OR REPLACE FUNCTION increment_unhelpful_count(review_id uuid, voter_key text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  already_voted boolean;
BEGIN
  BEGIN
    INSERT INTO review_downvotes (review_id, voter_key)
    VALUES (increment_unhelpful_count.review_id, increment_unhelpful_count.voter_key);
    already_voted := false;
  EXCEPTION WHEN unique_violation THEN
    already_voted := true;
  END;

  IF NOT already_voted THEN
    UPDATE reviews
    SET unhelpful_count = unhelpful_count + 1
    WHERE id = increment_unhelpful_count.review_id;
  END IF;

  RETURN jsonb_build_object('already_voted', already_voted);
END;
$$;
```

- [ ] **Step 2: Run in Supabase SQL editor**

Paste and execute. Confirm no errors. Verify in the Supabase table editor that `reviews` now has `unhelpful_count` and that `review_downvotes` exists.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/004_downvotes.sql
git commit -m "feat: add review downvote table and RPC"
```

---

## Task 4: Update Types and Add downvoteReview Action

**Files:**
- Modify: `lib/types.ts`
- Modify: `actions/votes.ts`

- [ ] **Step 1: Update `Review` type and add `ReviewDownvote`**

In `lib/types.ts`, add `unhelpful_count` to `Review` and add the `ReviewDownvote` interface:

```ts
export interface Review {
  id: string
  class_id: string
  overall_rating: number
  workload_rating: number
  comment: string | null
  tags: string[]
  semester: string
  helpful_count: number
  unhelpful_count: number   // add this line
  created_at: string
}

export interface ReviewVote {
  id: string
  review_id: string
  voter_key: string
  created_at: string
}

export interface ReviewDownvote {
  id: string
  review_id: string
  voter_key: string
  created_at: string
}
```

- [ ] **Step 2: Add `downvoteReview` server action**

In `actions/votes.ts`, append after `upvoteReview`:

```ts
export async function downvoteReview(
  reviewId: string,
  voterKey: string,
  classId: string
): Promise<{ error: string | null; alreadyVoted?: boolean }> {
  if (!isValidVoterKey(voterKey)) return { error: 'invalid voter key' }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc('increment_unhelpful_count', {
    review_id: reviewId,
    voter_key: voterKey,
  })

  if (error) return { error: error.message }

  const result = data as { already_voted: boolean } | null
  const alreadyVoted = result?.already_voted ?? false

  if (!alreadyVoted) {
    revalidatePath(`/classes/${classId}`)
  }

  return { error: null, alreadyVoted }
}
```

- [ ] **Step 3: Run existing tests to confirm nothing broke**

```bash
npm test
```

Expected: all existing tests pass.

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts actions/votes.ts
git commit -m "feat: add downvoteReview action and unhelpful_count type"
```

---

## Task 5: Update ReviewCard with "Not Helpful" Button

**Files:**
- Modify: `components/ReviewCard.tsx`

- [ ] **Step 1: Add downvote state and handler**

Replace the full contents of `components/ReviewCard.tsx` with:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { upvoteReview, downvoteReview } from '@/actions/votes'
import { generateVoterKey } from '@/lib/utils'
import TagBadge from '@/components/TagBadge'
import StarDisplay from '@/components/StarDisplay'
import { workloadToLabel } from '@/lib/utils'
import type { Review } from '@/lib/types'

const VOTER_KEY_STORAGE = 'listed_voter_key'

function getOrCreateVoterKey(): string {
  if (typeof window === 'undefined') return ''
  let key = localStorage.getItem(VOTER_KEY_STORAGE)
  if (!key) {
    key = generateVoterKey()
    localStorage.setItem(VOTER_KEY_STORAGE, key)
  }
  return key
}

interface Props {
  review: Review
  classId: string
  highlighted?: boolean
  professorName?: string
}

export default function ReviewCard({ review, classId, highlighted = false, professorName }: Props) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count)
  const [unhelpfulCount, setUnhelpfulCount] = useState(review.unhelpful_count)
  const [voted, setVoted] = useState(false)
  const [downvoted, setDownvoted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(`voted_${review.id}`)) setVoted(true)
    if (localStorage.getItem(`downvoted_${review.id}`)) setDownvoted(true)
  }, [review.id])

  async function handleUpvote() {
    if (voted || loading) return
    setLoading(true)
    const voterKey = getOrCreateVoterKey()
    const { alreadyVoted } = await upvoteReview(review.id, voterKey, classId)
    if (!alreadyVoted) {
      setHelpfulCount(c => c + 1)
      localStorage.setItem(`voted_${review.id}`, '1')
      setVoted(true)
    } else {
      setVoted(true)
    }
    setLoading(false)
  }

  async function handleDownvote() {
    if (downvoted || loading) return
    setLoading(true)
    const voterKey = getOrCreateVoterKey()
    const { alreadyVoted } = await downvoteReview(review.id, voterKey, classId)
    if (!alreadyVoted) {
      setUnhelpfulCount(c => c + 1)
      localStorage.setItem(`downvoted_${review.id}`, '1')
      setDownvoted(true)
    } else {
      setDownvoted(true)
    }
    setLoading(false)
  }

  return (
    <div
      className={`bg-white rounded-xl p-4 flex flex-col gap-3 ${
        highlighted ? 'border-2 border-primary' : 'border border-cream-border'
      }`}
    >
      <div className="flex justify-between items-center">
        <StarDisplay rating={review.overall_rating} size="md" />
        <span className="text-xs text-gray-400">{review.semester}</span>
      </div>

      {professorName && (
        <div className="text-xs text-gray-500">
          <span className="font-semibold text-gray-600">{professorName}</span>
        </div>
      )}

      {review.comment && (
        <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        <TagBadge tag={`Workload: ${workloadToLabel(review.workload_rating)}`} />
        {review.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleUpvote}
          disabled={voted || loading}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            voted
              ? 'bg-cream-hover border-primary text-primary font-semibold'
              : 'bg-cream border-cream-border text-gray-500 hover:border-primary hover:text-primary'
          }`}
        >
          👍 Helpful ({helpfulCount})
        </button>
        <button
          onClick={handleDownvote}
          disabled={downvoted || loading}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            downvoted
              ? 'bg-red-50 border-red-400 text-red-500 font-semibold'
              : 'bg-cream border-cream-border text-gray-500 hover:border-red-300 hover:text-red-400'
          }`}
        >
          👎 Not Helpful ({unhelpfulCount})
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, navigate to any class with reviews. Confirm both buttons render side by side. Click "Not Helpful" — count should increment and button should turn red-tinted and disable. Refresh — button should remain disabled (localStorage).

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add components/ReviewCard.tsx
git commit -m "feat: add Not Helpful downvote button to reviews"
```

---

## Task 6: Revamp Schedule Tab

**Files:**
- Modify: `app/schedule/page.tsx`
- Modify: `components/ScheduleCalendar.tsx`

- [ ] **Step 1: Update SchedulePage to derive and pass categories**

Replace the full contents of `app/schedule/page.tsx` with:

```tsx
import { createClient } from '@/lib/supabase/server'
import { CURRENT_SEMESTER, SEMESTERS } from '@/lib/constants'
import ScheduleCalendar from '@/components/ScheduleCalendar'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ semester?: string }>
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const { semester: semesterParam } = await searchParams
  const semester = semesterParam ?? CURRENT_SEMESTER
  const supabase = await createClient()

  const { data: classes } = await supabase
    .from('classes')
    .select('*, professor:professors(id, name, created_at)')
    .eq('semester', semester)
    .not('start_time', 'is', null)

  const allClasses = classes ?? []
  const categories = [...new Set(allClasses.map(c => c.category).filter(Boolean))] as string[]

  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-lg font-bold text-gray-900">Weekly Schedule</h1>
        <div className="flex gap-2 flex-wrap">
          {SEMESTERS.map(s => (
            <Link
              key={s}
              href={`/schedule?semester=${encodeURIComponent(s)}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                s === semester
                  ? 'bg-primary text-white border-primary'
                  : 'border-cream-border text-gray-500 bg-white hover:border-primary'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white border border-cream-border rounded-xl overflow-hidden">
        <ScheduleCalendar classes={allClasses} categories={categories} />
      </div>

      {allClasses.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No classes with scheduled times for {semester}.
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Rewrite ScheduleCalendar**

Replace the full contents of `components/ScheduleCalendar.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DAYS } from '@/lib/constants'
import { formatTime } from '@/lib/utils'
import type { Class } from '@/lib/types'
import type { Day } from '@/lib/constants'

const HOUR_START = 8
const HOUR_END = 21
const TOTAL_HOURS = HOUR_END - HOUR_START
const SLOT_HEIGHT = 64

const PALETTE = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-green-600',
]

function categoryColor(category: string | null, sortedCategories: string[]): string {
  if (!category) return 'bg-gray-400'
  const idx = sortedCategories.indexOf(category)
  return idx >= 0 ? PALETTE[idx % PALETTE.length] : 'bg-gray-400'
}

function ClassPopup({ cls, onClose, colorClass }: { cls: Class; onClose: () => void; colorClass: string }) {
  const prof = (cls as unknown as { professor?: { name: string } }).professor
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-xl leading-none"
        >
          ✕
        </button>
        <div className="mb-4">
          {cls.category && (
            <span className={`inline-block text-[10px] font-bold text-white uppercase tracking-widest px-2 py-0.5 rounded-full ${colorClass}`}>
              {cls.category}
            </span>
          )}
          <h2 className="text-base font-bold text-gray-900 mt-2 pr-6">{cls.title}</h2>
        </div>
        <div className="flex flex-col gap-2 text-sm text-gray-600 mb-6">
          {prof?.name && (
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-base">👤</span>
              <span>{prof.name}</span>
            </div>
          )}
          {cls.meeting_days && cls.start_time && (
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-base">🕐</span>
              <span>{cls.meeting_days.join(', ')} · {formatTime(cls.start_time)}–{formatTime(cls.end_time ?? '')}</span>
            </div>
          )}
          {cls.semester && (
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-base">📅</span>
              <span>{cls.semester}</span>
            </div>
          )}
        </div>
        <Link
          href={`/classes/${cls.id}`}
          className="block w-full bg-primary text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          View Reviews →
        </Link>
      </div>
    </div>
  )
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTop(minutes: number): number {
  return ((minutes - HOUR_START * 60) / 60) * SLOT_HEIGHT
}

function minutesToHeight(startMin: number, endMin: number): number {
  return ((endMin - startMin) / 60) * SLOT_HEIGHT
}

interface LayoutItem {
  cls: Class
  col: number
  numCols: number
}

function layoutDayClasses(classes: Class[]): LayoutItem[] {
  const valid = classes.filter(c => c.start_time && c.end_time)
  const sorted = [...valid].sort((a, b) => timeToMinutes(a.start_time!) - timeToMinutes(b.start_time!))

  const colEnds: number[] = []
  const assigned = sorted.map(cls => {
    const s = timeToMinutes(cls.start_time!)
    const e = timeToMinutes(cls.end_time!)
    let col = colEnds.findIndex(end => end <= s)
    if (col === -1) { col = colEnds.length; colEnds.push(e) }
    else colEnds[col] = e
    return { cls, col, startMin: s, endMin: e }
  })

  return assigned.map(item => {
    const numCols = assigned
      .filter(other => other.startMin < item.endMin && other.endMin > item.startMin)
      .reduce((max, other) => Math.max(max, other.col + 1), 1)
    return { cls: item.cls, col: item.col, numCols }
  })
}

function defaultDay(): Day {
  const d = new Date().getDay() // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  return (d >= 1 && d <= 4) ? DAYS[d - 1] : DAYS[0]
}

interface Props {
  classes: Class[]
  categories: string[]
}

export default function ScheduleCalendar({ classes, categories }: Props) {
  const sortedCategories = [...categories].sort()
  const [activeDay, setActiveDay] = useState<Day>(defaultDay())
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [selected, setSelected] = useState<Class | null>(null)

  function toggleCategory(cat: string) {
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const filtered = classes
    .filter(c => c.meeting_days?.includes(activeDay))
    .filter(c => activeCategories.length === 0 || activeCategories.includes(c.category ?? ''))

  const items = layoutDayClasses(filtered)

  const selectedColor = selected ? categoryColor(selected.category, sortedCategories) : ''

  return (
    <>
      {selected && (
        <ClassPopup cls={selected} onClose={() => setSelected(null)} colorClass={selectedColor} />
      )}

      <div className="p-4 flex flex-col gap-3 border-b border-cream-border">
        {/* Day selector */}
        <div className="flex gap-2">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wide transition-colors ${
                activeDay === day
                  ? 'bg-primary text-white border-primary'
                  : 'border-cream-border text-gray-500 bg-white hover:border-primary'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {sortedCategories.length > 0 && (
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => setActiveCategories([])}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                activeCategories.length === 0
                  ? 'bg-primary text-white border-primary'
                  : 'border-cream-border text-gray-500 bg-white hover:border-primary'
              }`}
            >
              All
            </button>
            {sortedCategories.map(cat => {
              const active = activeCategories.includes(cat)
              const color = categoryColor(cat, sortedCategories)
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    active
                      ? `${color} text-white border-transparent`
                      : 'border-cream-border text-gray-500 bg-white hover:border-gray-400'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
            {activeCategories.length > 0 && (
              <button
                onClick={() => setActiveCategories([])}
                className="text-xs text-gray-400 hover:text-gray-600 underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Time grid */}
      <div className="flex">
        {/* Hour labels */}
        <div className="flex flex-col shrink-0" style={{ width: 52 }}>
          {Array.from({ length: TOTAL_HOURS }, (_, i) => (
            <div
              key={i}
              style={{ height: SLOT_HEIGHT }}
              className="text-[10px] text-gray-400 text-right pr-2 pt-0.5"
            >
              {formatTime(`${HOUR_START + i}:00`)}
            </div>
          ))}
        </div>

        {/* Single day column */}
        <div
          className="relative flex-1 border-l border-cream-border"
          style={{ height: TOTAL_HOURS * SLOT_HEIGHT }}
        >
          {Array.from({ length: TOTAL_HOURS }, (_, i) => (
            <div
              key={i}
              style={{ top: i * SLOT_HEIGHT }}
              className="absolute w-full border-t border-cream-border/60"
            />
          ))}

          {items.map(({ cls, col, numCols }) => {
            const startMin = timeToMinutes(cls.start_time!)
            const endMin = timeToMinutes(cls.end_time!)
            const top = minutesToTop(startMin)
            const height = minutesToHeight(startMin, endMin)
            const widthPct = 100 / numCols
            const leftPct = (col / numCols) * 100
            const colorClass = categoryColor(cls.category, sortedCategories)

            return (
              <button
                key={cls.id}
                onClick={() => setSelected(cls)}
                style={{
                  top,
                  height,
                  left: `calc(${leftPct}% + 2px)`,
                  width: `calc(${widthPct}% - 4px)`,
                }}
                className={`absolute ${colorClass} text-white text-[10px] rounded-md px-1.5 py-1 overflow-hidden text-left hover:opacity-90 transition-opacity`}
              >
                <div className="font-semibold leading-tight truncate">{cls.title}</div>
                <div className="opacity-80 text-[9px] mt-0.5">
                  {formatTime(cls.start_time!)}–{formatTime(cls.end_time!)}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`, navigate to `/schedule`. Confirm:
- Day pills render (Mon/Tue/Wed/Thu), only one active at a time
- Category pills appear below day selector, multi-select works, "Clear" appears when a category is active
- Classes show in the single-column grid with distinct colors per category
- Clicking a class opens the popup with category badge in matching color
- "All" pill re-enables when Clear is clicked

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add app/schedule/page.tsx components/ScheduleCalendar.tsx
git commit -m "feat: revamp schedule tab with single-day view, day/category filters, and new colors"
```

---

## Task 7: Fall 2026 Seed Script

**Files:**
- Create: `scripts/seed-fall-2026.ts`

- [ ] **Step 1: Create the script**

```ts
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local
try {
  const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
} catch {
  console.warn('Could not load .env.local — using existing env vars')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── PASTE CLASSES HERE ───────────────────────────────────────────────────────
interface ClassEntry {
  title: string
  category: string | null
  professor: string | null   // professor name; created if not found; null = no professor
  days: string[]             // e.g. ['Mon', 'Wed']
  start_time: string | null  // e.g. '09:00'
  end_time: string | null    // e.g. '10:30'
  semester: string           // e.g. 'Fall 2026'
}

const CLASSES: ClassEntry[] = [
  // Example (remove when filling in real data):
  // {
  //   title: 'Introduction to Talmud',
  //   category: 'Talmud & Rabbinics',
  //   professor: 'Rabbi Goldstein',
  //   days: ['Mon', 'Wed'],
  //   start_time: '09:00',
  //   end_time: '10:30',
  //   semester: 'Fall 2026',
  // },
]
// ─────────────────────────────────────────────────────────────────────────────

async function getOrCreateProfessor(name: string): Promise<string> {
  const { data: existing } = await supabase
    .from('professors')
    .select('id')
    .ilike('name', name)
    .limit(1)
    .single()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('professors')
    .insert({ name })
    .select('id')
    .single()

  if (error || !created) throw new Error(`Failed to create professor "${name}": ${error?.message}`)
  console.log(`  Created professor: ${name}`)
  return created.id
}

async function main() {
  if (CLASSES.length === 0) {
    console.log('No classes defined in CLASSES array. Add entries and re-run.')
    return
  }

  console.log(`Seeding ${CLASSES.length} classes for Fall 2026...\n`)
  let ok = 0
  let fail = 0

  for (const entry of CLASSES) {
    try {
      let professorId: string | null = null
      if (entry.professor) {
        professorId = await getOrCreateProfessor(entry.professor)
      }

      const { error } = await supabase.from('classes').insert({
        title: entry.title,
        category: entry.category ?? null,
        professor_id: professorId,
        meeting_days: entry.days,
        start_time: entry.start_time ?? null,
        end_time: entry.end_time ?? null,
        semester: entry.semester,
      })

      if (error) throw new Error(error.message)
      console.log(`  ✓ ${entry.title}`)
      ok++
    } catch (err) {
      console.error(`  ✗ ${entry.title}: ${(err as Error).message}`)
      fail++
    }
  }

  console.log(`\nDone: ${ok} inserted, ${fail} failed.`)
}

main().catch(console.error)
```

- [ ] **Step 2: Fill in CLASSES array when the user provides the data**

When class data is provided, populate the `CLASSES` array following the `ClassEntry` shape. Each entry needs `title`, `category`, `professor`, `days` (array matching DB format e.g. `['Mon', 'Wed']`), `start_time` / `end_time` in `'HH:MM'` format, and `semester: 'Fall 2026'`.

- [ ] **Step 3: Run the script**

```bash
npx tsx scripts/seed-fall-2026.ts
```

Expected output:
```
Seeding N classes for Fall 2026...

  ✓ Class Title One
  ✓ Class Title Two
  ...

Done: N inserted, 0 failed.
```

If any fail, the error message will show the Supabase reason (e.g. semester format mismatch, duplicate).

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-fall-2026.ts
git commit -m "feat: add Fall 2026 class seed script"
```
