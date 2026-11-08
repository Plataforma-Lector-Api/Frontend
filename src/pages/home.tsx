import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Compass,
  Database,
  Quote,
  Sparkles,
  TrendingUp,
  WifiOff,
} from 'lucide-react'

import { ContentCard } from '@/components/content-card'
import { ContentCover } from '@/components/content-cover'
import { SectionHeading } from '@/components/section-heading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { useContents, usePopular, useTagStats, useTopRated } from '@/hooks/use-contents'
import { useRecommendations } from '@/hooks/use-library'
import { formatNumber } from '@/lib/format'

const FALLBACK_COVERS = [
  {
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    type: 'book',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    type: 'book',
  },
  {
    title: 'Ficciones',
    author: 'Jorge Luis Borges',
    type: 'book',
  },
]

function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  )
}

export function HomePage() {
  const { isAuthenticated, user } = useAuth()
  const catalog = useContents({ page: 1, limit: 1 })
  const popular = usePopular(4)
  const topRated = useTopRated(4, 1)
  const tags = useTagStats(12)
  const recommendations = useRecommendations(4, isAuthenticated)

  const heroCovers = popular.data?.slice(0, 3) ?? []
  const totalContents = catalog.data?.meta.total

  return (
    <div className="page-enter">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-clay/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-80 w-80 rounded-full bg-pine/10 blur-3xl" />

        <div className="container relative grid gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <Badge variant="outline" className="gap-1.5 border-border bg-card/70 py-1 normal-case tracking-normal">
              <Sparkles className="h-3.5 w-3.5 text-clay" />
              Nueva temporada de lectura
            </Badge>

            <h1 className="mt-6 text-balance font-display text-5xl font-semibold leading-[1.03] tracking-tight text-ink sm:text-6xl lg:text-[4.6rem]">
              Historias que <span className="italic text-clay">te encuentran</span>.
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">
              Explora un catálogo curado de libros, artículos y tesis. Guarda lo que te
              inspira, sigue tu progreso y lee PDFs directamente en el navegador.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/catalogo">
                  Explorar catálogo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {isAuthenticated ? (
                <Button size="lg" variant="outline" asChild>
                  <Link to="/biblioteca">
                    <Bookmark className="h-4 w-4" />
                    Mi biblioteca
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" asChild>
                  <Link to="/registro">Crear cuenta gratis</Link>
                </Button>
              )}
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-clay" />
                {totalContents !== undefined ? `${formatNumber(totalContents)} títulos` : 'Catálogo curado'}
              </span>
              <span className="inline-flex items-center gap-2">
                <Database className="h-4 w-4 text-pine" />
                10 consultas MongoDB
              </span>
              <span className="inline-flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-gold" />
                Lectura en línea
              </span>
            </div>
          </div>

          <div className="relative mx-auto hidden h-[460px] w-full max-w-md lg:block">
            <div className="absolute inset-x-10 bottom-6 h-24 rounded-[50%] bg-ink/10 blur-2xl" />

            {heroCovers.length > 0
              ? heroCovers.map((content, index) => {
                  const positions = [
                    'left-0 top-16 w-52 rotate-[-7deg] animate-float',
                    'left-1/2 top-0 w-56 -translate-x-1/2 rotate-[2deg] animate-float animate-delay-200',
                    'right-0 top-20 w-52 rotate-[8deg] animate-float animate-delay-300',
                  ]
                  return (
                    <Link
                      key={content.id}
                      to={`/contenido/${content.id}`}
                      className={`absolute ${positions[index]} transition-transform duration-500 hover:z-20 hover:scale-[1.04]`}
                    >
                      <ContentCover
                        title={content.title}
                        author={content.author}
                        type={content.type}
                        coverUrl={content.cover_url}
                      />
                    </Link>
                  )
                })
              : FALLBACK_COVERS.map((content, index) => {
                  const positions = [
                    'left-0 top-16 w-52 rotate-[-7deg] animate-float',
                    'left-1/2 top-0 w-56 -translate-x-1/2 rotate-[2deg] animate-float animate-delay-200',
                    'right-0 top-20 w-52 rotate-[8deg] animate-float animate-delay-300',
                  ]
                  return (
                    <div key={content.title} className={`absolute ${positions[index]}`}>
                      <ContentCover {...content} />
                    </div>
                  )
                })}

            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-2xl border border-border bg-card/90 px-4 py-3 text-center shadow-soft backdrop-blur">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                Recomendado para ti
              </p>
              <p className="mt-1 font-display text-sm font-semibold text-ink">
                {user ? `Hola, ${user.name.split(' ')[0]}` : 'Empieza tu biblioteca hoy'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Compass,
              title: 'Descubre',
              text: 'Filtra por tipo, etiqueta, idioma y año para encontrar tu próxima lectura.',
            },
            {
              icon: Bookmark,
              title: 'Guarda',
              text: 'Construye tu biblioteca personal y recibe recomendaciones por afinidad.',
            },
            {
              icon: TrendingUp,
              title: 'Avanza',
              text: 'Retoma donde lo dejaste y visualiza tu progreso de lectura.',
            },
          ].map((feature) => (
            <div key={feature.title} className="paper-panel p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay/10 text-clay">
                <feature.icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-14 sm:py-20">
        <SectionHeading
          eyebrow="Lo que todos están leyendo"
          title="Populares esta semana"
          description="Los títulos que más se guardan en las bibliotecas de la comunidad."
          actionLabel="Ver todo el catálogo"
          actionTo="/catalogo?sort=-popularity"
        />

        <div className="mt-9">
          {popular.isLoading ? (
            <CardGridSkeleton />
          ) : popular.isError ? (
            <p className="rounded-2xl bg-destructive/5 p-5 text-sm text-destructive">
              No se pudieron cargar los contenidos populares. Verifica que la API esté en línea.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
              {popular.data?.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/40">
        <div className="container grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center sm:py-20">
          <div>
            <p className="eyebrow mb-3">Explora por tema</p>
            <h2 className="text-balance font-display text-3xl font-semibold text-ink sm:text-4xl">
              Un mapa de ideas para cada curiosidad.
            </h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-muted sm:text-base">
              Las etiquetas conectan contenidos, reseñas y recomendaciones. Elige un tema
              y el catálogo se reorganiza para ti.
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <Link to="/catalogo">
                Explorar temas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {tags.isLoading
              ? Array.from({ length: 12 }).map((_, index) => (
                  <Skeleton key={index} className="h-9 w-24 rounded-full" />
                ))
              : tags.data?.map((tag) => (
                  <Link
                    key={tag.tag}
                    to={`/catalogo?tags=${encodeURIComponent(tag.tag)}`}
                    className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium text-ink-soft transition-all hover:-translate-y-0.5 hover:border-clay/40 hover:text-clay"
                  >
                    <span>#{tag.tag}</span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] text-ink-muted group-hover:bg-clay/10 group-hover:text-clay">
                      {tag.total}
                    </span>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      <section className="container py-14 sm:py-20">
        <SectionHeading
          eyebrow="Aclamados por la comunidad"
          title="Mejor valorados"
          description="Los contenidos con las calificaciones más altas, calculadas con agregaciones de MongoDB."
          actionLabel="Ver ranking"
          actionTo="/catalogo?sort=-rating"
        />

        <div className="mt-9">
          {topRated.isLoading ? (
            <CardGridSkeleton />
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
              {topRated.data?.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          )}
        </div>
      </section>

      {isAuthenticated ? (
        <section className="container pb-14 sm:pb-20">
          <SectionHeading
            eyebrow="Hecho para ti"
            title="Recomendaciones por afinidad"
            description="Contenidos que comparten etiquetas con lo que ya guardaste, ordenados por coincidencia y popularidad."
            actionLabel="Ver más recomendaciones"
            actionTo="/biblioteca"
          />
          <div className="mt-9">
            {recommendations.isLoading ? (
              <CardGridSkeleton />
            ) : recommendations.data && recommendations.data.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
                {recommendations.data.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-ink-muted">
                Guarda algunos contenidos para activar las recomendaciones personalizadas.
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="container pb-14 sm:pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-12 text-paper sm:px-12">
            <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-clay/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-pine/30 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <Quote className="h-8 w-8 text-gold" />
                <h2 className="mt-4 max-w-2xl text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
                  “Una biblioteca personal no se compra: se descubre, se guarda y se
                  comparte.”
                </h2>
                <p className="mt-3 text-sm text-paper/60">
                  Crea tu cuenta gratis y empieza a construir la tuya.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" variant="gold" asChild>
                  <Link to="/registro">Crear cuenta</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent text-paper hover:bg-white/10 hover:text-paper"
                  asChild
                >
                  <Link to="/login">Ya tengo cuenta</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
