import { Suspense } from 'react'
import HeroSearch from '@/components/HeroSearch'
import StatsRow from '@/components/StatsRow'
import TrendingSection from '@/components/TrendingSection'
import TopProfessorsSection from '@/components/TopProfessorsSection'

function SectionSkeleton() {
  return <div className="h-40 animate-pulse bg-white rounded-lg border border-cream-border" />
}

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      <HeroSearch />
      <Suspense fallback={<div className="h-16 animate-pulse bg-white rounded-lg" />}>
        <StatsRow />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <TrendingSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <TopProfessorsSection />
      </Suspense>
    </div>
  )
}
