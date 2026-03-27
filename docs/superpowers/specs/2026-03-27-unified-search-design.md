# Unified Search (Classes + Professors)

## Goal

Extend the homepage search bar to return both class titles and professor names in the autocomplete dropdown. Selecting a professor navigates to their individual page; selecting a class navigates to the classes page filtered by title. Free-text Enter still goes to `/classes?q=value`.

## Data Shape

```ts
type Suggestion = { label: string; href: string }
```

- Class suggestion: `{ label: "Calculus I", href: "/classes?q=Calculus%20I" }`
- Professor suggestion: `{ label: "Rabbi Smith", href: "/professors/abc-123" }`

## Changes

### `app/page.tsx`

Replace the single classes fetch with two parallel fetches:

```ts
const [{ data: classData }, { data: profData }] = await Promise.all([
  supabase.from('classes').select('title').order('title'),
  supabase.from('professors').select('id, name').order('name'),
])
```

Build a merged, deduplicated, sorted `Suggestion[]`:

```ts
const classSuggestions = [...new Set((classData ?? []).map(c => c.title))]
  .map(title => ({ label: title, href: `/classes?q=${encodeURIComponent(title)}` }))

const profSuggestions = (profData ?? [])
  .map(p => ({ label: p.name, href: `/professors/${p.id}` }))

const suggestions = [...classSuggestions, ...profSuggestions]
  .sort((a, b) => a.label.localeCompare(b.label))
```

### `components/HeroSearch.tsx`

- Change `Props` interface: `suggestions: Suggestion[]`
- Update `matches` to filter on `s.label`
- Update `navigate()` to accept `Suggestion | null` — if a suggestion is selected push `suggestion.href`, otherwise push `/classes?q=${value}`
- Update `handleKeyDown` Enter branch to pass the selected suggestion object
- Update dropdown `onMouseDown` to pass the suggestion object
- Render `s.label` in the dropdown list item

## Invariants

- Free-text search (Enter with nothing highlighted) always goes to `/classes?q=value`
- Dropdown shows up to 8 results, same as today
- No network calls on keystroke — all filtering is client-side in memory
- Visual appearance of the dropdown is unchanged
