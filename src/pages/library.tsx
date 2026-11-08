import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Library,
  Sparkles,
} from 'lucide-react'

import { ContentCard } from '@/components/content-card'
import { ContentCover } from '@/components/content-cover'
import { EmptyState } from '@/components/empty-state'
import { Page } from '@/components/layout/page'
import { SectionHeading } from '@/components/section-heading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import {
  useLibrary,
  useProgressList,
  useRecommendations,
} from '@/hooks/use-library'

function LibrarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  )
}

export function LibraryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const library = useLibrary(1, 40)
  const progress = useProgressList(true, 20)
  const recommendations = useRecommendations(4, true)

  const saved = library.data?.data ?? []
  const inProgress = (progress.data ?? []).filter((item) => item.percentage < 100)
  const completed = (progress.data ?? []).filter((item) => item.percentage >= 100)

  return (
    <Page>
      <div className="mb-10">
        <p className="eyebrow mb-2">Tu espacio de lectura</p>
        <h1 className="text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Mi biblioteca
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-ink-muted sm:text-base">
          Hola, {user?.name.split(' ')[0]}. Aquí viven los contenidos que guardaste, tus
          lecturas en curso y las recomendaciones que MongoDB preparó para ti.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="paper-panel flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-clay/10 text-clay">
            <BookMarked className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-2xl font-semibold text-ink">{saved.length}</p>
            <p className="text-xs text-ink-muted">Contenidos guardados</p>
          </div>
        </div>
        <div className="paper-panel flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pine/10 text-pine">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-2xl font-semibold text-ink">{inProgress.length}</p>
            <p className="text-xs text-ink-muted">Lecturas en curso</p>
          </div>
        </div>
        <div className="paper-panel flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/20 text-[#8a6417]">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-2xl font-semibold text-ink">{completed.length}</p>
            <p className="text-xs text-ink-muted">Lecturas completadas</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="saved">
        <TabsList>
          <TabsTrigger value="saved" className="gap-2">
            <BookMarked className="h-4 w-4" />
            Guardados
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Continuar leyendo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved">
          {library.isLoading ? (
            <LibrarySkeleton />
          ) : saved.length === 0 ? (
            <EmptyState
              icon={Library}
              title="Tu biblioteca está vacía"
              description="Explora el catálogo y guarda los contenidos que quieras leer o releer. Aparecerán aquí."
              actionLabel="Explorar catálogo"
              onAction={() => navigate('/catalogo')}
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
              {saved.map((item) => (
                <ContentCard key={item.content.id} content={item.content} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress">
          {progress.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          ) : (progress.data ?? []).length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Aún no has empezado a leer"
              description="Abre un contenido con PDF y tu progreso se guardará automáticamente página a página."
              actionLabel="Ver catálogo"
              onAction={() => navigate('/catalogo')}
            />
          ) : (
            <div className="space-y-3">
              {(progress.data ?? []).map((item) => {
                const content = item.content
                if (!content) return null
                return (
                  <div
                    key={item.content_id}
                    className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-soft sm:flex-row sm:items-center"
                  >
                    <Link to={`/contenido/${content.id}`} className="w-16 shrink-0 sm:w-20">
                      <ContentCover
                        title={content.title}
                        author={content.author}
                        type={content.type}
                        coverUrl={content.cover_url}
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="muted">{content.type === 'book' ? 'Libro' : 'Contenido'}</Badge>
                        {item.percentage >= 100 && <Badge variant="secondary">Completado</Badge>}
                      </div>
                      <Link
                        to={`/contenido/${content.id}`}
                        className="mt-1.5 block truncate font-display text-lg font-semibold text-ink hover:text-clay"
                      >
                        {content.title}
                      </Link>
                      <p className="text-sm text-ink-muted">{content.author}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={item.percentage} className="h-1.5 max-w-sm" />
                        <span className="shrink-0 text-xs text-ink-muted">
                          {item.percentage}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">
                        Página {item.current_page} de {item.total_pages}
                      </p>
                    </div>

                    {content.has_file ? (
                      <Button size="sm" asChild className="shrink-0 self-start sm:self-center">
                        <Link to={`/leer/${content.id}`}>
                          <BookOpen className="h-4 w-4" />
                          {item.percentage >= 100 ? 'Releer' : 'Continuar'}
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="shrink-0 self-start sm:self-center"
                      >
                        <Link to={`/contenido/${content.id}`}>
                          <BookOpen className="h-4 w-4" />
                          Ver detalle
                        </Link>
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <section className="mt-16 border-t border-border/70 pt-10">
        <SectionHeading
          eyebrow="Según tus etiquetas"
          title="Recomendaciones para ti"
          description="Una selección generada con $lookup, $setIntersection y $reduce sobre tus contenidos guardados."
          actionLabel="Ver catálogo"
          actionTo="/catalogo"
        />

        <div className="mt-8">
          {recommendations.isLoading ? (
            <LibrarySkeleton />
          ) : recommendations.data && recommendations.data.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
              {recommendations.data.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-ink-muted">
              Guarda más contenidos para que las recomendaciones aparezcan aquí.
            </div>
          )}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-pine/5 p-5">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-pine" />
          <p className="text-sm text-ink-soft">
            ¿Buscas algo nuevo? El catálogo se actualiza con cada contenido publicado.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link to="/catalogo">
            Explorar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Page>
  )
}
