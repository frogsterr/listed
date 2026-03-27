# Supabase Setup

1. Create a project at https://supabase.com named `listed-jts`
2. Go to Settings → API, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Create `.env.local` from `.env.local.example` and fill in values
4. In SQL Editor, run `supabase/migrations/001_initial.sql`
5. In SQL Editor, run the RLS policies in `supabase/migrations/002_rls.sql`
