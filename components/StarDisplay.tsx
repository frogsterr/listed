import { starsArray } from '@/lib/utils'

export default function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const stars = starsArray(Math.round(rating))
  const cls = size === 'md' ? 'text-base' : 'text-sm'
  return (
    <span className={cls}>
      {stars.map((s, i) =>
        s === 'full' ? (
          <span key={i} className="text-primary">★</span>
        ) : (
          <span key={i} className="text-gray-200">★</span>
        )
      )}
    </span>
  )
}
