-- Populated only from verified course/advising data by an administrator.
-- An empty list means not recorded, not that the course fulfills no requirements.
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS requirements text[] NOT NULL DEFAULT '{}';
