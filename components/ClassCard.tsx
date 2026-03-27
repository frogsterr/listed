import Link from 'next/link'
import StarDisplay from '@/components/StarDisplay'
import type { ClassWithStats } from '@/lib/types'

export default function ClassCard({ cls }: { cls: ClassWithStats }) {
  return (
    <Link href={`/classes/${cls.id}`}>
      <div className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-center hover:border-primary transition-colors">
        <div>
          <div className="text-sm font-semibold text-gray-900">{cls.title}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {cls.professor?.name ?? 'Unknown professor'}
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-bold text-primary">
            {cls.avg_overall.toFixed(1)}
          </span>
          <StarDisplay rating={cls.avg_overall} />
          <span className="text-[10px] text-gray-400">{cls.review_count} reviews</span>
        </div>
      </div>
    </Link>
  )
}
