-- Scope cleanup to the course reported by the owner. Its reviews and votes
-- are removed by the existing foreign-key cascades. Do not delete professors
-- or unrelated courses based on names alone.
DELETE FROM public.classes
WHERE title = 'How to kidnap temani babies 101'
  AND semester = 'Spring 2026';
