import { Link } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RatingStars } from '@/components/rating-stars'
import { relativeDate } from '@/lib/format'
import { initials } from '@/lib/utils'
import type { Review } from '@/types'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="border-b border-border/70 py-5 last:border-0">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={undefined} alt={review.user_name ?? 'Lector'} />
          <AvatarFallback>{initials(review.user_name ?? 'Lector')}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-ink">
                {review.user_name ?? 'Lector anónimo'}
              </p>
              <p className="text-xs text-ink-muted">{relativeDate(review.created_at)}</p>
            </div>
            <RatingStars rating={review.rating} size="sm" />
          </div>

          {review.comment && (
            <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-soft">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export function ReviewCardSkeleton() {
  return (
    <div className="animate-pulse border-b border-border/70 py-5">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

export function ReviewLoginPrompt() {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-5 text-sm text-ink-soft">
      <p>
        <Link to="/login" className="link-underline font-semibold text-clay">
          Inicia sesión
        </Link>{' '}
        para calificar y reseñar este contenido.
      </p>
    </div>
  )
}
