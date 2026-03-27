# LISTED — Design Spec
**Date:** 2026-03-26
**Product:** JTS List College course & professor review site
**Tagline:** Anonymous reviews from your peers.

---

## Overview

LISTED is a web app for students at JTS List College to anonymously browse and review classes and professors. Inspired by Columbia's CULPA, tailored for JTS's Judaics curriculum. Students can search classes, read and upvote reviews, see trending classes and top professors, and visualize the weekly schedule.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ App Router |
| Language | TypeScript |
| Database | Supabase (Postgres) |
| Data fetching | Supabase client in Server Components |
| Mutations | Next.js Server Actions |
| Styling | Tailwind CSS |
| Deployment | Vercel |

**Pattern:** Server Components fetch directly from Supabase. Server Actions handle all writes (submit review, add class, add professor, upvote). No separate API layer.

---

## Design System

- **Primary:** `#e8650a` (orange)
- **Background:** `#fff8f2` (cream)
- **Surface:** `#ffffff` (white)
- **Border:** `#f0ddd0` (light orange-cream)
- **Text:** `#1a1a1a` / `#888` (muted)
- **Font:** System UI / Inter
- **Tone:** Clean, airy, generous whitespace. Mobile-first.

---

## Pages

### 1. Homepage (`/`)
- Orange nav bar: `LISTED` logo + Classes / Professors / Schedule links
- **Hero:** Full-width gradient search bar ("Find your next class")
- **Stats row:** Reviews · Classes · Professors (live counts)
- **Trending This Semester:** Top 5 classes by avg rating in current semester
- **Top Professors:** Top 5 professors by avg overall rating
- Both leaderboard sections link to their respective detail pages

### 2. Classes List (`/classes`)
- Search + filter by category/professor/semester
- Card grid: class title, professor name, avg rating, review count
- "+ Add a Class" button opens inline search-first flow (search before creating to prevent duplicates)

### 3. Class Detail (`/classes/[id]`)
- Header: category tag, class title, professor (linked), meeting days/time, semester
- **Rating summary:** Large overall score + star display + workload bar (both 1–5)
- **Most Helpful Review:** Pinned, orange-bordered card — the review with the most upvotes
- **All Reviews:** Sortable (Most Recent / Most Helpful). Each review shows: star rating, semester, workload label, tags, comment text, upvote button
- **Write a Review CTA:** Orange gradient card at bottom → opens review modal

### 4. Review Modal (overlay on class detail)
- Fields:
  - Semester selector (dropdown)
  - Overall rating: 1–5 tap-to-select star boxes
  - Workload: 5-step label buttons (Very Light → Very Heavy)
  - Tags (multi-select, grouped):
    - *Professor Style:* Harsh Grader, Easy Grader, Engaging Lectures, Dry Lectures, Very Accessible, Hard to Reach
    - *Time Commitment:* <2 hrs/wk, 2–5, 5–10, 10–20, 20+ hrs/wk
    - *Class Vibe:* Attendance Required, Skip-Friendly, Lots of Discussion, Mostly Lecture, Would Retake
  - Comment text area (anonymous, optional)
- Anonymous lock-icon reminder before submit
- No auth required — anyone can submit

### 5. Professor Detail (`/professors/[id]`)
- Professor name, avg overall rating, total reviews
- List of all classes they teach (or have taught) with per-class avg rating
- All reviews across all their classes, sortable

### 6. Schedule (`/schedule`)
- 5-column Mon–Fri calendar (Google Calendar-style)
- Time slots from ~8am–8pm
- Each class rendered as a colored block in its time slot(s)
- Clicking a block navigates to that class's detail page
- Scoped to current semester (semester picker in header)

### 7. Add Class / Professor (modal or `/add`)
- **Search first:** Prominent search bar — "Does this class already exist?"
- If found: link to existing page
- If not: form to create new entry
  - Class: title, category, professor (searchable dropdown), meeting days (checkboxes Mon–Fri), start/end time, semester
  - Professor: name
- Anyone can add — no auth

### 8. Admin (`/admin`)
- Password-protected via simple hardcoded check (`ben` / `admin`) — no OAuth
- Lists all reviews with a Delete button
- Lists all classes and professors with Delete buttons
- No edit capability needed — delete and re-add

---

## Data Model

```sql
professors
  id          uuid PK
  name        text NOT NULL
  created_at  timestamptz

classes
  id            uuid PK
  title         text NOT NULL
  category      text
  professor_id  uuid FK → professors.id
  meeting_days  text[]        -- e.g. ['Mon','Wed']
  start_time    time
  end_time      time
  semester      text          -- e.g. 'Fall 2025'
  created_at    timestamptz

reviews
  id              uuid PK
  class_id        uuid FK → classes.id
  overall_rating  int  (1–5)
  workload_rating int  (1–5)
  comment         text
  tags            text[]
  semester        text
  helpful_count   int DEFAULT 0
  created_at      timestamptz

review_votes
  id         uuid PK
  review_id  uuid FK → reviews.id
  voter_key  text   -- hashed IP or random localStorage key to prevent double-voting
  created_at timestamptz
```

---

## Key Logic

**Trending:** Classes ranked by avg `overall_rating` among reviews in the current semester, minimum 2 reviews.

**Top Professors:** Professors ranked by avg `overall_rating` across all their classes, minimum 3 reviews.

**Most Helpful Review:** The single review per class with the highest `helpful_count`.

**Duplicate prevention on add:** Before creating a class or professor, the form queries for fuzzy name matches and presents them to the user to confirm it's a new entry.

**Upvote dedup:** On upvote, store a `voter_key` (random UUID written to localStorage) in `review_votes`. If the key already exists for that review, block the vote.

**Admin auth:** `/admin` checks a submitted password against a hardcoded env var `ADMIN_PASSWORD`. No session — just a page-level password gate on each load.

---

## Out of Scope

- Email/account system
- Notifications
- Rich text in reviews
- Image uploads
- Mobile app
- Columbia-side course sync
