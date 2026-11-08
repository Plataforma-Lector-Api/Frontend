import { BookOpen, Database, ExternalLink, Layers, Terminal } from 'lucide-react'

import { Page } from '@/components/layout/page'
import { QueryCard } from '@/components/query-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryCatalog } from '@/hooks/use-queries'
import { API_URL } from '@/lib/api'

const swaggerUrl = `${API_URL.replace(/\/api\/v1$/, '')}/docs`

export function QueriesPage() {
  const { data, isLoading, isError } = useQueryCatalog()

  return (
    <Page>
      <div className="mb-10">
        <Badge variant="outline" className="mb-4 gap-1.5 normal-case tracking-normal">
          <Database className="h-3.5 w-3.5 text-pine" />
          MongoDB · Aggregation Framework
        </Badge>
        <h1 className="text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Las 10 consultas MongoDB
        </h1>
        <p className="mt-4 max-w-3xl text-pretty text-sm leading-relaxed text-ink-muted sm:text-base">
          Cada tarjeta ejecuta una consulta real contra la base de datos y muestra la
          respuesta en vivo con su código HTTP y tiempo de ejecución. Las mismas rutas están
          documentadas en Swagger, donde también puedes probarlas con tu token.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <a href={swaggerUrl} target="_blank" rel="noreferrer">
              <Terminal className="h-4 w-4" />
              Abrir Swagger
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`${API_URL.replace(/\/api\/v1$/, '')}/redoc`} target="_blank" rel="noreferrer">
              <BookOpen className="h-4 w-4" />
              ReDoc
            </a>
          </Button>
        </div>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Layers,
            title: 'Agregaciones reales',
            text: '$match, $group, $lookup, $facet, $unwind, $text y más operadores en producción.',
          },
          {
            icon: Database,
            title: 'Índices optimizados',
            text: 'Cada consulta se apoya en índices creados automáticamente al arrancar la API.',
          },
          {
            icon: Terminal,
            title: 'Ejecución en vivo',
            text: 'Presiona “Ejecutar consulta” para ver la respuesta real de MongoDB al instante.',
          },
        ].map((item) => (
          <div key={item.title} className="paper-panel p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pine/10 text-pine">
              <item.icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <h2 className="mt-3 font-display text-lg font-semibold text-ink">{item.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.text}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-3xl" />
          ))}
        </div>
      ) : isError || !data ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="font-medium text-destructive">No se pudo cargar el catálogo de consultas</p>
          <p className="mt-2 text-sm text-ink-muted">
            Verifica que la API esté en ejecución en la URL configurada.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {data.map((query) => (
            <QueryCard key={query.number} query={query} />
          ))}
        </div>
      )}
    </Page>
  )
}
