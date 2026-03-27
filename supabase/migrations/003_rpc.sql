create or replace function increment_helpful_count(review_id uuid, voter_key text)
returns jsonb
language plpgsql
as $$
declare
  already_voted boolean;
begin
  -- Try to insert vote; unique constraint will reject duplicates
  begin
    insert into review_votes (review_id, voter_key) values (increment_helpful_count.review_id, increment_helpful_count.voter_key);
    already_voted := false;
  exception when unique_violation then
    already_voted := true;
  end;

  -- Only increment if vote was new
  if not already_voted then
    update reviews set helpful_count = helpful_count + 1 where id = increment_helpful_count.review_id;
  end if;

  return jsonb_build_object('already_voted', already_voted);
end;
$$;
