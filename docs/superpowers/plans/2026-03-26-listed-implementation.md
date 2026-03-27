# LISTED Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build LISTED — a full-stack Next.js course review site for JTS List College students, deployed on Vercel with Supabase as the database.

**Architecture:** Next.js 14 App Router with Server Components for all data fetching (direct Supabase queries) and Server Actions for all mutations. No API layer. Client Components only where interactivity is required (modals, forms, upvote button).

**Tech Stack:** Next.js 14, TypeScript, Supabase (Postgres), Tailwind CSS, Vitest, Vercel

---

## File Map

```
jts-reviews/
├── app/
│   ├── layout.tsx                  # Root layout + NavBar
│   ├── page.tsx                    # Homepage (hero, stats, trending, top profs)
│   ├── globals.css                 # Tailwind directives + CSS vars
│   ├── classes/
│   │   ├── page.tsx                # Classes list (search, filter, grid)
│   │   └── [id]/
│   │       └── page.tsx            # Class detail (ratings, reviews, modal trigger)
│   ├── professors/
│   │   └── [id]/
│   │       └── page.tsx            # Professor detail
│   ├── schedule/
│   │   └── page.tsx                # 5-day calendar view
│   └── admin/
│       └── page.tsx                # Password-gated admin panel
├── components/
│   ├── NavBar.tsx                  # Logo + nav links (server)
│   ├── StatsRow.tsx                # Reviews/Classes/Profs counts (server)
│   ├── HeroSearch.tsx              # Search bar with redirect (client)
│   ├── TrendingSection.tsx         # Trending classes list (server)
│   ├── TopProfessorsSection.tsx    # Top professors list (server)
│   ├── ClassCard.tsx               # Class card used in list + leaderboard (server)
│   ├── ProfessorCard.tsx           # Professor card (server)
│   ├── RatingSummary.tsx           # Big score + workload bars (server)
│   ├── StarDisplay.tsx             # Read-only star display (server)
│   ├── ReviewCard.tsx              # Single review with upvote button (client)
│   ├── ReviewList.tsx              # Sortable review list (client)
│   ├── ReviewModal.tsx             # Full review submission modal (client)
│   ├── TagBadge.tsx                # Single pill tag (server)
│   ├── ScheduleCalendar.tsx        # 5-col Mon-Fri grid (client)
│   ├── AddClassModal.tsx           # Search-first add class flow (client)
│   └── AddProfessorModal.tsx       # Add professor flow (client)
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client (singleton)
│   │   └── server.ts               # Server Supabase client (per-request)
│   ├── types.ts                    # All TypeScript interfaces
│   ├── constants.ts                # Tags, workload labels, semesters, CURRENT_SEMESTER
│   └── utils.ts                    # formatTime, starsToLabel, workloadToLabel
├── actions/
│   ├── reviews.ts                  # submitReview, deleteReview
│   ├── votes.ts                    # upvoteReview
│   ├── classes.ts                  # addClass, deleteClass
│   └── professors.ts               # addProfessor, deleteProfessor
├── supabase/
│   └── migrations/
│       └── 001_initial.sql         # Full schema
├── __tests__/
│   ├── utils.test.ts               # formatTime, starsToLabel, workloadToLabel
│   ├── actions/
│   │   ├── reviews.test.ts         # submitReview validation logic
│   │   └── votes.test.ts           # upvote dedup logic
│   └── constants.test.ts           # Tag/label completeness checks
├── .env.local.example
├── tailwind.config.ts
└── vitest.config.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via npx)
- Create: `tailwind.config.ts`
- Create: `app/globals.css`
- Create: `.env.local.example`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create Next.js app**

```bash
cd /home/benshv/github/jts-reviews
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=no \
  --import-alias="@/*" \
  --no-git
```

When prompted, accept all defaults (the flags above cover everything). Say "yes" if asked to install create-next-app.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Configure Tailwind with LISTED colors**

Replace the contents of `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e8650a',
        'primary-light': '#f5a05a',
        cream: '#fff8f2',
        'cream-border': '#f0ddd0',
        'cream-hover': '#fff3ea',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 4: Set up globals.css**

Replace `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-cream text-[#1a1a1a];
  }
}
```

- [ ] **Step 5: Create vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

Create `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Create .env.local.example**

Create `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_PASSWORD=admin
```

- [ ] **Step 7: Verify scaffold compiles**

```bash
npm run build 2>&1 | tail -5
```

Expected: build succeeds (may have default page warnings — that's fine).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Tailwind + Vitest"
```

---

## Task 2: Supabase Schema

**Files:**
- Create: `supabase/migrations/001_initial.sql`

- [ ] **Step 1: Write the migration file**

Create `supabase/migrations/001_initial.sql`:

```sql
-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Professors
create table professors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz default now()
);

-- Classes
create table classes (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  category      text,
  professor_id  uuid references professors(id) on delete set null,
  meeting_days  text[] default '{}',
  start_time    time,
  end_time      time,
  semester      text not null,
  created_at    timestamptz default now()
);

-- Reviews
create table reviews (
  id              uuid primary key default gen_random_uuid(),
  class_id        uuid references classes(id) on delete cascade not null,
  overall_rating  int not null check (overall_rating between 1 and 5),
  workload_rating int not null check (workload_rating between 1 and 5),
  comment         text,
  tags            text[] default '{}',
  semester        text not null,
  helpful_count   int default 0,
  created_at      timestamptz default now()
);

-- Review votes (upvote dedup)
create table review_votes (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid references reviews(id) on delete cascade not null,
  voter_key  text not null,
  created_at timestamptz default now(),
  unique(review_id, voter_key)
);

-- Indexes for common queries
create index on classes(professor_id);
create index on classes(semester);
create index on reviews(class_id);
create index on reviews(helpful_count desc);
create index on review_votes(review_id, voter_key);
```

- [ ] **Step 2: Set up Supabase project**

1. Go to https://supabase.com and create a free account / project
2. Name it `listed-jts`
3. Once created, go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Create `.env.local` (copy from `.env.local.example`, fill in your values):

```bash
cp .env.local.example .env.local
# Then edit .env.local with your actual Supabase values
```

- [ ] **Step 3: Run the migration**

In the Supabase dashboard:
1. Go to **SQL Editor**
2. Paste the entire contents of `supabase/migrations/001_initial.sql`
3. Click **Run**
4. Verify all 4 tables appear in **Table Editor**

- [ ] **Step 4: Set Row Level Security to allow public reads and writes**

In Supabase SQL Editor, run:

```sql
-- Allow anyone to read everything
alter table professors enable row level security;
alter table classes enable row level security;
alter table reviews enable row level security;
alter table review_votes enable row level security;

create policy "public read professors" on professors for select using (true);
create policy "public insert professors" on professors for insert with check (true);
create policy "public delete professors" on professors for delete using (true);

create policy "public read classes" on classes for select using (true);
create policy "public insert classes" on classes for insert with check (true);
create policy "public delete classes" on classes for delete using (true);

create policy "public read reviews" on reviews for select using (true);
create policy "public insert reviews" on reviews for insert with check (true);
create policy "public update reviews" on reviews for update using (true);
create policy "public delete reviews" on reviews for delete using (true);

create policy "public read votes" on review_votes for select using (true);
create policy "public insert votes" on review_votes for insert with check (true);
create policy "public delete votes" on review_votes for delete using (true);
```

- [ ] **Step 5: Commit**

```bash
git add supabase/ .env.local.example
git commit -m "chore: add database schema migration"
```

---

## Task 3: Types, Constants, and Utils

**Files:**
- Create: `lib/types.ts`
- Create: `lib/constants.ts`
- Create: `lib/utils.ts`
- Create: `__tests__/utils.test.ts`
- Create: `__tests__/constants.test.ts`

- [ ] **Step 1: Write failing tests first**

