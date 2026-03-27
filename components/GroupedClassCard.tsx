import Link from 'next/link'
import StarDisplay from '@/components/StarDisplay'
import type { ClassGroup } from '@/app/classes/page'

export default function GroupedClassCard({ group }: { group: ClassGroup }) {
  const single = group.sections.length === 1
  const avgStr = group.avg_rating != null ? group.avg_rating.toFixed(1) : null
  const href = single
    ? `/classes/${group.sections[0].id}`
    : `/classes/group/${encodeURIComponent(group.title)}`

  return (
    <Link href={href}>
      <div className="bg-white border border-cream-border rounded-lg px-4 py-3 flex justify-between items-center hover:border-primary transition-colors">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{group.title}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {single
              ? `${group.sections[0].professor_name ?? 'Unknown'} · ${group.semester ?? ''}`
              : `${group.sections.length} sections · ${group.semester ?? ''}`}
          </div>
          {group.category && (
            <span className="text-[10px] text-primary font-semibold uppercase tracking-wide">
              {group.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          {avgStr != null ? (
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-sm font-bold text-primary">{avgStr}</span>
              <StarDisplay rating={group.avg_rating!} />
              <span className="text-[10px] text-gray-400">{group.total_reviews} reviews</span>
            </div>
          ) : (
            <span className="text-xs text-gray-300">No reviews</span>
          )}
          {!single && (
            <span className="text-gray-300 text-xs">›</span>
          )}
        </div>
      </div>
    </Link>
  )
}
