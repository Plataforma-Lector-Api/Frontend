import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Database,
  FileText,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Page } from '@/components/layout/page'
import { RatingStars } from '@/components/rating-stars'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/hooks/use-admin'
import { formatNumber, relativeDate, typeLabel } from '@/lib/format'
import { coverPalette } from '@/lib/utils'

const CHART_COLORS = ['#dc5a3a', '#2f6f64', '#d9a441', '#3d5a80', '#7d4a67']

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useDashboard()

  const monthData = (data?.users_per_month ?? []).map((item) => ({
    month: item.month,
    usuarios: item.count,
  }))

  const typeData = (data?.contents_per_type ?? []).map((item) => ({
    name: typeLabel(item.type),
    value: item.count,
  }))

  return (
    <Page>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Panel administrativo</p>
          <h1 className="text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Resumen de la plataforma
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-ink-muted sm:text-base">
            Métricas globales calculadas con la consulta MongoDB #10, que combina agregaciones
            por fecha, tipo y etiqueta.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/contenidos">
              <FileText className="h-4 w-4" />
              Contenidos
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/usuarios">
              <Users className="h-4 w-4" />
              Usuarios
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError || !data ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="font-medium text-destructive">No se pudo cargar el dashboard</p>
          <p className="mt-2 text-sm text-ink-muted">
            Verifica que la API esté en ejecución y que tu sesión tenga permisos de
            administrador.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Usuarios"
              value={formatNumber(data.totals.users ?? 0)}
              hint="Cuentas registradas"
              icon={Users}
              tone="clay"
            />
            <StatCard
              label="Contenidos"
              value={formatNumber(data.totals.contents ?? 0)}
              hint="Títulos en el catálogo"
              icon={BookOpen}
              tone="pine"
            />
            <StatCard
              label="Guardados"
              value={formatNumber(data.totals.collections ?? 0)}
              hint="Interacciones de biblioteca"
              icon={BookMarked}
              tone="gold"
            />
            <StatCard
              label="Reseñas"
              value={formatNumber(data.totals.reviews ?? 0)}
              hint={`Promedio ${data.average_rating.toFixed(2)} / 5`}
              icon={MessageSquare}
              tone="ink"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="paper-panel p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">
                    Nuevos usuarios por mes
                  </h2>
                  <p className="mt-1 text-xs text-ink-muted">
                    Agregación con <code className="font-mono">$dateToString</code> y{' '}
                    <code className="font-mono">$group</code>.
                  </p>
                </div>
                <Badge variant="secondary">
                  <TrendingUp className="h-3 w-3" />
                  Últimos 12 meses
                </Badge>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthData} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e0d6" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#7a7268' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#7a7268' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e7e0d6',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="usuarios" fill="#dc5a3a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="paper-panel p-6">
              <div className="mb-5">
                <h2 className="font-display text-xl font-semibold text-ink">
                  Contenidos por tipo
                </h2>
                <p className="mt-1 text-xs text-ink-muted">
                  Distribución del catálogo por formato.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="h-48 w-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={44}
                        outerRadius={74}
                        paddingAngle={3}
                      >
                        {typeData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid #e7e0d6',
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <ul className="w-full space-y-2">
                  {typeData.map((item, index) => (
                    <li key={item.name} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="flex-1 text-ink-soft">{item.name}</span>
                      <span className="font-semibold text-ink">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="paper-panel p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">
                    Etiquetas destacadas
                  </h2>
                  <p className="mt-1 text-xs text-ink-muted">
                    Consulta #6 con <code className="font-mono">$unwind</code> sobre etiquetas.
                  </p>
                </div>
                <Database className="h-5 w-5 text-pine" />
              </div>

              <ul className="space-y-2.5">
                {data.top_tags.map((tag) => (
                  <li
                    key={tag.tag}
                    className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/50 px-3 py-2"
                  >
                    <span className="font-mono text-xs text-clay-dark">#{tag.tag}</span>
                    <span className="text-xs text-ink-muted">{tag.total} contenidos</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-ink">
                      <Star className="h-3 w-3 fill-gold text-gold" />
                      {tag.avg_rating.toFixed(2)}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {formatNumber(tag.total_popularity)} pop.
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="paper-panel p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">
                    Más guardados
                  </h2>
                  <p className="mt-1 text-xs text-ink-muted">
                    Consulta #7 con <code className="font-mono">$lookup</code> a contenidos.
                  </p>
                </div>
                <BookMarked className="h-5 w-5 text-clay" />
              </div>

              <ol className="space-y-2.5">
                {data.top_contents.map((item, index) => {
                  const palette = coverPalette(item.content.title)
                  return (
                    <li key={item.content.id}>
                      <Link
                        to={`/contenido/${item.content.id}`}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60"
                      >
                        <span
                          className="flex h-9 w-7 shrink-0 items-center justify-center rounded-md font-display text-xs font-semibold text-white"
                          style={{
                            background: `linear-gradient(150deg, ${palette.from}, ${palette.to})`,
                          }}
                        >
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">
                            {item.content.title}
                          </span>
                          <span className="block truncate text-xs text-ink-muted">
                            {item.content.author}
                          </span>
                        </span>
                        <Badge variant="muted" className="shrink-0 normal-case tracking-normal">
                          {item.saves} guardados
                        </Badge>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </section>
          </div>

          <section className="paper-panel p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">
                  Reseñas recientes
                </h2>
                <p className="mt-1 text-xs text-ink-muted">
                  Últimas opiniones de la comunidad con datos de usuario y contenido.
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/catalogo?sort=-rating">
                  Ver catálogo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {data.recent_reviews.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-muted">Aún no hay reseñas.</p>
            ) : (
              <ul className="divide-y divide-border/70">
                {data.recent_reviews.map((review, index) => (
                  <li key={index} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-ink">
                          {review.user_name ?? 'Lector'}
                        </span>
                        <span className="text-xs text-ink-muted">sobre</span>
                        <span className="text-sm font-medium text-clay-dark">
                          {review.content_title ?? 'Contenido'}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-1 text-pretty text-sm leading-relaxed text-ink-soft">
                          “{review.comment}”
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <RatingStars rating={review.rating} />
                      <span className="text-xs text-ink-muted">
                        {relativeDate(review.created_at)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Page>
  )
}