Create `__tests__/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { formatTime, workloadToLabel, starsArray } from '@/lib/utils'

describe('formatTime', () => {
  it('formats 24h time to 12h', () => {
    expect(formatTime('10:00')).toBe('10:00am')
    expect(formatTime('14:30')).toBe('2:30pm')
    expect(formatTime('12:00')).toBe('12:00pm')
    expect(formatTime('00:00')).toBe('12:00am')
  })
})

describe('workloadToLabel', () => {
  it('maps 1-5 to labels', () => {
    expect(workloadToLabel(1)).toBe('Very Light')
    expect(workloadToLabel(2)).toBe('Light')
    expect(workloadToLabel(3)).toBe('Medium')
    expect(workloadToLabel(4)).toBe('Heavy')
    expect(workloadToLabel(5)).toBe('Very Heavy')
  })
})

describe('starsArray', () => {
  it('returns array of full/empty star indicators', () => {
    expect(starsArray(3)).toEqual(['full','full','full','empty','empty'])
    expect(starsArray(5)).toEqual(['full','full','full','full','full'])
    expect(starsArray(1)).toEqual(['full','empty','empty','empty','empty'])
  })
})
```

Create `__tests__/constants.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { TAGS, WORKLOAD_LABELS, SEMESTERS } from '@/lib/constants'

describe('TAGS', () => {
  it('has three groups', () => {
    expect(TAGS).toHaveLength(3)
    expect(TAGS.map(g => g.group)).toEqual(['Professor Style', 'Time Commitment', 'Class Vibe'])
  })

  it('each group has at least one tag', () => {
    TAGS.forEach(group => {
      expect(group.tags.length).toBeGreaterThan(0)
    })
  })
})

describe('WORKLOAD_LABELS', () => {
  it('has entries for 1 through 5', () => {
    expect(WORKLOAD_LABELS[1]).toBeDefined()
    expect(WORKLOAD_LABELS[5]).toBeDefined()
  })
})

describe('SEMESTERS', () => {
  it('is a non-empty array of strings', () => {
    expect(Array.isArray(SEMESTERS)).toBe(true)
    expect(SEMESTERS.length).toBeGreaterThan(0)
    SEMESTERS.forEach(s => expect(typeof s).toBe('string'))
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run __tests__/utils.test.ts __tests__/constants.test.ts 2>&1 | tail -15
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Create lib/types.ts**

```typescript
export interface Professor {
  id: string
  name: string
  created_at: string
}

export interface Class {
  id: string
  title: string
  category: string | null
  professor_id: string | null
  meeting_days: string[]
  start_time: string | null  // e.g. "10:00"
  end_time: string | null    // e.g. "11:30"
  semester: string
  created_at: string
  // Joined
  professor?: Professor
}

export interface Review {
  id: string
  class_id: string
  overall_rating: number
  workload_rating: number
  comment: string | null
  tags: string[]
  semester: string
  helpful_count: number
  created_at: string
}

export interface ReviewVote {
  id: string
  review_id: string
  voter_key: string
  created_at: string
}

// Aggregated views
export interface ClassWithStats extends Class {
  avg_overall: number
  review_count: number
}

export interface ProfessorWithStats extends Professor {
  avg_overall: number
  review_count: number
}
```

- [ ] **Step 4: Create lib/constants.ts**

```typescript
export const CURRENT_SEMESTER = 'Spring 2026'

export const SEMESTERS = [
  'Spring 2026',
  'Fall 2025',
  'Spring 2025',
  'Fall 2024',
  'Spring 2024',
  'Fall 2023',
]

export const WORKLOAD_LABELS: Record<number, string> = {
  1: 'Very Light',
  2: 'Light',
  3: 'Medium',
  4: 'Heavy',
  5: 'Very Heavy',
}

export const TAGS = [
  {
    group: 'Professor Style',
    tags: [
      'Harsh Grader',
      'Easy Grader',
      'Engaging Lectures',
      'Dry Lectures',
      'Very Accessible',
      'Hard to Reach',
    ],
  },
  {
    group: 'Time Commitment',
    tags: [
      '<2 hrs/week',
      '2–5 hrs/week',
      '5–10 hrs/week',
      '10–20 hrs/week',
      '20+ hrs/week',
    ],
  },
  {
    group: 'Class Vibe',
    tags: [
      'Attendance Required',
      'Skip-Friendly',
      'Lots of Discussion',
      'Mostly Lecture',
      'Would Retake',
    ],
  },
]

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const
export type Day = typeof DAYS[number]
```

- [ ] **Step 5: Create lib/utils.ts**

```typescript
export function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  let hour = parseInt(hourStr, 10)
  const minute = minuteStr ?? '00'
  const period = hour >= 12 ? 'pm' : 'am'
  if (hour > 12) hour -= 12
  if (hour === 0) hour = 12
  return `${hour}:${minute}${period}`
}

export function workloadToLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: 'Very Light',
    2: 'Light',
    3: 'Medium',
    4: 'Heavy',
    5: 'Very Heavy',
  }
  return labels[rating] ?? 'Unknown'
}

export function starsArray(rating: number): ('full' | 'empty')[] {
  return Array.from({ length: 5 }, (_, i) => (i < rating ? 'full' : 'empty'))
}

export function roundToHalf(num: number): number {
  return Math.round(num * 2) / 2
}
```

- [ ] **Step 6: Run tests and confirm they pass**

```bash
npx vitest run __tests__/utils.test.ts __tests__/constants.test.ts 2>&1 | tail -15
```

Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/ __tests__/
git commit -m "feat: add types, constants, and utility functions"
```

---

## Task 4: Supabase Clients

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] **Step 1: Create browser client**

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create server client**

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookie setting ignored
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors (or only pre-existing scaffold errors).

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase browser and server clients"
```

---

## Task 5: NavBar Component

**Files:**
- Create: `components/NavBar.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create NavBar**

Create `components/NavBar.tsx`:

```tsx
import Link from 'next/link'

export default function NavBar() {
  return (
    <nav className="bg-primary text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="font-bold text-lg tracking-tight">
        LISTED
      </Link>
      <div className="flex gap-6 text-sm opacity-90">
        <Link href="/classes" className="hover:opacity-100 transition-opacity">
          Classes
        </Link>
        <Link href="/professors" className="hover:opacity-100 transition-opacity">
          Professors
        </Link>
        <Link href="/schedule" className="hover:opacity-100 transition-opacity">
          Schedule
        </Link>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Update root layout**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavBar from '@/components/NavBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LISTED — JTS Course Reviews',
  description: 'Anonymous course and professor reviews for JTS List College students.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-cream`}>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify dev server renders nav**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000 | grep -o 'LISTED' | head -1
```

Expected: `LISTED`

```bash
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add components/NavBar.tsx app/layout.tsx
git commit -m "feat: add NavBar and root layout"
```

---

## Task 6: Homepage — Hero + Stats

**Files:**
- Create: `components/HeroSearch.tsx`
- Create: `components/StatsRow.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create HeroSearch (client component)**

