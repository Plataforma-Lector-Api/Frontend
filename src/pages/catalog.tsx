import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react'

import { ContentCard } from '@/components/content-card'
import { EmptyState } from '@/components/empty-state'
import { Page } from '@/components/layout/page'
import { Pagination } from '@/components/pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useContentSearch, useContents, useTagStats } from '@/hooks/use-contents'
import { cn } from '@/lib/utils'

const CONTENT_TYPES = [
  { value: 'all', label: 'Todos' },
  { value: 'book', label: 'Libros' },
  { value: 'article', label: 'Artículos' },
  { value: 'thesis', label: 'Tesis' },
  { value: 'magazine', label: 'Revistas' },
  { value: 'other', label: 'Ensayos' },
]

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Más recientes' },
  { value: '-popularity', label: 'Más populares' },
  { value: '-rating', label: 'Mejor valorados' },
  { value: 'title', label: 'Título (A-Z)' },
  { value: '-published_at', label: 'Año de publicación' },
]

const LANGUAGES = [
  { value: 'all', label: 'Todos los idiomas' },
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
  { value: 'pt', label: 'Portugués' },
  { value: 'fr', label: 'Francés' },
]

const PAGE_SIZE = 12

function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [showFilters, setShowFilters] = useState(false)

  const q = searchParams.get('q') ?? ''
  const tags = useMemo(
    () => (searchParams.get('tags') ?? '').split(',').filter(Boolean),
    [searchParams],
  )
  const type = searchParams.get('type') ?? 'all'
  const sort = searchParams.get('sort') ?? '-created_at'
  const language = searchParams.get('language') ?? 'all'
  const yearFrom = searchParams.get('year_from') ?? ''
  const yearTo = searchParams.get('year_to') ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)

  const tagStats = useTagStats(18)
  const catalogQuery = useContents({
    page,
    limit: PAGE_SIZE,
    tags: tags.join(',') || undefined,
    type: type === 'all' ? undefined : type,
    language: language === 'all' ? undefined : language,
    year_from: yearFrom || undefined,
    year_to: yearTo || undefined,
    sort,
  })
  const searchQuery = useContentSearch(q, page, PAGE_SIZE)
  const activeQuery = q ? searchQuery : catalogQuery

  useEffect(() => {
    setSearchInput(q)
  }, [q])

  function updateParam(key: string, value: string | undefined, resetPage = true) {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    if (resetPage && key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  function toggleTag(tag: string) {
    const nextTags = tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag]
    updateParam('tags', nextTags.join(',') || undefined)
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    updateParam('q', searchInput.trim() || undefined)
  }

  function clearFilters() {
    setSearchInput('')
    setSearchParams(new URLSearchParams())
  }

  const activeFilterCount =
    tags.length +
    (type !== 'all' ? 1 : 0) +
    (language !== 'all' ? 1 : 0) +
    (yearFrom ? 1 : 0) +
    (yearTo ? 1 : 0)

  const total = activeQuery.data?.meta.total ?? 0
  const totalPages = activeQuery.data?.meta.total_pages ?? 0

  const filtersPanel = (
    <div className="space-y-6">
      <div>
        <Label className="text-xs uppercase tracking-[0.16em] text-ink-muted">Buscar</Label>
        <form onSubmit={handleSearch} className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Título, autor, tema…"
            className="pl-9"
          />
        </form>
      </div>

      <div>
        <Label className="text-xs uppercase tracking-[0.16em] text-ink-muted">Tipo</Label>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {CONTENT_TYPES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => updateParam('type', item.value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                type === item.value
                  ? 'border-ink bg-ink text-paper'
                  : 'border-border bg-card/60 text-ink-soft hover:border-ink/30',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs uppercase tracking-[0.16em] text-ink-muted">Etiquetas</Label>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {tagStats.isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-7 w-16 rounded-full" />
              ))
            : tagStats.data?.map((tag) => (
                <button
                  key={tag.tag}
                  type="button"
                  onClick={() => toggleTag(tag.tag)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                    tags.includes(tag.tag)
                      ? 'border-clay bg-clay text-white'
                      : 'border-border bg-card/60 text-ink-soft hover:border-clay/40 hover:text-clay',
                  )}
                >
                  #{tag.tag}
                </button>
              ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="year-from" className="text-xs uppercase tracking-[0.16em] text-ink-muted">
            Año desde
          </Label>
          <Input
            id="year-from"
            type="number"
            min={0}
            max={2100}
            placeholder="1900"
            value={yearFrom}
            onChange={(event) => updateParam('year_from', event.target.value || undefined)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="year-to" className="text-xs uppercase tracking-[0.16em] text-ink-muted">
            Año hasta
          </Label>
          <Input
            id="year-to"
            type="number"
            min={0}
            max={2100}
            placeholder="2026"
            value={yearTo}
            onChange={(event) => updateParam('year_to', event.target.value || undefined)}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs uppercase tracking-[0.16em] text-ink-muted">Idioma</Label>
        <Select value={language} onValueChange={(value) => updateParam('language', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Todos los idiomas" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!q && (
        <div>
          <Label className="text-xs uppercase tracking-[0.16em] text-ink-muted">Ordenar por</Label>
          <Select value={sort} onValueChange={(value) => updateParam('sort', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Más recientes" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="h-4 w-4" />
        Limpiar filtros
      </Button>
    </div>
  )

  return (
    <Page>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Explora la colección</p>
          <h1 className="text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {q ? `Resultados para “${q}”` : 'Catálogo'}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-ink-muted sm:text-base">
            {q
              ? 'Búsqueda full-text sobre título, autor, descripción y etiquetas, ordenada por relevancia.'
              : 'Filtra por tipo, etiqueta, idioma y año. Cada búsqueda se resuelve con consultas y agregaciones de MongoDB.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!activeQuery.isLoading && (
            <Badge variant="muted" className="normal-case tracking-normal">
              {total} {total === 1 ? 'resultado' : 'resultados'}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowFilters((value) => !value)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-clay px-1.5 text-[0.65rem] text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border/80 bg-card/60 p-5">
            <div className="mb-5 flex items-center gap-2">
              <Filter className="h-4 w-4 text-clay" />
              <h2 className="text-sm font-semibold text-ink">Filtros</h2>
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-auto">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            {filtersPanel}
          </div>
        </aside>

        {showFilters && (
          <aside className="rounded-2xl border border-border bg-card p-5 lg:hidden">
            {filtersPanel}
          </aside>
        )}

        <section>
          {activeQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : activeQuery.isError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <p className="font-medium text-destructive">No se pudo cargar el catálogo</p>
              <p className="mt-2 text-sm text-ink-muted">
                Verifica que la API esté en ejecución y que la URL configurada sea correcta.
              </p>
            </div>
          ) : activeQuery.data && activeQuery.data.data.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3">
                {activeQuery.data.data.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(nextPage) => updateParam('page', String(nextPage), false)}
                className="mt-12"
              />
            </>
          ) : (
            <EmptyState
              icon={Search}
              title="No encontramos resultados"
              description="Prueba con otras palabras, quita algunos filtros o explora las etiquetas más populares."
              actionLabel="Limpiar filtros"
              onAction={clearFilters}
            />
          )}
        </section>
      </div>
    </Page>
  )
}
