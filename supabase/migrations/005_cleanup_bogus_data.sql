-- Delete reviews belonging to bogus classes first (FK cascade would handle it, but explicit is safer)
DELETE FROM reviews
WHERE class_id IN (
  SELECT id FROM classes
  WHERE title IN (
    'How to kidnap temani babies 101',
    'Intro to Koyfer Avoda Zara'
  )
);

-- Delete the bogus classes
DELETE FROM classes
WHERE title IN (
  'How to kidnap temani babies 101',
  'Intro to Koyfer Avoda Zara'
);

-- Delete the bogus professors
DELETE FROM professors
WHERE name IN (
  'Reb Duvid Ben Reb Lipa Laizer Shlita',
  'Usher Strell Ha Cohen'
);

-- Fix the "Food class" category chip — null it out
UPDATE classes SET category = NULL WHERE category = 'Food class';