Create `components/HeroSearch.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/classes?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-6 text-center text-white">
      <h1 className="text-xl font-bold mb-1">Find your next class</h1>
      <p className="text-sm opacity-90 mb-4">Anonymous reviews from JTS students</p>
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="text-gray-300 text-sm">🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search classes or professors..."
            className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400"
          />
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Create StatsRow (server component)**

Create `components/StatsRow.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function StatsRow() {
  const supabase = createClient()

  const [{ count: reviewCount }, { count: classCount }, { count: profCount }] =
    await Promise.all([
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('professors').select('*', { count: 'exact', head: true }),
    ])

  const stats = [
    { label: 'Reviews', value: reviewCount ?? 0 },
    { label: 'Classes', value: classCount ?? 0 },
    { label: 'Professors', value: profCount ?? 0 },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="bg-white border border-cream-border rounded-lg py-3 text-center"
        >
          <div className="text-xl font-bold text-primary">{stat.value}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Build the homepage shell**

Replace `app/page.tsx`:

```tsx
import { Suspense } from 'react'
import HeroSearch from '@/components/HeroSearch'
import StatsRow from '@/components/StatsRow'

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      <HeroSearch />
      <Suspense fallback={<div className="h-16 animate-pulse bg-white rounded-lg" />}>
        <StatsRow />
      </Suspense>
      {/* Trending and Top Professors added in Task 7 */}
    </div>
  )
}
```

- [ ] **Step 4: Verify it renders**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add components/HeroSearch.tsx components/StatsRow.tsx app/page.tsx
git commit -m "feat: homepage hero search and stats row"
```

---

## Task 7: Homepage — Trending + Top Professors

**Files:**
- Create: `components/ClassCard.tsx`
- Create: `components/ProfessorCard.tsx`
- Create: `components/TrendingSection.tsx`
- Create: `components/TopProfessorsSection.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create StarDisplay**

Create `components/StarDisplay.tsx`:

```tsx
import { starsArray } from '@/lib/utils'

export default function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const stars = starsArray(Math.round(rating))
  const cls = size === 'md' ? 'text-base' : 'text-sm'
  return (
    <span className={cls}>
      {stars.map((s, i) =>
        s === 'full' ? (
          <span key={i} className="text-primary">★</span>
        ) : (
          <span key={i} className="text-gray-200">★</span>
        )
      )}
    </span>
  )
}
```

- [ ] **Step 2: Create ClassCard**

Create `components/ClassCard.tsx`:

```tsx
import Link from 'next/link'
import StarDisplay from '@/components/StarDisplay'
import type { ClassWithStats } from '@/lib/types'

export default function ClassCard({ cls }: { cls: ClassWithStats }) {
  return (
    <Link href={`/classes/${cls.id}`}>
      <div className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-center hover:border-primary transition-colors">
        <div>
          <div className="text-sm font-semibold text-gray-900">{cls.title}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {cls.professor?.name ?? 'Unknown professor'}
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-bold text-primary">
            {cls.avg_overall.toFixed(1)}
          </span>
          <StarDisplay rating={cls.avg_overall} />
          <span className="text-[10px] text-gray-400">{cls.review_count} reviews</span>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: Create ProfessorCard**

Create `components/ProfessorCard.tsx`:

```tsx
import Link from 'next/link'
import StarDisplay from '@/components/StarDisplay'
import type { ProfessorWithStats } from '@/lib/types'

export default function ProfessorCard({ professor }: { professor: ProfessorWithStats }) {
  return (
    <Link href={`/professors/${professor.id}`}>
      <div className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-center hover:border-primary transition-colors">
        <div>
          <div className="text-sm font-semibold text-gray-900">{professor.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">{professor.review_count} reviews</div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-bold text-primary">
            {professor.avg_overall.toFixed(1)}
          </span>
          <StarDisplay rating={professor.avg_overall} />
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Create TrendingSection**

Create `components/TrendingSection.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { CURRENT_SEMESTER } from '@/lib/constants'
import ClassCard from '@/components/ClassCard'
import type { ClassWithStats } from '@/lib/types'

export default async function TrendingSection() {
  const supabase = createClient()

  // Get classes with avg rating for current semester (min 2 reviews)
  const { data: reviews } = await supabase
    .from('reviews')
    .select('class_id, overall_rating')
    .eq('semester', CURRENT_SEMESTER)

  if (!reviews || reviews.length === 0) return null

  // Aggregate in JS
  const map = new Map<string, { sum: number; count: number }>()
  for (const r of reviews) {
    const existing = map.get(r.class_id) ?? { sum: 0, count: 0 }
    map.set(r.class_id, { sum: existing.sum + r.overall_rating, count: existing.count + 1 })
  }

  const qualifiedIds = [...map.entries()]
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].sum / b[1].count - a[1].sum / a[1].count)
    .slice(0, 5)
    .map(([id]) => id)

  if (qualifiedIds.length === 0) return null

  const { data: classes } = await supabase
    .from('classes')
    .select('*, professor:professors(id, name, created_at)')
    .in('id', qualifiedIds)

  if (!classes) return null

  const ranked: ClassWithStats[] = qualifiedIds
    .map(id => {
      const cls = classes.find(c => c.id === id)
      if (!cls) return null
      const stats = map.get(id)!
      return { ...cls, avg_overall: stats.sum / stats.count, review_count: stats.count }
    })
    .filter(Boolean) as ClassWithStats[]

  return (
    <div>
      <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
        🔥 Trending This Semester
      </h2>
      <div className="flex flex-col gap-2">
        {ranked.map(cls => <ClassCard key={cls.id} cls={cls} />)}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create TopProfessorsSection**

Create `components/TopProfessorsSection.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import ProfessorCard from '@/components/ProfessorCard'
import type { ProfessorWithStats } from '@/lib/types'

export default async function TopProfessorsSection() {
  const supabase = createClient()

  // All reviews joined to classes to get professor_id
  const { data: reviews } = await supabase
    .from('reviews')
    .select('overall_rating, class:classes(professor_id)')

  if (!reviews || reviews.length === 0) return null

  const map = new Map<string, { sum: number; count: number }>()
  for (const r of reviews) {
    const profId = (r.class as { professor_id: string | null })?.professor_id
    if (!profId) continue
    const existing = map.get(profId) ?? { sum: 0, count: 0 }
    map.set(profId, { sum: existing.sum + r.overall_rating, count: existing.count + 1 })
  }

  const qualifiedIds = [...map.entries()]
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].sum / b[1].count - a[1].sum / a[1].count)
    .slice(0, 5)
    .map(([id]) => id)

  if (qualifiedIds.length === 0) return null

  const { data: professors } = await supabase
    .from('professors')
    .select('*')
    .in('id', qualifiedIds)

  if (!professors) return null

  const ranked: ProfessorWithStats[] = qualifiedIds
    .map(id => {
      const prof = professors.find(p => p.id === id)
      if (!prof) return null
      const stats = map.get(id)!
      return { ...prof, avg_overall: stats.sum / stats.count, review_count: stats.count }
    })
    .filter(Boolean) as ProfessorWithStats[]

  return (
    <div>
      <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
        🏆 Top Professors
      </h2>
      <div className="flex flex-col gap-2">
        {ranked.map(prof => <ProfessorCard key={prof.id} professor={prof} />)}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Update homepage**

Replace `app/page.tsx`:

```tsx
import { Suspense } from 'react'
import HeroSearch from '@/components/HeroSearch'
import StatsRow from '@/components/StatsRow'
import TrendingSection from '@/components/TrendingSection'
import TopProfessorsSection from '@/components/TopProfessorsSection'

function SectionSkeleton() {
  return <div className="h-40 animate-pulse bg-white rounded-lg border border-cream-border" />
}

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      <HeroSearch />
      <Suspense fallback={<div className="h-16 animate-pulse bg-white rounded-lg" />}>
        <StatsRow />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <TrendingSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <TopProfessorsSection />
      </Suspense>
    </div>
  )
}
```

- [ ] **Step 7: Build and verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add components/ app/page.tsx
git commit -m "feat: homepage trending classes and top professors"
```

---

## Task 8: Classes List Page

**Files:**
- Create: `app/classes/page.tsx`

- [ ] **Step 1: Create classes list page**

Create `app/classes/page.tsx`:

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StarDisplay from '@/components/StarDisplay'

interface PageProps {
  searchParams: { q?: string; category?: string; semester?: string }
}

export default async function ClassesPage({ searchParams }: PageProps) {
  const supabase = createClient()
  const query = searchParams.q ?? ''

  let classQuery = supabase
    .from('classes')
    .select('*, professor:professors(id, name, created_at)')
    .order('title')

  if (searchParams.category) classQuery = classQuery.eq('category', searchParams.category)
  if (searchParams.semester) classQuery = classQuery.eq('semester', searchParams.semester)

  const { data: classes } = await classQuery

  // Get review stats for all classes
  const { data: reviews } = await supabase
    .from('reviews')
    .select('class_id, overall_rating')

  const statsMap = new Map<string, { sum: number; count: number }>()
  for (const r of reviews ?? []) {
    const existing = statsMap.get(r.class_id) ?? { sum: 0, count: 0 }
    statsMap.set(r.class_id, { sum: existing.sum + r.overall_rating, count: existing.count + 1 })
  }

  const filtered = (classes ?? []).filter(cls =>
    query
      ? cls.title.toLowerCase().includes(query.toLowerCase()) ||
        cls.professor?.name?.toLowerCase().includes(query.toLowerCase())
      : true
  )

  const categories = [...new Set((classes ?? []).map(c => c.category).filter(Boolean))]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-900">All Classes</h1>
        <Link
          href="/classes/add"
          className="text-sm bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          + Add Class
        </Link>
      </div>

      {/* Search bar */}
      <form className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search classes or professors..."
          className="w-full border border-cream-border rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:border-primary"
        />
      </form>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <Link
            href="/classes"
            className={`text-xs px-3 py-1 rounded-full border ${!searchParams.category ? 'bg-primary text-white border-primary' : 'border-cream-border text-gray-500 bg-white'}`}
          >
            All
          </Link>
          {categories.map(cat => (
            <Link
              key={cat}
              href={`/classes?category=${encodeURIComponent(cat!)}`}
              className={`text-xs px-3 py-1 rounded-full border ${searchParams.category === cat ? 'bg-primary text-white border-primary' : 'border-cream-border text-gray-500 bg-white'}`}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No classes found.{' '}
          <Link href="/classes/add" className="text-primary font-semibold">
            Add one?
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(cls => {
            const stats = statsMap.get(cls.id)
            const avg = stats ? stats.sum / stats.count : null
            return (
              <Link key={cls.id} href={`/classes/${cls.id}`}>
                <div className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-center hover:border-primary transition-colors">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{cls.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {cls.professor?.name ?? 'Unknown'} · {cls.semester}
                    </div>
                    {cls.category && (
                      <span className="text-[10px] text-primary font-semibold uppercase tracking-wide">
                        {cls.category}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-0.5 ml-4 shrink-0">
                    {avg != null ? (
                      <>
                        <span className="text-sm font-bold text-primary">{avg.toFixed(1)}</span>
                        <StarDisplay rating={avg} />
                        <span className="text-[10px] text-gray-400">{stats!.count} reviews</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-300">No reviews yet</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Build and verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/classes/page.tsx
git commit -m "feat: classes list page with search and category filter"
```

---

## Task 9: Server Actions — Reviews & Votes

**Files:**
- Create: `actions/reviews.ts`
- Create: `actions/votes.ts`
- Create: `__tests__/actions/reviews.test.ts`
- Create: `__tests__/actions/votes.test.ts`

- [ ] **Step 1: Write failing tests for review validation**

Create `__tests__/actions/reviews.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { validateReviewInput } from '@/actions/reviews'

describe('validateReviewInput', () => {
  const valid = {
    class_id: 'abc-123',
    overall_rating: 4,
    workload_rating: 3,
    semester: 'Spring 2026',
    comment: 'Great class',
    tags: ['Engaging Lectures'],
  }

  it('accepts valid input', () => {
    expect(validateReviewInput(valid)).toBe(null)
  })

  it('rejects missing class_id', () => {
    expect(validateReviewInput({ ...valid, class_id: '' })).toMatch(/class/)
  })

  it('rejects overall_rating out of range', () => {
    expect(validateReviewInput({ ...valid, overall_rating: 6 })).toMatch(/rating/)
    expect(validateReviewInput({ ...valid, overall_rating: 0 })).toMatch(/rating/)
  })

  it('rejects workload_rating out of range', () => {
    expect(validateReviewInput({ ...valid, workload_rating: 0 })).toMatch(/workload/)
  })

  it('rejects missing semester', () => {
    expect(validateReviewInput({ ...valid, semester: '' })).toMatch(/semester/)
  })
})
```

Create `__tests__/actions/votes.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { generateVoterKey, isValidVoterKey } from '@/actions/votes'

describe('generateVoterKey', () => {
  it('returns a non-empty string', () => {
    const key = generateVoterKey()
    expect(typeof key).toBe('string')
    expect(key.length).toBeGreaterThan(0)
  })

  it('returns unique values', () => {
    const keys = new Set(Array.from({ length: 100 }, () => generateVoterKey()))
    expect(keys.size).toBe(100)
  })
})

describe('isValidVoterKey', () => {
  it('accepts a valid UUID-like key', () => {
    expect(isValidVoterKey('abc123-def456')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(isValidVoterKey('')).toBe(false)
  })

  it('rejects very long strings', () => {
    expect(isValidVoterKey('x'.repeat(200))).toBe(false)
  })
})
```

- [ ] **Step 2: Run to confirm they fail**

```bash
npx vitest run __tests__/actions/ 2>&1 | tail -10
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Create actions/reviews.ts**

Create `actions/reviews.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ReviewInput {
  class_id: string
  overall_rating: number
  workload_rating: number
  semester: string
  comment?: string
  tags?: string[]
}

export function validateReviewInput(input: ReviewInput): string | null {
  if (!input.class_id) return 'class is required'
  if (input.overall_rating < 1 || input.overall_rating > 5) return 'rating must be 1–5'
  if (input.workload_rating < 1 || input.workload_rating > 5) return 'workload must be 1–5'
  if (!input.semester) return 'semester is required'
  return null
}

export async function submitReview(input: ReviewInput): Promise<{ error: string | null }> {
  const error = validateReviewInput(input)
  if (error) return { error }

  const supabase = createClient()
  const { error: dbError } = await supabase.from('reviews').insert({
    class_id: input.class_id,
    overall_rating: input.overall_rating,
    workload_rating: input.workload_rating,
    semester: input.semester,
    comment: input.comment ?? null,
    tags: input.tags ?? [],
  })

  if (dbError) return { error: dbError.message }

  revalidatePath(`/classes/${input.class_id}`)
  return { error: null }
}

export async function deleteReview(reviewId: string): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { error: null }
}
```

- [ ] **Step 4: Create actions/votes.ts**

Create `actions/votes.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export function generateVoterKey(): string {
  return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function isValidVoterKey(key: string): boolean {
  return typeof key === 'string' && key.length > 0 && key.length <= 128
}

export async function upvoteReview(
  reviewId: string,
  voterKey: string,
  classId: string
): Promise<{ error: string | null; alreadyVoted?: boolean }> {
  if (!isValidVoterKey(voterKey)) return { error: 'invalid voter key' }

  const supabase = createClient()

  // Check for duplicate vote
  const { data: existing } = await supabase
    .from('review_votes')
    .select('id')
    .eq('review_id', reviewId)
    .eq('voter_key', voterKey)
    .maybeSingle()

  if (existing) return { error: null, alreadyVoted: true }

  // Insert vote
  const { error: voteError } = await supabase
    .from('review_votes')
    .insert({ review_id: reviewId, voter_key: voterKey })

  if (voteError) return { error: voteError.message }

  // Increment helpful_count
  const { error: updateError } = await supabase.rpc('increment_helpful_count', {
    review_id: reviewId,
  })

  if (updateError) {
    // Fallback: manual increment
    const { data: review } = await supabase
      .from('reviews')
      .select('helpful_count')
      .eq('id', reviewId)
      .single()
    if (review) {
      await supabase
        .from('reviews')
        .update({ helpful_count: review.helpful_count + 1 })
        .eq('id', reviewId)
    }
  }

  revalidatePath(`/classes/${classId}`)
  return { error: null }
}
```

- [ ] **Step 5: Add the Supabase RPC function**

In the Supabase SQL Editor, run:

```sql
create or replace function increment_helpful_count(review_id uuid)
returns void
language sql
as $$
  update reviews set helpful_count = helpful_count + 1 where id = review_id;
$$;
```

- [ ] **Step 6: Run tests and confirm they pass**

```bash
npx vitest run __tests__/actions/ 2>&1 | tail -10
```

Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add actions/ __tests__/actions/
git commit -m "feat: review submit and upvote server actions with validation"
```

---

## Task 10: Class Detail Page

**Files:**
- Create: `components/RatingSummary.tsx`
- Create: `components/TagBadge.tsx`
- Create: `components/ReviewCard.tsx`
- Create: `components/ReviewList.tsx`
- Create: `components/ReviewModal.tsx`
- Create: `app/classes/[id]/page.tsx`

- [ ] **Step 1: Create RatingSummary**

Create `components/RatingSummary.tsx`:

```tsx
import StarDisplay from '@/components/StarDisplay'

interface Props {
  avgOverall: number
  avgWorkload: number
  reviewCount: number
}

export default function RatingSummary({ avgOverall, avgWorkload, reviewCount }: Props) {
  const overallPct = (avgOverall / 5) * 100
  const workloadPct = (avgWorkload / 5) * 100

  return (
    <div className="bg-white border border-cream-border rounded-xl p-4 flex items-center gap-5">
      <div className="text-center shrink-0">
        <div className="text-4xl font-extrabold text-primary leading-none">
          {avgOverall.toFixed(1)}
        </div>
        <StarDisplay rating={avgOverall} size="md" />
        <div className="text-[10px] text-gray-400 mt-1">{reviewCount} reviews</div>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Overall</span>
            <span className="font-semibold text-primary">{avgOverall.toFixed(1)}</span>
          </div>
          <div className="bg-cream-border rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Workload</span>
            <span className="font-semibold text-primary">{avgWorkload.toFixed(1)}</span>
          </div>
          <div className="bg-cream-border rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${workloadPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create TagBadge**

Create `components/TagBadge.tsx`:

```tsx
export default function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="bg-cream-hover border border-cream-border text-primary text-[10px] font-medium px-2.5 py-1 rounded-full">
      {tag}
    </span>
  )
}
```

- [ ] **Step 3: Create ReviewCard (client — needs upvote button)**

Create `components/ReviewCard.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { upvoteReview } from '@/actions/votes'
import { generateVoterKey } from '@/actions/votes'
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
}

export default function ReviewCard({ review, classId, highlighted = false }: Props) {
  const [count, setCount] = useState(review.helpful_count)
  const [voted, setVoted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const key = getOrCreateVoterKey()
    const votedKey = `voted_${review.id}`
    if (localStorage.getItem(votedKey)) setVoted(true)
  }, [review.id])

  async function handleUpvote() {
    if (voted || loading) return
    setLoading(true)
    const voterKey = getOrCreateVoterKey()
    const { alreadyVoted } = await upvoteReview(review.id, voterKey, classId)
    if (!alreadyVoted) {
      setCount(c => c + 1)
      localStorage.setItem(`voted_${review.id}`, '1')
      setVoted(true)
    } else {
      setVoted(true)
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

      {review.comment && (
        <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        <TagBadge tag={`Workload: ${workloadToLabel(review.workload_rating)}`} />
        {review.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
      </div>

      <div>
        <button
          onClick={handleUpvote}
          disabled={voted || loading}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            voted
              ? 'bg-cream-hover border-primary text-primary font-semibold'
              : 'bg-cream border-cream-border text-gray-500 hover:border-primary hover:text-primary'
          }`}
        >
          👍 Helpful ({count})
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create ReviewList (client — handles sort)**

Create `components/ReviewList.tsx`:

```tsx
'use client'

import { useState } from 'react'
import ReviewCard from '@/components/ReviewCard'
import type { Review } from '@/lib/types'

interface Props {
  reviews: Review[]
  classId: string
}

export default function ReviewList({ reviews, classId }: Props) {
  const [sort, setSort] = useState<'recent' | 'helpful'>('recent')

  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'helpful') return b.helpful_count - a.helpful_count
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xs font-bold text-primary uppercase tracking-widest">
          All Reviews
        </h2>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as 'recent' | 'helpful')}
          className="text-xs border border-cream-border rounded-lg px-2 py-1.5 bg-white text-gray-600 outline-none"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>
      <div className="flex flex-col gap-3">
        {sorted.map(r => (
          <ReviewCard key={r.id} review={r} classId={classId} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create ReviewModal**

Create `components/ReviewModal.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { submitReview } from '@/actions/reviews'
import { TAGS, WORKLOAD_LABELS, SEMESTERS } from '@/lib/constants'

interface Props {
  classId: string
  className: string
  professorName: string
}

export default function ReviewModal({ classId, className, professorName }: Props) {
  const [open, setOpen] = useState(false)
  const [overall, setOverall] = useState(0)
  const [workload, setWorkload] = useState(0)
  const [semester, setSemester] = useState(SEMESTERS[0])
  const [comment, setComment] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  async function handleSubmit() {
    if (overall === 0 || workload === 0) {
      setError('Please select an overall rating and workload.')
      return
    }
    setSubmitting(true)
    setError(null)
    const { error: err } = await submitReview({
      class_id: classId,
      overall_rating: overall,
      workload_rating: workload,
      semester,
      comment: comment || undefined,
      tags: selectedTags,
    })
    setSubmitting(false)
    if (err) {
      setError(err)
    } else {
      setSuccess(true)
      setTimeout(() => { setOpen(false); setSuccess(false) }, 1500)
    }
  }

  return (
    <>
      {/* CTA trigger */}
      <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-5 text-center text-white">
        <div className="font-bold text-sm mb-1">Taken this class?</div>
        <div className="text-xs opacity-90 mb-3">Your anonymous review helps future students.</div>
        <button
          onClick={() => setOpen(true)}
          className="bg-white text-primary font-bold text-sm px-5 py-2.5 rounded-lg w-full hover:bg-cream transition-colors"
        >
          + Write a Review
        </button>
      </div>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-primary text-white px-5 py-4 flex justify-between items-start rounded-t-2xl">
              <div>
                <div className="font-bold">Write a Review</div>
                <div className="text-xs opacity-85 mt-0.5">{className} · {professorName}</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-xl leading-none">✕</button>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {success ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">🎉</div>
                  <div className="font-bold text-gray-800">Review submitted!</div>
                  <div className="text-sm text-gray-500 mt-1">Thank you for helping your peers.</div>
                </div>
              ) : (
                <>
                  {/* Semester */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                      When did you take this?
                    </label>
                    <select
                      value={semester}
                      onChange={e => setSemester(e.target.value)}
                      className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
                    >
                      {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Overall rating */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                      Overall Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => setOverall(n)}
                          className={`flex-1 py-2.5 rounded-lg border text-center transition-colors ${
                            overall === n
                              ? 'border-primary bg-cream-hover text-primary font-bold'
                              : 'border-cream-border bg-cream text-gray-400'
                          }`}
                        >
                          <div className="text-sm">{'★'.repeat(n)}</div>
                          <div className="text-[10px] mt-0.5">{n}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Workload */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                      Workload
                    </label>
                    <div className="flex gap-1.5">
                      {([1, 2, 3, 4, 5] as const).map(n => (
                        <button
                          key={n}
                          onClick={() => setWorkload(n)}
                          className={`flex-1 py-2 rounded-lg border text-[10px] transition-colors leading-tight ${
                            workload === n
                              ? 'border-primary bg-cream-hover text-primary font-bold'
                              : 'border-cream-border bg-cream text-gray-400'
                          }`}
                        >
                          {WORKLOAD_LABELS[n]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-3">
                      Tags <span className="font-normal normal-case text-gray-400">(pick all that apply)</span>
                    </label>
                    <div className="flex flex-col gap-3">
                      {TAGS.map(group => (
                        <div key={group.group}>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">{group.group}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {group.tags.map(tag => (
                              <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
                                  selectedTags.includes(tag)
                                    ? 'bg-cream-hover border-primary text-primary font-semibold'
                                    : 'bg-white border-cream-border text-gray-500'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                      Your Review <span className="font-normal normal-case text-gray-400">(anonymous)</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your honest experience..."
                      rows={3}
                      className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary resize-none"
                    />
                  </div>

                  {error && <div className="text-red-500 text-xs">{error}</div>}

                  {/* Anonymous reminder + submit */}
                  <div className="flex items-center gap-2 bg-cream-hover rounded-lg px-3 py-2.5">
                    <span>🔒</span>
                    <span className="text-xs text-gray-500">Your review is completely anonymous. No account needed.</span>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-primary text-white font-bold text-sm py-3 rounded-lg w-full hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 6: Create the class detail page**

Create `app/classes/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatTime } from '@/lib/utils'
import RatingSummary from '@/components/RatingSummary'
import ReviewCard from '@/components/ReviewCard'
import ReviewList from '@/components/ReviewList'
import ReviewModal from '@/components/ReviewModal'
import type { Review } from '@/lib/types'

export default async function ClassDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: cls } = await supabase
    .from('classes')
    .select('*, professor:professors(id, name, created_at)')
    .eq('id', params.id)
    .single()

  if (!cls) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('class_id', params.id)
    .order('created_at', { ascending: false })

  const allReviews: Review[] = reviews ?? []
  const avgOverall = allReviews.length
    ? allReviews.reduce((s, r) => s + r.overall_rating, 0) / allReviews.length
    : 0
  const avgWorkload = allReviews.length
    ? allReviews.reduce((s, r) => s + r.workload_rating, 0) / allReviews.length
    : 0

  const topReview = allReviews.length
    ? [...allReviews].sort((a, b) => b.helpful_count - a.helpful_count)[0]
    : null

  const timeLabel =
    cls.start_time && cls.end_time
      ? `${formatTime(cls.start_time)}–${formatTime(cls.end_time)}`
      : null

  const professor = cls.professor as { id: string; name: string } | null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        {cls.category && (
          <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
            {cls.category}
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{cls.title}</h1>
        <div className="text-sm text-gray-400 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          {professor && (
            <Link href={`/professors/${professor.id}`} className="text-primary font-semibold hover:underline">
              {professor.name}
            </Link>
          )}
          <span>{cls.semester}</span>
          {cls.meeting_days?.length > 0 && <span>{cls.meeting_days.join('/')}</span>}
          {timeLabel && <span>{timeLabel}</span>}
        </div>
      </div>

      {/* Rating summary */}
      {allReviews.length > 0 && (
        <RatingSummary
          avgOverall={avgOverall}
          avgWorkload={avgWorkload}
          reviewCount={allReviews.length}
        />
      )}

      {/* Most helpful review */}
      {topReview && (
        <div>
          <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
            🏅 Most Helpful Review
          </h2>
          <ReviewCard review={topReview} classId={cls.id} highlighted />
        </div>
      )}

      {/* All reviews */}
      {allReviews.length > 1 && (
        <ReviewList reviews={allReviews} classId={cls.id} />
      )}

      {allReviews.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No reviews yet — be the first!
        </div>
      )}

      {/* Write review CTA */}
      <ReviewModal
        classId={cls.id}
        className={cls.title}
        professorName={professor?.name ?? 'Unknown professor'}
      />
    </div>
  )
}
```

- [ ] **Step 7: Build and verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add components/ app/classes/
git commit -m "feat: class detail page with ratings, reviews, and review modal"
```

---

## Task 11: Professor Detail Page

**Files:**
- Create: `app/professors/page.tsx`
- Create: `app/professors/[id]/page.tsx`

- [ ] **Step 1: Create professors list page**

Create `app/professors/page.tsx`:

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StarDisplay from '@/components/StarDisplay'

export default async function ProfessorsPage() {
  const supabase = createClient()

  const { data: professors } = await supabase.from('professors').select('*').order('name')
  const { data: reviews } = await supabase
    .from('reviews')
    .select('overall_rating, class:classes(professor_id)')

  const statsMap = new Map<string, { sum: number; count: number }>()
  for (const r of reviews ?? []) {
    const profId = (r.class as { professor_id: string | null })?.professor_id
    if (!profId) continue
    const existing = statsMap.get(profId) ?? { sum: 0, count: 0 }
    statsMap.set(profId, { sum: existing.sum + r.overall_rating, count: existing.count + 1 })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-900">All Professors</h1>
        <Link
          href="/professors/add"
          className="text-sm bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          + Add Professor
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {(professors ?? []).map(prof => {
          const stats = statsMap.get(prof.id)
          const avg = stats ? stats.sum / stats.count : null
          return (
            <Link key={prof.id} href={`/professors/${prof.id}`}>
              <div className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-center hover:border-primary transition-colors">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{prof.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {stats ? `${stats.count} reviews` : 'No reviews yet'}
                  </div>
                </div>
                {avg != null && (
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-sm font-bold text-primary">{avg.toFixed(1)}</span>
                    <StarDisplay rating={avg} />
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create professor detail page**

Create `app/professors/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReviewList from '@/components/ReviewList'
import ClassCard from '@/components/ClassCard'
import type { ClassWithStats, Review } from '@/lib/types'

export default async function ProfessorDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: professor } = await supabase
    .from('professors')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!professor) notFound()

  const { data: classes } = await supabase
    .from('classes')
    .select('*, professor:professors(id, name, created_at)')
    .eq('professor_id', params.id)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .in('class_id', (classes ?? []).map(c => c.id))
    .order('created_at', { ascending: false })

  const allReviews: Review[] = reviews ?? []

  // Per-class stats
  const statsMap = new Map<string, { sum: number; count: number }>()
  for (const r of allReviews) {
    const existing = statsMap.get(r.class_id) ?? { sum: 0, count: 0 }
    statsMap.set(r.class_id, { sum: existing.sum + r.overall_rating, count: existing.count + 1 })
  }

  const classesWithStats: ClassWithStats[] = (classes ?? []).map(cls => {
    const stats = statsMap.get(cls.id) ?? { sum: 0, count: 0 }
    return {
      ...cls,
      avg_overall: stats.count > 0 ? stats.sum / stats.count : 0,
      review_count: stats.count,
    }
  })

  const avgOverall = allReviews.length
    ? allReviews.reduce((s, r) => s + r.overall_rating, 0) / allReviews.length
    : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white border border-cream-border rounded-xl p-5">
        <h1 className="text-2xl font-bold text-gray-900">{professor.name}</h1>
        <div className="flex gap-4 mt-2 text-sm text-gray-500">
          {allReviews.length > 0 && (
            <>
              <span className="text-primary font-bold text-lg">{avgOverall.toFixed(1)} ★</span>
              <span>{allReviews.length} total reviews</span>
            </>
          )}
        </div>
      </div>

      {/* Classes taught */}
      {classesWithStats.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
            Classes
          </h2>
          <div className="flex flex-col gap-2">
            {classesWithStats.map(cls => <ClassCard key={cls.id} cls={cls} />)}
          </div>
        </div>
      )}

      {/* All reviews */}
      {allReviews.length > 0 && (
        <ReviewList reviews={allReviews} classId="" />
      )}

      {allReviews.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">No reviews yet.</div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/professors/
git commit -m "feat: professors list and detail pages"
```

---

## Task 12: Schedule Page

**Files:**
- Create: `components/ScheduleCalendar.tsx`
- Create: `app/schedule/page.tsx`

- [ ] **Step 1: Create ScheduleCalendar (client)**

Create `components/ScheduleCalendar.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { DAYS } from '@/lib/constants'
import { formatTime } from '@/lib/utils'
import type { Class } from '@/lib/types'

const HOUR_START = 8   // 8am
const HOUR_END = 21    // 9pm
const TOTAL_HOURS = HOUR_END - HOUR_START
const SLOT_HEIGHT = 60 // px per hour

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTop(minutes: number): number {
  const offsetMinutes = minutes - HOUR_START * 60
  return (offsetMinutes / 60) * SLOT_HEIGHT
}

function minutesToHeight(startMinutes: number, endMinutes: number): number {
  return ((endMinutes - startMinutes) / 60) * SLOT_HEIGHT
}

const COLORS = [
  'bg-primary/80',
  'bg-orange-400',
  'bg-amber-500',
  'bg-orange-600',
  'bg-yellow-500',
]

export default function ScheduleCalendar({ classes }: { classes: Class[] }) {
  const router = useRouter()

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Day headers */}
        <div className="grid grid-cols-[48px_1fr_1fr_1fr_1fr_1fr] border-b border-cream-border">
          <div />
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-500 py-2 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="relative grid grid-cols-[48px_1fr_1fr_1fr_1fr_1fr]">
          {/* Hour labels */}
          <div className="flex flex-col">
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

          {/* Day columns */}
          {DAYS.map((day, dayIdx) => {
            const dayClasses = classes.filter(c => c.meeting_days?.includes(day))
            return (
              <div
                key={day}
                className="relative border-l border-cream-border"
                style={{ height: TOTAL_HOURS * SLOT_HEIGHT }}
              >
                {/* Hour lines */}
                {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                  <div
                    key={i}
                    style={{ top: i * SLOT_HEIGHT }}
                    className="absolute w-full border-t border-cream-border/60"
                  />
                ))}

                {/* Class blocks */}
                {dayClasses.map((cls, idx) => {
                  if (!cls.start_time || !cls.end_time) return null
                  const startMin = timeToMinutes(cls.start_time)
                  const endMin = timeToMinutes(cls.end_time)
                  const top = minutesToTop(startMin)
                  const height = minutesToHeight(startMin, endMin)

                  return (
                    <button
                      key={cls.id}
                      onClick={() => router.push(`/classes/${cls.id}`)}
                      style={{ top, height, left: 2, right: 2 }}
                      className={`absolute ${COLORS[idx % COLORS.length]} text-white text-[10px] rounded-md px-1.5 py-1 overflow-hidden text-left hover:opacity-90 transition-opacity`}
                    >
                      <div className="font-semibold leading-tight truncate">{cls.title}</div>
                      <div className="opacity-80 text-[9px] mt-0.5">
                        {formatTime(cls.start_time)}–{formatTime(cls.end_time)}
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create schedule page**

Create `app/schedule/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { CURRENT_SEMESTER, SEMESTERS } from '@/lib/constants'
import ScheduleCalendar from '@/components/ScheduleCalendar'
import Link from 'next/link'

interface PageProps {
  searchParams: { semester?: string }
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const semester = searchParams.semester ?? CURRENT_SEMESTER
  const supabase = createClient()

  const { data: classes } = await supabase
    .from('classes')
    .select('*, professor:professors(id, name, created_at)')
    .eq('semester', semester)
    .not('start_time', 'is', null)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
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
        <ScheduleCalendar classes={classes ?? []} />
      </div>

      {(!classes || classes.length === 0) && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No classes with scheduled times for {semester}.
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/ScheduleCalendar.tsx app/schedule/
git commit -m "feat: 5-day schedule calendar page"
```

---

## Task 13: Add Class + Add Professor Pages

**Files:**
- Create: `actions/classes.ts`
- Create: `actions/professors.ts`
- Create: `app/classes/add/page.tsx`
- Create: `app/professors/add/page.tsx`

- [ ] **Step 1: Create class and professor server actions**

Create `actions/classes.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ClassInput {
  title: string
  category?: string
  professor_id?: string
  meeting_days: string[]
  start_time?: string
  end_time?: string
  semester: string
}

export async function addClass(input: ClassInput): Promise<{ error: string | null; id?: string }> {
  if (!input.title.trim()) return { error: 'Title is required' }
  if (!input.semester) return { error: 'Semester is required' }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('classes')
    .insert({
      title: input.title.trim(),
      category: input.category?.trim() || null,
      professor_id: input.professor_id || null,
      meeting_days: input.meeting_days,
      start_time: input.start_time || null,
      end_time: input.end_time || null,
      semester: input.semester,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/classes')
  return { error: null, id: data.id }
}

export async function deleteClass(classId: string): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from('classes').delete().eq('id', classId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { error: null }
}
```

Create `actions/professors.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addProfessor(name: string): Promise<{ error: string | null; id?: string }> {
  if (!name.trim()) return { error: 'Name is required' }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('professors')
    .insert({ name: name.trim() })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/professors')
  return { error: null, id: data.id }
}

export async function deleteProfessor(professorId: string): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from('professors').delete().eq('id', professorId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { error: null }
}
```

- [ ] **Step 2: Create Add Class page**

Create `app/classes/add/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { addClass } from '@/actions/classes'
import { addProfessor } from '@/actions/professors'
import { DAYS, SEMESTERS, CURRENT_SEMESTER } from '@/lib/constants'

export default function AddClassPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; semester: string }[]>([])
  const [searched, setSearched] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [semester, setSemester] = useState(CURRENT_SEMESTER)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [profSearch, setProfSearch] = useState('')
  const [profResults, setProfResults] = useState<{ id: string; name: string }[]>([])
  const [selectedProfId, setSelectedProfId] = useState('')
  const [selectedProfName, setSelectedProfName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSearch() {
    if (!searchQuery.trim()) return
    const { data } = await supabase
      .from('classes')
      .select('id, title, semester')
      .ilike('title', `%${searchQuery}%`)
      .limit(5)
    setSearchResults(data ?? [])
    setSearched(true)
  }

  async function handleProfSearch(q: string) {
    setProfSearch(q)
    setSelectedProfId('')
    setSelectedProfName('')
    if (!q.trim()) { setProfResults([]); return }
    const { data } = await supabase
      .from('professors')
      .select('id, name')
      .ilike('name', `%${q}%`)
      .limit(5)
    setProfResults(data ?? [])
  }

  function toggleDay(day: string) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  async function handleSubmit() {
    setError(null)
    let profId = selectedProfId

    // Create professor if typed but not selected from list
    if (profSearch.trim() && !selectedProfId) {
      const { id, error: profError } = await addProfessor(profSearch.trim())
      if (profError) { setError(profError); return }
      profId = id!
    }

    setSubmitting(true)
    const { error: err, id } = await addClass({
      title: title || searchQuery,
      category,
      professor_id: profId,
      meeting_days: selectedDays,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
      semester,
    })
    setSubmitting(false)

    if (err) { setError(err); return }
    router.push(`/classes/${id}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/classes" className="text-primary text-sm">← Back</Link>
        <h1 className="text-lg font-bold text-gray-900">Add a Class</h1>
      </div>

      {!showForm ? (
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-cream-border rounded-xl p-5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
              First, search to make sure it doesn't already exist
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search class name..."
                className="flex-1 border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
              />
              <button
                onClick={handleSearch}
                className="bg-primary text-white text-sm px-4 py-2.5 rounded-lg font-semibold"
              >
                Search
              </button>
            </div>
          </div>

          {searched && (
            <div className="flex flex-col gap-2">
              {searchResults.length > 0 ? (
                <>
                  <p className="text-sm text-gray-500">Found these existing classes:</p>
                  {searchResults.map(r => (
                    <Link key={r.id} href={`/classes/${r.id}`}>
                      <div className="bg-white border border-cream-border rounded-lg px-4 py-3 hover:border-primary transition-colors">
                        <div className="text-sm font-semibold">{r.title}</div>
                        <div className="text-xs text-gray-400">{r.semester}</div>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={() => { setTitle(searchQuery); setShowForm(true) }}
                    className="text-sm text-primary font-semibold text-center py-2"
                  >
                    None of these match — add as new class →
                  </button>
                </>
              ) : (
                <div className="bg-white border border-cream-border rounded-xl p-5 text-center">
                  <p className="text-sm text-gray-500 mb-3">No existing class found for "{searchQuery}"</p>
                  <button
                    onClick={() => { setTitle(searchQuery); setShowForm(true) }}
                    className="bg-primary text-white text-sm px-5 py-2.5 rounded-lg font-semibold"
                  >
                    Add it now →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-cream-border rounded-xl p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Class Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Category</label>
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Talmud & Rabbinics"
              className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Semester</label>
            <select
              value={semester}
              onChange={e => setSemester(e.target.value)}
              className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none"
            >
              {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Professor</label>
            <input
              value={profSearch}
              onChange={e => handleProfSearch(e.target.value)}
              placeholder="Search or type new professor name..."
              className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
            />
            {profResults.length > 0 && !selectedProfId && (
              <div className="mt-1 border border-cream-border rounded-lg overflow-hidden bg-white">
                {profResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProfId(p.id); setSelectedProfName(p.name); setProfSearch(p.name); setProfResults([]) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-cream border-b border-cream-border last:border-0"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
            {selectedProfName && (
              <div className="text-xs text-primary mt-1">✓ {selectedProfName} selected</div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Meeting Days</label>
            <div className="flex gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                    selectedDays.includes(day)
                      ? 'bg-primary text-white border-primary'
                      : 'border-cream-border text-gray-500 bg-cream'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-xs">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary text-white font-bold text-sm py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Adding...' : 'Add Class'}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create Add Professor page**

Create `app/professors/add/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { addProfessor } from '@/actions/professors'

export default function AddProfessorPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; name: string }[]>([])
  const [searched, setSearched] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSearch() {
    if (!searchQuery.trim()) return
    const { data } = await supabase
      .from('professors')
      .select('id, name')
      .ilike('name', `%${searchQuery}%`)
      .limit(5)
    setSearchResults(data ?? [])
    setSearched(true)
  }

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    const { error: err, id } = await addProfessor(name || searchQuery)
    setSubmitting(false)
    if (err) { setError(err); return }
    router.push(`/professors/${id}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/professors" className="text-primary text-sm">← Back</Link>
        <h1 className="text-lg font-bold text-gray-900">Add a Professor</h1>
      </div>

      {!showForm ? (
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-cream-border rounded-xl p-5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
              Search first to avoid duplicates
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Professor name..."
                className="flex-1 border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
              />
              <button onClick={handleSearch} className="bg-primary text-white text-sm px-4 py-2.5 rounded-lg font-semibold">
                Search
              </button>
            </div>
          </div>

          {searched && (
            <div className="flex flex-col gap-2">
              {searchResults.length > 0 ? (
                <>
                  <p className="text-sm text-gray-500">Found these existing professors:</p>
                  {searchResults.map(p => (
                    <Link key={p.id} href={`/professors/${p.id}`}>
                      <div className="bg-white border border-cream-border rounded-lg px-4 py-3 hover:border-primary transition-colors text-sm font-semibold">
                        {p.name}
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={() => { setName(searchQuery); setShowForm(true) }}
                    className="text-sm text-primary font-semibold text-center py-2"
                  >
                    None of these match — add as new →
                  </button>
                </>
              ) : (
                <div className="bg-white border border-cream-border rounded-xl p-5 text-center">
                  <p className="text-sm text-gray-500 mb-3">No professor found for "{searchQuery}"</p>
                  <button
                    onClick={() => { setName(searchQuery); setShowForm(true) }}
                    className="bg-primary text-white text-sm px-5 py-2.5 rounded-lg font-semibold"
                  >
                    Add them now →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-cream-border rounded-xl p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Professor Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
            />
          </div>
          {error && <div className="text-red-500 text-xs">{error}</div>}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-primary text-white font-bold text-sm py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Adding...' : 'Add Professor'}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add actions/ app/classes/add/ app/professors/add/
git commit -m "feat: add class and add professor pages with duplicate search"
```

---

## Task 14: Admin Page

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create admin page**

Create `app/admin/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { deleteReview } from '@/actions/reviews'
import { deleteClass } from '@/actions/classes'
import { deleteProfessor } from '@/actions/professors'

const ADMIN_USERNAME = 'ben'

export default function AdminPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')

  const [reviews, setReviews] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [professors, setProfessors] = useState<any[]>([])
  const [tab, setTab] = useState<'reviews' | 'classes' | 'professors'>('reviews')

  function handleLogin() {
    if (
      username === ADMIN_USERNAME &&
      password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'admin')
    ) {
      setAuthed(true)
    } else {
      setAuthError('Incorrect credentials.')
    }
  }

  useEffect(() => {
    if (!authed) return
    const supabase = createClient()
    supabase.from('reviews').select('*, class:classes(title)').order('created_at', { ascending: false }).then(({ data }) => setReviews(data ?? []))
    supabase.from('classes').select('*, professor:professors(name)').order('title').then(({ data }) => setClasses(data ?? []))
    supabase.from('professors').select('*').order('name').then(({ data }) => setProfessors(data ?? []))
  }, [authed])

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16">
        <div className="bg-white border border-cream-border rounded-xl p-6 flex flex-col gap-4">
          <h1 className="text-lg font-bold text-gray-900">Admin Login</h1>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            className="border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Password"
            className="border border-cream-border rounded-lg px-3 py-2.5 text-sm bg-cream outline-none focus:border-primary"
          />
          {authError && <div className="text-red-500 text-xs">{authError}</div>}
          <button
            onClick={handleLogin}
            className="bg-primary text-white font-bold text-sm py-3 rounded-lg"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-lg font-bold text-gray-900 mb-4">Admin Panel</h1>

      <div className="flex gap-2 mb-4">
        {(['reviews', 'classes', 'professors'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 rounded-lg font-semibold capitalize transition-colors ${
              tab === t ? 'bg-primary text-white' : 'bg-white border border-cream-border text-gray-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'reviews' && (
        <div className="flex flex-col gap-2">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-primary font-semibold">{r.class?.title ?? 'Unknown class'}</div>
                <div className="text-sm text-gray-700 mt-0.5 truncate">{r.comment ?? '(no comment)'}</div>
                <div className="text-xs text-gray-400 mt-0.5">⭐ {r.overall_rating} · {r.semester}</div>
              </div>
              <button
                onClick={async () => {
                  await deleteReview(r.id)
                  setReviews(prev => prev.filter(x => x.id !== r.id))
                }}
                className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'classes' && (
        <div className="flex flex-col gap-2">
          {classes.map(c => (
            <div key={c.id} className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-center gap-3">
              <div>
                <div className="text-sm font-semibold">{c.title}</div>
                <div className="text-xs text-gray-400">{c.professor?.name ?? 'No professor'} · {c.semester}</div>
              </div>
              <button
                onClick={async () => {
                  await deleteClass(c.id)
                  setClasses(prev => prev.filter(x => x.id !== c.id))
                }}
                className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'professors' && (
        <div className="flex flex-col gap-2">
          {professors.map(p => (
            <div key={p.id} className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-center gap-3">
              <div className="text-sm font-semibold">{p.name}</div>
              <button
                onClick={async () => {
                  await deleteProfessor(p.id)
                  setProfessors(prev => prev.filter(x => x.id !== p.id))
                }}
                className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add NEXT_PUBLIC_ADMIN_PASSWORD to .env.local.example**

Edit `.env.local.example` — add:

```
NEXT_PUBLIC_ADMIN_PASSWORD=admin
```

And add the same line to your actual `.env.local`.

- [ ] **Step 3: Build and verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/admin/ .env.local.example
git commit -m "feat: admin panel with password gate and delete controls"
```

---

## Task 15: Run All Tests + Deploy to Vercel

**Files:** None new

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run 2>&1 | tail -20
```

Expected: All tests PASS.

- [ ] **Step 2: Final production build**

```bash
npm run build 2>&1 | tail -10
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Deploy to Vercel**

```bash
npx vercel --prod
```

When prompted:
- Link to existing project or create new: **Create new**
- Project name: `listed-jts`
- Framework: **Next.js** (auto-detected)
- Root directory: `.`

After deploy completes, you'll get a URL like `https://listed-jts.vercel.app`.

- [ ] **Step 4: Add environment variables in Vercel dashboard**

Go to your Vercel project → Settings → Environment Variables. Add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ADMIN_PASSWORD`

Then redeploy:
```bash
npx vercel --prod
```

- [ ] **Step 5: Seed initial data**

In Supabase SQL Editor, run your initial class list SQL. Format:

```sql
-- Insert professors first
insert into professors (name) values
  ('Rabbi Schwartz'),
  ('Dr. Cohen'),
  ('Prof. Levy');

-- Then insert classes (replace professor UUIDs with actual IDs from above)
-- Run: select id, name from professors; to get IDs first
insert into classes (title, category, professor_id, meeting_days, start_time, end_time, semester) values
  ('Introduction to Talmud', 'Talmud & Rabbinics', '<rabbi-schwartz-uuid>', ARRAY['Mon','Wed'], '10:00', '11:30', 'Spring 2026');
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final build verification and deployment notes"
```

---

## Summary

| Task | What it builds |
|---|---|
| 1 | Next.js + Tailwind + Vitest scaffold |
| 2 | Supabase schema + RLS policies |
| 3 | Types, constants, utilities + tests |
| 4 | Supabase browser/server clients |
| 5 | NavBar + root layout |
| 6 | Homepage hero search + stats row |
| 7 | Homepage trending + top professors |
| 8 | Classes list page |
| 9 | Review/vote server actions + tests |
| 10 | Class detail page + review modal |
| 11 | Professor list + detail pages |
| 12 | 5-day schedule calendar |
| 13 | Add class + add professor pages |
| 14 | Admin panel |
| 15 | Tests + Vercel deploy |
