-- Strip all trailing parenthetical suffixes from class titles
-- e.g. "Hebrew Bet 1 (Morning)" → "Hebrew Bet 1"
--      "Hebrew Alef 2 (Evening)" → "Hebrew Alef 2"
--      "Hebrew Alef 3 (Afternoon)" → "Hebrew Alef 3"
UPDATE classes
SET title = trim(regexp_replace(title, '\s*\([^)]+\)\s*$', ''))
WHERE title ~ '\([^)]+\)$';

-- Confirm result: each unique title and how many sections it has
SELECT title, COUNT(*) AS sections
FROM classes
WHERE title ILIKE 'Hebrew%'
GROUP BY title
ORDER BY title;
