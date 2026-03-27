import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import HeroSearch from '@/components/HeroSearch'
import TrendingSection from '@/components/TrendingSection'
import TopProfessorsSection from '@/components/TopProfessorsSection'

function SectionSkeleton() {
  return <div className="h-40 animate-pulse bg-white rounded-lg border border-cream-border" />
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: classData }, { data: profData }] = await Promise.all([
    supabase.from('classes').select('title').order('title'),
    supabase.from('professors').select('id, name').order('name'),
  ])

  const classSuggestions = [...new Set((classData ?? []).map((c: { title: string }) => c.title))]
    .map(title => ({ label: title, href: `/classes?q=${encodeURIComponent(title)}` }))

  const profSuggestions = (profData ?? [])
    .map((p: { id: string; name: string }) => ({ label: p.name, href: `/professors/${p.id}` }))

  const suggestions = [...classSuggestions, ...profSuggestions]
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <>
      <HeroSearch suggestions={suggestions} />
      <div className="max-w-2xl mx-auto px-4 pb-6 flex flex-col gap-6">
        <Suspense fallback={<SectionSkeleton />}>
          <TrendingSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <TopProfessorsSection />
        </Suspense>
      </div>
    </>
  )
}
