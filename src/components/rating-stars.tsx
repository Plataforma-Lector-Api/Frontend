import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

const SIZE_MAP = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

export function RatingStars({
  rating,
  count,
  size = 'sm',
  showValue = false,
  className,
}: RatingStarsProps) {
  const rounded = Math.round(rating)

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} de 5 estrellas`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              SIZE_MAP[size],
              index < rounded ? 'fill-gold text-gold' : 'fill-muted text-muted-foreground/30',
            )}
            strokeWidth={1.6}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-ink-soft">{rating.toFixed(1)}</span>
      )}
      {count !== undefined && (
        <span className="text-xs text-ink-muted">
          {count === 0 ? 'Sin reseñas' : `(${count})`}
        </span>
      )}
    </div>
  )
}
