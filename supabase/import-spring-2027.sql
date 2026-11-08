-- Spring 2027 List College catalog; source and decisions: data/README.md.
-- Run only after reviewing. No schema, permissions, reviews, or old offerings change.
BEGIN;
LOCK TABLE public.professors, public.classes, public.class_professors IN SHARE ROW EXCLUSIVE MODE;
CREATE TEMP TABLE spring_2027_import ON COMMIT DROP AS
SELECT * FROM jsonb_to_recordset($catalog$[
  {
    "title": "Introduction to Biblical Literature II: Nevi'im/Prophets",
    "semester": "Spring 2027",
    "category": "Bible",
    "course_codes": [
      "BIB 1211"
    ],
    "professors": [
      "Ronald Androphy"
    ],
    "meeting_days": [
      "Mon",
      "Wed"
    ],
    "start_time": "13:05",
    "end_time": "14:20",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Historical Critical Methodologies",
    "semester": "Spring 2027",
    "category": "Bible",
    "course_codes": [
      "BIB 3009"
    ],
    "professors": [
      "Benjamin D Sommer"
    ],
    "meeting_days": [
      "Tue"
    ],
    "start_time": "10:10",
    "end_time": "12:55",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Medieval Jews and Christians Read Scripture",
    "semester": "Spring 2027",
    "category": "Bible",
    "course_codes": [
      "BIB 3515"
    ],
    "professors": [
      "Loraine Enlow"
    ],
    "meeting_days": [
      "Thu"
    ],
    "start_time": "17:35",
    "end_time": "20:15",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Honors Thesis (BIB)",
    "semester": "Spring 2027",
    "category": "Bible",
    "course_codes": [
      "BIB 3999"
    ],
    "professors": [],
    "meeting_days": [],
    "start_time": null,
    "end_time": null,
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Jurisprudential Theory and Halakhah",
    "semester": "Spring 2027",
    "category": "Jewish Ethics",
    "course_codes": [
      "ETH 3323",
      "JTH 3323"
    ],
    "professors": [
      "Emmanuel Joel Bloch"
    ],
    "meeting_days": [
      "Tue",
      "Thu"
    ],
    "start_time": "13:05",
    "end_time": "14:20",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Honors Thesis (ETH)",
    "semester": "Spring 2027",
    "category": "Jewish Ethics",
    "course_codes": [
      "ETH 3999"
    ],
    "professors": [],
    "meeting_days": [],
    "start_time": null,
    "end_time": null,
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Hebrew Alef 2",
    "semester": "Spring 2027",
    "category": "Hebrew",
    "course_codes": [
      "HEB 1101"
    ],
    "professors": [],
    "meeting_days": [
      "Mon",
      "Tue",
      "Wed",
      "Thu"
    ],
    "start_time": "10:10",
    "end_time": "11:25",
    "credits": 6,
    "requirements": []
  },
  {
    "title": "Hebrew Alef 3",
    "semester": "Spring 2027",
    "category": "Hebrew",
    "course_codes": [
      "HEB 2103"
    ],
    "professors": [],
    "meeting_days": [
      "Mon",
      "Tue",
      "Wed",
      "Thu"
    ],
    "start_time": "10:10",
    "end_time": "11:25",
    "credits": 6,
    "requirements": []
  },
  {
    "title": "Hebrew Bet 1",
    "semester": "Spring 2027",
    "category": "Hebrew",
    "course_codes": [
      "HEB 2201"
    ],
    "professors": [
      "Ilona Ben-Moshe"
    ],
    "meeting_days": [
      "Mon",
      "Wed",
      "Thu"
    ],
    "start_time": "08:40",
    "end_time": "09:55",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Between Identity and Ideology: Nationalism and the Jewish Question",
    "semester": "Spring 2027",
    "category": "Jewish History",
    "course_codes": [
      "HIS 3312"
    ],
    "professors": [
      "Brian M Smollett"
    ],
    "meeting_days": [
      "Tue",
      "Thu"
    ],
    "start_time": "11:40",
    "end_time": "12:55",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Honors Thesis (HIS)",
    "semester": "Spring 2027",
    "category": "Jewish History",
    "course_codes": [
      "HIS 3999"
    ],
    "professors": [],
    "meeting_days": [],
    "start_time": null,
    "end_time": null,
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Honors Thesis (IDS)",
    "semester": "Spring 2027",
    "category": "Interdisciplinary Studies",
    "course_codes": [
      "IDS 3999"
    ],
    "professors": [],
    "meeting_days": [],
    "start_time": null,
    "end_time": null,
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Golems, Dybbuks & the Supernatural in Modern Jewish Literature & Culture",
    "semester": "Spring 2027",
    "category": "Jewish Literature",
    "course_codes": [
      "JGW 3530",
      "LIT 3530"
    ],
    "professors": [
      "Beverly J Bailis"
    ],
    "meeting_days": [
      "Tue",
      "Thu"
    ],
    "start_time": "14:45",
    "end_time": "16:00",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Honors Thesis (JTH)",
    "semester": "Spring 2027",
    "category": "Jewish Thought",
    "course_codes": [
      "JTH 3999"
    ],
    "professors": [],
    "meeting_days": [],
    "start_time": null,
    "end_time": null,
    "credits": 3,
    "requirements": []
  },
  {
    "title": "List College Fellows: Poetry After Auschwitz",
    "semester": "Spring 2027",
    "category": "Jewish Literature",
    "course_codes": [
      "LIT 3476"
    ],
    "professors": [
      "Evan G Parks"
    ],
    "meeting_days": [
      "Thu"
    ],
    "start_time": "17:35",
    "end_time": "20:15",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Sephardi and Mizrahi Worlds in Jewish Literature",
    "semester": "Spring 2027",
    "category": "Jewish Literature",
    "course_codes": [
      "LIT 3922"
    ],
    "professors": [
      "David Haziza"
    ],
    "meeting_days": [
      "Tue",
      "Thu"
    ],
    "start_time": "13:05",
    "end_time": "14:20",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Honors Thesis (LIT)",
    "semester": "Spring 2027",
    "category": "Jewish Literature",
    "course_codes": [
      "LIT 3999"
    ],
    "professors": [],
    "meeting_days": [],
    "start_time": null,
    "end_time": null,
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Honors Thesis (LTG)",
    "semester": "Spring 2027",
    "category": "Liturgy",
    "course_codes": [
      "LTG 3999"
    ],
    "professors": [],
    "meeting_days": [],
    "start_time": null,
    "end_time": null,
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Honors Thesis (MDS)",
    "semester": "Spring 2027",
    "category": "Multidisciplinary Studies",
    "course_codes": [
      "MDS 3999"
    ],
    "professors": [],
    "meeting_days": [],
    "start_time": null,
    "end_time": null,
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Honors Thesis (MED)",
    "semester": "Spring 2027",
    "category": "Medieval Jewish Studies",
    "course_codes": [
      "MED 3999"
    ],
    "professors": [],
    "meeting_days": [],
    "start_time": null,
    "end_time": null,
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Honors Thesis (MID)",
    "semester": "Spring 2027",
    "category": "Midrash",
    "course_codes": [
      "MID 3999"
    ],
    "professors": [],
    "meeting_days": [],
    "start_time": null,
    "end_time": null,
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Honors Thesis (MJS)",
    "semester": "Spring 2027",
    "category": "Modern Jewish Studies",
    "course_codes": [
      "MJS 3999"
    ],
    "professors": [],
    "meeting_days": [],
    "start_time": null,
    "end_time": null,
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Introduction to Talmud Level 2: The Defiant Child",
    "semester": "Spring 2027",
    "category": "Talmud and Rabbinics",
    "course_codes": [
      "RLC 3002"
    ],
    "professors": [
      "Ronald Androphy"
    ],
    "meeting_days": [
      "Mon",
      "Wed"
    ],
    "start_time": "14:45",
    "end_time": "16:00",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Intermediate Talmud: The Power of Shabbat...or Not",
    "semester": "Spring 2027",
    "category": "Talmud and Rabbinics",
    "course_codes": [
      "RLC 3214"
    ],
    "professors": [
      "Ronald Androphy"
    ],
    "meeting_days": [
      "Mon",
      "Wed"
    ],
    "start_time": "16:10",
    "end_time": "17:25",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Advanced Talmud: Capital Punishment in Rabbinic Literature",
    "semester": "Spring 2027",
    "category": "Talmud and Rabbinics",
    "course_codes": [
      "RLC 3624"
    ],
    "professors": [
      "Richard Kalmin"
    ],
    "meeting_days": [
      "Mon"
    ],
    "start_time": "14:45",
    "end_time": "17:25",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Codes for Talmud Majors and Others",
    "semester": "Spring 2027",
    "category": "Talmud and Rabbinics",
    "course_codes": [
      "RLC 3809"
    ],
    "professors": [
      "Jonathan Milgram"
    ],
    "meeting_days": [
      "Tue",
      "Thu"
    ],
    "start_time": "13:05",
    "end_time": "14:20",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Honors Thesis (RLC)",
    "semester": "Spring 2027",
    "category": "Talmud and Rabbinics",
    "course_codes": [
      "RLC 3999"
    ],
    "professors": [],
    "meeting_days": [],
    "start_time": null,
    "end_time": null,
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Foundations of the Jewish Canon II",
    "semester": "Spring 2027",
    "category": "Seminar",
    "course_codes": [
      "SEM 1012"
    ],
    "professors": [
      "Sandra Fox",
      "Isaac Y Landes"
    ],
    "meeting_days": [
      "Mon",
      "Wed"
    ],
    "start_time": "11:40",
    "end_time": "12:55",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "List College Capstone Seminar",
    "semester": "Spring 2027",
    "category": "Seminar",
    "course_codes": [
      "SEM 3001"
    ],
    "professors": [
      "Rebecca Perten"
    ],
    "meeting_days": [
      "Thu"
    ],
    "start_time": "10:10",
    "end_time": "12:55",
    "credits": 3,
    "requirements": []
  },
  {
    "title": "Thesis Writing Seminar",
    "semester": "Spring 2027",
    "category": "Seminar",
    "course_codes": [
      "SEM 3999"
    ],
    "professors": [],
    "meeting_days": [],
    "start_time": null,
    "end_time": null,
    "credits": 3,
    "requirements": []
  }
]$catalog$::jsonb)
AS r(title text, semester text, category text, course_codes text[], professors text[],
     meeting_days text[], start_time time, end_time time, credits numeric, requirements text[]);
