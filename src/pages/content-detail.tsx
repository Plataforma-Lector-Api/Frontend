import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CalendarDays,
  Download,
  FileText,
  Globe2,
  Hash,
  Loader2,
  MessageSquare,
  Star,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

import { ContentCard } from '@/components/content-card'
import { ContentCover } from '@/components/content-cover'
import { EmptyState } from '@/components/empty-state'
import { Page } from '@/components/layout/page'
import { RatingStars } from '@/components/rating-stars'
import { ReviewCard, ReviewCardSkeleton, ReviewLoginPrompt } from '@/components/review-card'
import { ReviewForm } from '@/components/review-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { useContent, useContents } from '@/hooks/use-contents'
import { useContentProgress, useToggleSave } from '@/hooks/use-library'
import { useDeleteReview, useReviews } from '@/hooks/use-reviews'
import { apiFetchBlob } from '@/lib/api'
import { formatDate, formatNumber, typeLabel, yearOf } from '@/lib/format'

export function ContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [reviewPage, setReviewPage] = useState(1)
  const [downloading, setDownloading] = useState(false)

  const contentQuery = useContent(contentId)
  const reviewsQuery = useReviews(contentId, reviewPage, 6)
  const progressQuery = useContentProgress(contentId, isAuthenticated)
  const deleteReview = useDeleteReview()

  const content = contentQuery.data
  const related = useContents({
    page: 1,
    limit: 5,
    tags: content?.tags.slice(0, 2).join(','),
    sort: '-popularity',
  })
  const { toggle, isPending, isSaved } = useToggleSave(content)

  if (contentQuery.isLoading) {
    return (
      <Page>
        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <Skeleton className="aspect-[3/4] w-full max-w-[300px] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-11 w-56 rounded-full" />
          </div>
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
          description="El contenido que buscas no existe o ya no está publicado."
          actionLabel="Volver al catálogo"
          onAction={() => navigate('/catalogo')}
        />
      </Page>
    )
  }

  const progress = progressQuery.data
  const myReview = reviewsQuery.data?.data.find((review) => review.user_id === user?.id)
  const relatedItems =
    related.data?.data.filter((item) => item.id !== content.id).slice(0, 4) ?? []

  function handleSave() {
    if (!isAuthenticated) {
      toast.info('Inicia sesión para guardar este contenido.')
      navigate(`/login?redirect=/contenido/${content?.id}`)
      return
    }
    toggle()
    toast.success(isSaved ? 'Eliminado de tu biblioteca' : 'Guardado en tu biblioteca')
  }

  async function handleDownload() {
    if (!isAuthenticated) {
      toast.info('Inicia sesión para descargar el PDF.')
      navigate(`/login?redirect=/contenido/${content?.id}`)
      return
    }
    if (!content) return
    setDownloading(true)
    try {
      const blob = await apiFetchBlob(`/contents/${content.id}/file`)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${content.title}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo descargar el PDF.')
    } finally {
      setDownloading(false)
    }
  }

  function handleDeleteReview() {
    if (!content) return
    deleteReview.mutate(content.id, {
      onSuccess: () => toast.success('Tu reseña fue eliminada.'),
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <Page>
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-ink-muted">
        <Link to="/catalogo">
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-14">
        <div>
          <div className="lg:sticky lg:top-24">
            <ContentCover
              title={content.title}
              author={content.author}
              type={content.type}
              coverUrl={content.cover_url}
              className="mx-auto max-w-[300px]"
            />

            <div className="mt-6 hidden space-y-2 lg:block">
              {content.has_file ? (
                <Button className="w-full" size="lg" asChild>
                  <Link to={`/leer/${content.id}`}>
                    <BookOpen className="h-4 w-4" />
                    {progress ? `Continuar en pág. ${progress.current_page}` : 'Leer ahora'}
                  </Link>
                </Button>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  <BookOpen className="h-4 w-4" />
                  PDF no disponible
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleSave}
                disabled={isPending}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {isSaved ? 'En tu biblioteca' : 'Guardar'}
              </Button>

              {content.has_file && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  {downloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Descargar PDF
                </Button>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{typeLabel(content.type)}</Badge>
            {yearOf(content.published_at) && (
              <Badge variant="muted">{yearOf(content.published_at)}</Badge>
            )}
            {content.has_file && (
              <Badge variant="gold" className="gap-1">
                <FileText className="h-3 w-3" />
                PDF disponible
              </Badge>
            )}
          </div>

          <h1 className="mt-4 text-balance font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            {content.title}
          </h1>

          <p className="mt-3 text-lg text-ink-soft">{content.author}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <RatingStars rating={content.rating_avg} count={content.rating_count} size="md" showValue />
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
              <TrendingUp className="h-4 w-4" />
              {formatNumber(content.popularity)} guardados
            </span>
          </div>

          <p className="editorial-prose mt-6 max-w-3xl text-pretty">{content.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {content.tags.map((tag) => (
              <Link
                key={tag}
                to={`/catalogo?tags=${encodeURIComponent(tag)}`}
                className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-clay/40 hover:text-clay"
              >
                #{tag}
              </Link>
            ))}
          </div>

          {progress && content.has_file && (
            <div className="mt-7 rounded-2xl border border-pine/20 bg-pine/5 p-5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-pine-dark">Tu progreso de lectura</span>
                <span className="text-ink-muted">
                  {progress.current_page} de {progress.total_pages} páginas
                </span>
              </div>
              <Progress value={progress.percentage} className="mt-3 h-2 bg-pine/10 [&>div]:bg-pine" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-ink-muted">{progress.percentage}% completado</span>
                <Button size="sm" variant="secondary" asChild>
                  <Link to={`/leer/${content.id}`}>
                    <BookOpen className="h-3.5 w-3.5" />
                    Continuar leyendo
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
            {content.has_file ? (
              <Button asChild>
                <Link to={`/leer/${content.id}`}>
                  <BookOpen className="h-4 w-4" />
                  {progress ? `Continuar en pág. ${progress.current_page}` : 'Leer ahora'}
                </Link>
              </Button>
            ) : (
              <Button disabled>
                <BookOpen className="h-4 w-4" />
                PDF no disponible
              </Button>
            )}
            <Button variant="outline" onClick={handleSave} disabled={isPending}>
              {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {isSaved ? 'Guardado' : 'Guardar'}
            </Button>
            {content.has_file && (
              <Button variant="ghost" onClick={handleDownload} disabled={downloading}>
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                PDF
              </Button>
            )}
          </div>

          <Separator className="my-8" />

          <Tabs defaultValue="reviews">
            <TabsList>
              <TabsTrigger value="reviews" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Reseñas
                <span className="rounded-full bg-muted px-1.5 text-[0.65rem] text-ink-muted">
                  {content.rating_count}
                </span>
              </TabsTrigger>
              <TabsTrigger value="details" className="gap-2">
                <FileText className="h-4 w-4" />
                Detalles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews">
              {isAuthenticated ? (
                <div className="space-y-6">
                  <ReviewForm
                    contentId={content.id}
                    initialRating={myReview?.rating}
                    initialComment={myReview?.comment ?? ''}
                  />
                  {myReview && (
                    <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm">
                      <span className="text-ink-muted">Ya tienes una reseña en este contenido.</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={handleDeleteReview}
                        disabled={deleteReview.isPending}
                      >
                        Eliminar mi reseña
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <ReviewLoginPrompt />
              )}

              <div className="mt-6">
                {reviewsQuery.isLoading ? (
                  <>
                    <ReviewCardSkeleton />
                    <ReviewCardSkeleton />
                    <ReviewCardSkeleton />
                  </>
                ) : reviewsQuery.data && reviewsQuery.data.data.length > 0 ? (
                  <>
                    {reviewsQuery.data.data.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                    {reviewsQuery.data.meta.total_pages > 1 && (
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-ink-muted">
                          Página {reviewPage} de {reviewsQuery.data.meta.total_pages}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={reviewPage <= 1}
                            onClick={() => setReviewPage((value) => value - 1)}
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={reviewPage >= reviewsQuery.data.meta.total_pages}
                            onClick={() => setReviewPage((value) => value + 1)}
                          >
                            Siguiente
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="py-8 text-center text-sm text-ink-muted">
                    Aún no hay reseñas. Sé el primero en compartir tu opinión.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  {
                    icon: CalendarDays,
                    label: 'Publicado',
                    value: formatDate(content.published_at),
                  },
                  { icon: Globe2, label: 'Idioma', value: content.language.toUpperCase() },
                  {
                    icon: Star,
                    label: 'Calificación',
                    value: `${content.rating_avg.toFixed(1)} / 5 (${content.rating_count} reseñas)`,
                  },
                  {
                    icon: Hash,
                    label: 'Identificador',
                    value: content.id,
                  },
                  {
                    icon: TrendingUp,
                    label: 'Popularidad',
                    value: `${formatNumber(content.popularity)} puntos`,
                  },
                  {
                    icon: FileText,
                    label: 'Estado',
                    value: content.status === 'published' ? 'Publicado' : content.status,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-xl bg-muted/40 p-3.5">
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                    <div className="min-w-0">
                      <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                        {item.label}
                      </dt>
                      <dd className="mt-0.5 break-words text-sm text-ink-soft">{item.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {relatedItems.length > 0 && (
        <section className="mt-16 border-t border-border/70 pt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Sigue explorando</p>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                Relacionados con {content.tags[0] ? `#${content.tags[0]}` : 'este tema'}
              </h2>
            </div>
            <Link
              to={`/catalogo?tags=${encodeURIComponent(content.tags[0] ?? '')}`}
              className="link-underline hidden text-sm sm:inline-flex"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
            {relatedItems.map((item) => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        </section>
      )}
    </Page>
  )
}
