-- Enable RLS on all tables
alter table professors enable row level security;
alter table classes enable row level security;
alter table reviews enable row level security;
alter table review_votes enable row level security;

-- Professors: public read and insert only (no public delete)
create policy "public read professors" on professors for select using (true);
create policy "public insert professors" on professors for insert with check (true);

-- Classes: public read and insert only
create policy "public read classes" on classes for select using (true);
create policy "public insert classes" on classes for insert with check (true);

-- Reviews: public read, insert, update only (no public delete)
create policy "public read reviews" on reviews for select using (true);
create policy "public insert reviews" on reviews for insert with check (true);
create policy "public update reviews" on reviews for update using (true);

-- Review votes: public read and insert only (no public delete)
create policy "public read votes" on review_votes for select using (true);
create policy "public insert votes" on review_votes for insert with check (true);
