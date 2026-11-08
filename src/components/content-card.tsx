import { Link, useNavigate } from 'react-router-dom'
import { Bookmark, BookmarkCheck, FileText } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ContentCover } from '@/components/content-cover'
import { RatingStars } from '@/components/rating-stars'
import { useAuth } from '@/hooks/use-auth'
import { useToggleSave } from '@/hooks/use-library'
import { typeLabel, yearOf } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Content } from '@/types'

interface ContentCardProps {
  content: Content
  className?: string
  priority?: boolean
}

export function ContentCard({ content, className }: ContentCardProps) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { toggle, isPending, isSaved } = useToggleSave(content)

  function handleSave(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (!isAuthenticated) {
      toast.info('Inicia sesión para guardar contenidos en tu biblioteca.')
      navigate(`/login?redirect=/contenido/${content.id}`)
      return
    }
    toggle()
    toast.success(isSaved ? 'Eliminado de tu biblioteca' : 'Guardado en tu biblioteca')
  }

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <Link
        to={`/contenido/${content.id}`}
        className="relative block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
      >
        <ContentCover
          title={content.title}
          author={content.author}
          type={content.type}
          coverUrl={content.cover_url}
          className="transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-lift"
        />

        {content.has_file && (
          <Badge
            variant="gold"
            className="absolute left-3 top-3 gap-1 border border-white/10 bg-ink/70 text-paper backdrop-blur-sm"
          >
            <FileText className="h-3 w-3" />
            PDF
          </Badge>
        )}
      </Link>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleSave}
        disabled={isPending}
        aria-label={isSaved ? 'Quitar de la biblioteca' : 'Guardar en la biblioteca'}
        className={cn(
          'absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-ink/45 text-paper backdrop-blur-md hover:bg-ink/70 hover:text-paper',
          isSaved && 'bg-clay text-white hover:bg-clay-dark',
        )}
      >
        {isSaved ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </Button>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          <span>{typeLabel(content.type)}</span>
          {yearOf(content.published_at) && (
            <>
              <span className="text-border">·</span>
              <span>{yearOf(content.published_at)}</span>
            </>
          )}
        </div>

        <Link
          to={`/contenido/${content.id}`}
          className="block font-display text-[1.08rem] font-semibold leading-snug text-ink transition-colors hover:text-clay"
        >
          {content.title}
        </Link>

        <p className="text-sm text-ink-muted">{content.author}</p>

        <div className="pt-1">
          <RatingStars rating={content.rating_avg} count={content.rating_count} />
        </div>
      </div>
    </article>
  )
}
