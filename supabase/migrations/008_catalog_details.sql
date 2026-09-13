BEGIN;
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
COMMIT;
