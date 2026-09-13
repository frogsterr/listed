BEGIN;
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

COMMIT;
