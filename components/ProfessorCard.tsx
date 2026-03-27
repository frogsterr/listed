import Link from 'next/link'
import StarDisplay from '@/components/StarDisplay'
import type { ProfessorWithStats } from '@/lib/types'

export default function ProfessorCard({ professor }: { professor: ProfessorWithStats }) {
  return (
    <Link href={`/professors/${professor.id}`}>
      <div className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-center hover:border-primary transition-colors">
        <div>
          <div className="text-sm font-semibold text-gray-900">{professor.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">{professor.review_count} reviews</div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-bold text-primary">
            {professor.avg_overall.toFixed(1)}
          </span>
          <StarDisplay rating={professor.avg_overall} />
        </div>
      </div>
    </Link>
  )
}
