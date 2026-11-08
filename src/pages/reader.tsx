import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  FileText,
  Keyboard,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { Page } from '@/components/layout/page'
import { PdfViewer } from '@/components/pdf-viewer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useContent } from '@/hooks/use-contents'
import { useContentProgress, useSaveProgress, useToggleSave } from '@/hooks/use-library'
import { formatNumber, typeLabel } from '@/lib/format'

export function ReaderPage() {
  const { contentId } = useParams<{ contentId: string }>()
  const navigate = useNavigate()
  const contentQuery = useContent(contentId)
  const progressQuery = useContentProgress(contentId, true)
  const saveProgress = useSaveProgress()
  const { toggle, isPending, isSaved } = useToggleSave(contentQuery.data)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [ready, setReady] = useState(false)
  const timerRef = useRef<number | null>(null)

  const content = contentQuery.data
  const progress = progressQuery.data

  useEffect(() => {
    if (progress) {
      setPage(progress.current_page)
      setTotalPages(progress.total_pages)
    }
    if (!progressQuery.isLoading) setReady(true)
  }, [progress, progressQuery.isLoading])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  function handlePageChange(nextPage: number, total: number) {
    setPage(nextPage)
    if (total > 0) setTotalPages(total)
    if (!contentId || total <= 0) return

    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      saveProgress.mutate(
        {
          contentId,
          currentPage: nextPage,
          totalPages: total,
          percentage: Math.round(Math.min(100, (nextPage / total) * 100) * 10) / 10,
        },
        {
          onError: () => toast.error('No se pudo guardar tu progreso de lectura.'),
        },
      )
    }, 900)
  }

  if (contentQuery.isLoading) {
    return (
      <Page>
        <div className="space-y-5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-[60vh] w-full rounded-2xl" />
        </div>
      </Page>
    )
  }

  if (contentQuery.isError || !content) {
    return (
      <Page>
        <EmptyState
          icon={FileText}
          title="Contenido no encontrado"
          description="El contenido que intentas leer no existe o ya no está disponible."
          actionLabel="Volver al catálogo"
          onAction={() => navigate('/catalogo')}
        />
      </Page>
    )
  }

  if (!content.has_file) {
    return (
      <Page>
        <EmptyState
          icon={BookOpen}
          title="Este contenido aún no tiene PDF"
          description="El equipo editorial todavía no ha subido el archivo. Puedes guardarlo en tu biblioteca y volver más tarde."
          actionLabel="Volver al detalle"
          onAction={() => navigate(`/contenido/${content.id}`)}
        />
      </Page>
    )
  }

  const percentage =
    totalPages > 0 ? Math.round(Math.min(100, (page / totalPages) * 100) * 10) / 10 : 0

  return (
    <Page className="max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-ink-muted">
          <Link to={`/contenido/${content.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Volver al detalle
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted">{typeLabel(content.type)}</Badge>
          <Badge variant="gold" className="gap-1">
            <FileText className="h-3 w-3" />
            GridFS
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toggle()
              toast.success(
                isSaved ? 'Eliminado de tu biblioteca' : 'Guardado en tu biblioteca',
              )
            }}
            disabled={isPending}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {isSaved ? 'Guardado' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow mb-2">Lectura en línea</p>
          <h1 className="text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">{content.author}</p>
        </div>

        <div className="min-w-[220px] rounded-2xl border border-border bg-card/70 px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wide text-ink-muted">
              Progreso
            </span>
            <span className="font-semibold text-pine-dark">{percentage}%</span>
          </div>
          <Progress value={percentage} className="mt-2 h-1.5" />
          <p className="mt-1.5 text-xs text-ink-muted">
            Página {page}
            {totalPages > 0 ? ` de ${totalPages}` : ''} ·{' '}
            {saveProgress.isPending ? 'Guardando…' : 'Guardado automático'}
          </p>
        </div>
      </div>

      {ready ? (
        <PdfViewer
          contentId={content.id}
          filename={`${content.title}.pdf`}
          initialPage={Math.max(1, progress?.current_page ?? 1)}
          onPageChange={handlePageChange}
        />
      ) : (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card/60 text-ink-muted">
          <Loader2 className="h-7 w-7 animate-spin text-clay" />
          <p className="text-sm">Recuperando tu progreso de lectura…</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <Keyboard className="h-3.5 w-3.5" />
          Usa ← y → para cambiar de página
        </span>
        <span>
          {formatNumber(content.popularity)} puntos de popularidad · {content.rating_count}{' '}
          reseñas
        </span>
      </div>
    </Page>
  )
}
