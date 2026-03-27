import StarDisplay from '@/components/StarDisplay'

interface Props {
  avgOverall: number
  avgWorkload: number
  reviewCount: number
}

export default function RatingSummary({ avgOverall, avgWorkload, reviewCount }: Props) {
  const overallPct = (avgOverall / 5) * 100
  const workloadPct = (avgWorkload / 5) * 100

  return (
    <div className="bg-white border border-cream-border rounded-xl p-4 flex items-center gap-5">
      <div className="text-center shrink-0">
        <div className="text-4xl font-extrabold text-primary leading-none">
          {avgOverall.toFixed(1)}
        </div>
        <StarDisplay rating={avgOverall} size="md" />
        <div className="text-[10px] text-gray-400 mt-1">{reviewCount} reviews</div>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Overall</span>
            <span className="font-semibold text-primary">{avgOverall.toFixed(1)}</span>
          </div>
          <div className="bg-cream-border rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Workload</span>
            <span className="font-semibold text-primary">{avgWorkload.toFixed(1)}</span>
          </div>
          <div className="bg-cream-border rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${workloadPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
