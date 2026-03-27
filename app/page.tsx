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
  const { data } = await supabase.from('classes').select('title').order('title')
  const suggestions = [...new Set((data ?? []).map((c: { title: string }) => c.title))].sort() as string[]

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
