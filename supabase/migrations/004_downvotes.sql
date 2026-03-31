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
