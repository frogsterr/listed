-- Enable RLS on all tables
alter table professors enable row level security;
alter table classes enable row level security;
alter table reviews enable row level security;
alter table review_votes enable row level security;

-- Professors: public read, insert, delete
create policy "public read professors" on professors for select using (true);
create policy "public insert professors" on professors for insert with check (true);
create policy "public delete professors" on professors for delete using (true);

-- Classes: public read, insert, delete
create policy "public read classes" on classes for select using (true);
create policy "public insert classes" on classes for insert with check (true);
create policy "public delete classes" on classes for delete using (true);

-- Reviews: public read, insert, update, delete
create policy "public read reviews" on reviews for select using (true);
create policy "public insert reviews" on reviews for insert with check (true);
create policy "public update reviews" on reviews for update using (true);
create policy "public delete reviews" on reviews for delete using (true);

-- Review votes: public read, insert, delete
create policy "public read votes" on review_votes for select using (true);
create policy "public insert votes" on review_votes for insert with check (true);
create policy "public delete votes" on review_votes for delete using (true);
