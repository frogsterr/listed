import { createClient } from '@/lib/supabase/server'

export default async function StatsRow() {
  const supabase = await createClient()

  const [{ count: reviewCount }, { count: classCount }, { count: profCount }] =
    await Promise.all([
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('professors').select('*', { count: 'exact', head: true }),
    ])

  const stats = [
    { label: 'Reviews', value: reviewCount ?? 0 },
    { label: 'Classes', value: classCount ?? 0 },
    { label: 'Professors', value: profCount ?? 0 },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="bg-white border border-cream-border rounded-lg py-3 text-center"
        >
          <div className="text-xl font-bold text-primary">{stat.value}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}
