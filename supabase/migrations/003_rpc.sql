create or replace function increment_helpful_count(review_id uuid)
returns void
language sql
as $$
  update reviews set helpful_count = helpful_count + 1 where id = review_id;
$$;