DO $import$
DECLARE
  entry record;
  instructor text;
  instructor_id uuid;
  instructor_ids uuid[];
  matched_ids uuid[];
  matched public.classes%ROWTYPE;
  course_id uuid;
  professor_count integer := 0;
  course_count integer := 0;
BEGIN
  IF (SELECT count(*) FROM spring_2027_import) <> 30 THEN
    RAISE EXCEPTION 'Expected exactly 30 verified offerings';
  END IF;
  FOR entry IN SELECT * FROM spring_2027_import LOOP
    instructor_ids := '{}';
    FOREACH instructor IN ARRAY entry.professors LOOP
      SELECT array_agg(id) INTO matched_ids FROM public.professors
      WHERE lower(replace(btrim(name), '.', '')) = lower(replace(btrim(instructor), '.', ''));
      IF coalesce(cardinality(matched_ids), 0) > 1 THEN
        RAISE EXCEPTION 'Ambiguous professor: %', instructor;
      ELSIF coalesce(cardinality(matched_ids), 0) = 0 THEN
        INSERT INTO public.professors(name) VALUES (instructor) RETURNING id INTO instructor_id;
        professor_count := professor_count + 1;
      ELSE
        instructor_id := matched_ids[1];
      END IF;
      instructor_ids := array_append(instructor_ids, instructor_id);
    END LOOP;
    SELECT array_agg(c.id) INTO matched_ids FROM public.classes c
    WHERE c.semester = entry.semester AND
      (c.course_codes && entry.course_codes OR
       (c.title = entry.title AND c.meeting_days = entry.meeting_days
        AND c.start_time IS NOT DISTINCT FROM entry.start_time
        AND c.end_time IS NOT DISTINCT FROM entry.end_time));
    IF coalesce(cardinality(matched_ids), 0) > 1 THEN
      RAISE EXCEPTION 'Ambiguous offering: %', entry.title;
    ELSIF coalesce(cardinality(matched_ids), 0) = 1 THEN
      SELECT * INTO matched FROM public.classes WHERE id = matched_ids[1];
      IF matched.title IS DISTINCT FROM entry.title
        OR matched.category IS DISTINCT FROM entry.category
        OR matched.credits IS DISTINCT FROM entry.credits
        OR matched.meeting_days IS DISTINCT FROM entry.meeting_days
        OR matched.start_time IS DISTINCT FROM entry.start_time
        OR matched.end_time IS DISTINCT FROM entry.end_time
        OR matched.professor_id IS DISTINCT FROM instructor_ids[1]
        OR ARRAY(SELECT x FROM unnest(matched.course_codes) x ORDER BY x)
           IS DISTINCT FROM ARRAY(SELECT x FROM unnest(entry.course_codes) x ORDER BY x)
        OR ARRAY(SELECT x FROM unnest(matched.requirements) x ORDER BY x)
           IS DISTINCT FROM ARRAY(SELECT x FROM unnest(entry.requirements) x ORDER BY x)
        OR ARRAY(SELECT lower(replace(btrim(x), '.', '')) FROM unnest(matched.catalog_instructors) x ORDER BY 1)
           IS DISTINCT FROM ARRAY(SELECT lower(replace(btrim(x), '.', '')) FROM unnest(entry.professors) x ORDER BY 1)
      THEN
        RAISE EXCEPTION 'Existing offering differs; review separately: %', entry.title;
      END IF;
      course_id := matched.id;
    ELSE
      INSERT INTO public.classes(title, semester, category, professor_id, course_codes,
        credits, catalog_instructors, meeting_days, start_time, end_time, requirements)
      VALUES (entry.title, entry.semester, entry.category, instructor_ids[1], entry.course_codes,
        entry.credits, entry.professors, entry.meeting_days, entry.start_time, entry.end_time, entry.requirements)
      RETURNING id INTO course_id;
      course_count := course_count + 1;
    END IF;
    INSERT INTO public.class_professors(class_id, professor_id)
      SELECT course_id, x FROM unnest(instructor_ids) x ON CONFLICT (class_id, professor_id) DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Inserted % professors and % courses; verified 30 offerings.', professor_count, course_count;
END $import$;
SELECT count(*) AS verified_offerings FROM spring_2027_import s
JOIN public.classes c ON c.semester = s.semester AND c.course_codes @> s.course_codes;
COMMIT;
