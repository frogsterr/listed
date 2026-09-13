BEGIN;

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



-- Public catalog writes must go through the server's authenticated admin actions.
-- A signed-in non-admin must not be able to bypass those actions via the Data API.
DROP POLICY IF EXISTS "public insert professors" ON public.professors;
DROP POLICY IF EXISTS "public insert classes" ON public.classes;
REVOKE INSERT, UPDATE, DELETE ON public.professors, public.classes FROM anon, authenticated;
GRANT SELECT ON public.professors, public.classes TO anon, authenticated;
GRANT ALL ON public.professors, public.classes TO service_role;



-- Populated only from verified course/advising data by an administrator.
-- An empty list means not recorded, not that the course fulfills no requirements.
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS requirements text[] NOT NULL DEFAULT '{}';


ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS course_codes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS credits numeric,
  ADD COLUMN IF NOT EXISTS catalog_instructors text[] NOT NULL DEFAULT '{}';

-- Additional teaching assignments for co-taught offerings. The original
-- professor_id remains supported for existing reviews and single-instructor forms.
CREATE TABLE IF NOT EXISTS public.class_professors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  professor_id uuid NOT NULL REFERENCES public.professors(id) ON DELETE CASCADE,
  UNIQUE (class_id, professor_id)
);
ALTER TABLE public.class_professors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read class professors" ON public.class_professors FOR SELECT USING (true);
REVOKE ALL ON public.class_professors FROM anon, authenticated;
GRANT SELECT ON public.class_professors TO anon, authenticated;
GRANT ALL ON public.class_professors TO service_role;
INSERT INTO public.class_professors (class_id, professor_id)
SELECT id, professor_id FROM public.classes WHERE professor_id IS NOT NULL
ON CONFLICT DO NOTHING;


-- Reviews remain anonymous, but readers cannot rewrite other students' reviews
-- or supply fabricated vote totals. Counters can only change through the RPCs.
DROP POLICY IF EXISTS "public update reviews" ON public.reviews;
REVOKE UPDATE ON public.reviews FROM anon, authenticated;
DROP POLICY IF EXISTS "public insert reviews" ON public.reviews;
CREATE POLICY "public insert reviews" ON public.reviews FOR INSERT
WITH CHECK (helpful_count = 0 AND unhelpful_count = 0);
DROP POLICY IF EXISTS "public insert votes" ON public.review_votes;
DROP POLICY IF EXISTS "public insert downvotes" ON public.review_downvotes;
REVOKE INSERT, UPDATE, DELETE ON public.review_votes, public.review_downvotes FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_helpful_count(review_id uuid, voter_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE inserted_count integer;
BEGIN
  IF voter_key IS NULL OR char_length(voter_key) NOT BETWEEN 1 AND 128 THEN
    RAISE EXCEPTION 'invalid voter key';
  END IF;
  INSERT INTO public.review_votes (review_id, voter_key)
  VALUES (increment_helpful_count.review_id, increment_helpful_count.voter_key)
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  IF inserted_count = 1 THEN
    UPDATE public.reviews SET helpful_count = COALESCE(helpful_count, 0) + 1
    WHERE id = increment_helpful_count.review_id;
  END IF;
  RETURN jsonb_build_object('already_voted', inserted_count = 0);
END;
$$;
REVOKE ALL ON FUNCTION public.increment_helpful_count(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_helpful_count(uuid, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.increment_unhelpful_count(review_id uuid, voter_key text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE inserted_count integer;
BEGIN
  IF voter_key IS NULL OR char_length(voter_key) NOT BETWEEN 1 AND 128 THEN
    RAISE EXCEPTION 'invalid voter key';
  END IF;
  INSERT INTO public.review_downvotes (review_id, voter_key)
  VALUES (increment_unhelpful_count.review_id, increment_unhelpful_count.voter_key)
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  IF inserted_count = 1 THEN
    UPDATE public.reviews SET unhelpful_count = COALESCE(unhelpful_count, 0) + 1
    WHERE id = increment_unhelpful_count.review_id;
  END IF;
  RETURN jsonb_build_object('already_voted', inserted_count = 0);
END;
$$;
REVOKE ALL ON FUNCTION public.increment_unhelpful_count(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_unhelpful_count(uuid, text) TO anon, authenticated, service_role;


NOTIFY pgrst, 'reload schema';
COMMIT;
