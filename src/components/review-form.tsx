import { useState } from 'react'
import { Send, Star } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useUpsertReview } from '@/hooks/use-reviews'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  contentId: string
  initialRating?: number
  initialComment?: string
}

export function ReviewForm({ contentId, initialRating = 0, initialComment = '' }: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState(initialComment)
  const mutation = useUpsertReview()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (rating < 1) {
      toast.error('Selecciona una calificación de 1 a 5 estrellas.')
      return
    }
    mutation.mutate(
      { contentId, rating, comment },
      {
        onSuccess: () => toast.success('Tu reseña se guardó correctamente.'),
        onError: (error) => toast.error(error.message),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <p className="text-sm font-semibold text-ink">Tu calificación</p>

      <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {Array.from({ length: 5 }).map((_, index) => {
          const value = index + 1
          const active = value <= (hover || rating)
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              aria-label={`Calificar con ${value} estrellas`}
              className="rounded-md p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'h-7 w-7 transition-colors',
                  active ? 'fill-gold text-gold' : 'fill-muted text-muted-foreground/30',
                )}
                strokeWidth={1.5}
              />
            </button>
          )
        })}
        {rating > 0 && (
          <span className="ml-2 text-sm font-semibold text-ink-soft">{rating}/5</span>
        )}
      </div>

      <Textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Comparte qué te pareció este contenido (opcional)"
        className="mt-4"
        maxLength={1000}
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-ink-muted">{comment.length}/1000</span>
        <Button type="submit" disabled={mutation.isPending}>
          <Send className="h-4 w-4" />
          {mutation.isPending ? 'Guardando…' : 'Publicar reseña'}
        </Button>
      </div>
    </form>
  )
}
