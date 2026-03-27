-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Professors
create table professors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) <= 200),
  created_at  timestamptz default now()
);

-- Classes
create table classes (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(title) <= 300),
  category      text,
  professor_id  uuid references professors(id) on delete set null,
  meeting_days  text[] default '{}',
  start_time    time,
  end_time      time,
  semester      text not null check (semester ~ '^(Fall|Spring) \d{4}$'),
  created_at    timestamptz default now()
);

-- Reviews
create table reviews (
  id              uuid primary key default gen_random_uuid(),
  class_id        uuid references classes(id) on delete cascade not null,
  overall_rating  int not null check (overall_rating between 1 and 5),
  workload_rating int not null check (workload_rating between 1 and 5),
  comment         text check (char_length(comment) <= 5000),
  tags            text[] default '{}',
  semester        text not null check (semester ~ '^(Fall|Spring) \d{4}$'),
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
create index on reviews(class_id, created_at desc);
create index on reviews(class_id, helpful_count desc);
create index on reviews(semester, class_id);
