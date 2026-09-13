BEGIN;

-- Public catalog writes must go through the server's authenticated admin actions.
-- A signed-in non-admin must not be able to bypass those actions via the Data API.
DROP POLICY IF EXISTS "public insert professors" ON public.professors;
DROP POLICY IF EXISTS "public insert classes" ON public.classes;
REVOKE INSERT, UPDATE, DELETE ON public.professors, public.classes FROM anon, authenticated;
GRANT SELECT ON public.professors, public.classes TO anon, authenticated;
GRANT ALL ON public.professors, public.classes TO service_role;

COMMIT;
