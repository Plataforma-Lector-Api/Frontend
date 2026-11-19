import { useEffect, useRef, useState } from 'react'
import ePub, {
  type Book,
  type Contents,
  type Location as EpubLocation,
  type NavItem,
  type Rendition,
} from 'epubjs'
import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTheme, type Theme } from '@/hooks/use-theme'
import { apiFetchBlob } from '@/lib/api'
import { cn } from '@/lib/utils'

interface EpubViewerProps {
  contentId: string
  filename: string
  initialLocation?: string | null
  onLocationChange?: (location: string, percentage: number) => void
  className?: string
}

interface TocOption {
  href: string
  label: string
  depth: number
}

interface ThemePalette {
  background: string
  color: string
  link: string
  border: string
  selection: string
}

const THEME_PALETTES: Record<Theme, ThemePalette> = {
  light: {
    background: '#fdfbf7',
    color: '#241d17',
    link: '#b8442a',
    border: '#e6ddd1',
    selection: '#dc5a3a',
  },
  sepia: {
    background: '#f4ecd8',
    color: '#3a2f24',
    link: '#a33d24',
    border: '#d8c7a8',
    selection: '#b8442a',
  },
  dark: {
    background: '#141210',
    color: '#e8e0d5',
    link: '#e98b6b',
    border: '#3a332c',
    selection: '#c96547',
  },
}

function buildThemeCss(theme: Theme): string {
  const palette = THEME_PALETTES[theme]
  return `
    html, body {
      background: ${palette.background} !important;
      color: ${palette.color} !important;
    }
    body {
      font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', serif !important;
      line-height: 1.7 !important;
    }
    body *:not(img):not(svg):not(path):not(image) {
      color: ${palette.color} !important;
      background-color: transparent !important;
      border-color: ${palette.border} !important;
    }
    body p, body li, body div {
      line-height: 1.7 !important;
    }
    a, a * {
      color: ${palette.link} !important;
    }
    ::selection {
      background: ${palette.selection} !important;
      color: #fff8f0 !important;
    }
    img, svg, image {
      max-width: 100% !important;
      height: auto !important;
    }
  `
}

function applyThemeToRendition(rendition: Rendition, theme: Theme) {
  const result = rendition.getContents() as unknown as Contents[] | Contents | undefined
  const contents = Array.isArray(result) ? result : result ? [result] : []
  const css = buildThemeCss(theme)
  for (const content of contents) {
    if (content?.document) content.addStylesheetCss(css, 'lector-theme')
  }
}

function flattenToc(items: NavItem[], depth = 0): TocOption[] {
  return items.flatMap((item) => [
    {
      href: item.href,
      label: (item.label || 'Sección').trim(),
      depth,
    },
    ...(item.subitems ? flattenToc(item.subitems, depth + 1) : []),
  ])
}

function percentageForLocation(book: Book, location: EpubLocation): number {
  const fromLocations = book.locations.percentageFromCfi(location.start.cfi)
  if (typeof fromLocations === 'number' && Number.isFinite(fromLocations)) {
    return Math.round(fromLocations * 1000) / 10
  }
  const totalSections = book.packaging?.spine?.length ?? 1
  const current = (location.start.index + 1) / Math.max(totalSections, 1)
  return Math.round(Math.min(100, current * 100) * 10) / 10
}

export function EpubViewer({
  contentId,
  filename,
  initialLocation,
  onLocationChange,
  className,
}: EpubViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const onLocationChangeRef = useRef(onLocationChange)
  const initialLocationRef = useRef(initialLocation)
  const { theme } = useTheme()
  const themeRef = useRef(theme)

  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [toc, setToc] = useState<TocOption[]>([])
  const [currentHref, setCurrentHref] = useState('')
  const [percentage, setPercentage] = useState(0)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange
  }, [onLocationChange])

  useEffect(() => {
    themeRef.current = theme
    if (renditionRef.current) applyThemeToRendition(renditionRef.current, theme)
  }, [theme])

  useEffect(() => {
    let active = true
    let objectUrl: string | null = null
    let book: Book | null = null
    let rendition: Rendition | null = null
    let resizeObserver: ResizeObserver | null = null

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!rendition) return
      const target = event.target as HTMLElement | null
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      if (event.key === 'ArrowLeft') {
        void rendition.prev().catch(() => undefined)
      } else {
        void rendition.next().catch(() => undefined)
      }
    }

    async function mount() {
      try {
        setLoading(true)
        setLoadError(null)

        const blob = await apiFetchBlob(`/contents/${contentId}/file`)
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)

        const buffer = await blob.arrayBuffer()
        if (!active) return

        book = ePub(buffer)
        await book.ready
        if (!active) return

        const element = containerRef.current
        if (!element) return

        rendition = book.renderTo(element, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          spread: 'none',
          allowScriptedContent: false,
        })
        renditionRef.current = rendition

        rendition.hooks.content.register((contents: Contents) => {
          contents.addStylesheetCss(buildThemeCss(themeRef.current), 'lector-theme')
          contents.document.addEventListener('keydown', handleKeyDown)
        })

        rendition.on('relocated', (location: EpubLocation) => {
          if (!active) return
          setCurrentHref(location.start.href)
          setAtStart(location.atStart)
          setAtEnd(location.atEnd)
          const nextPercentage = percentageForLocation(book as Book, location)
          setPercentage(nextPercentage)
          onLocationChangeRef.current?.(location.start.cfi, nextPercentage)
        })

        window.addEventListener('keydown', handleKeyDown)

        try {
          const navigation = await book.loaded.navigation
          if (active) setToc(flattenToc(navigation.toc))
        } catch {
          if (active) setToc([])
        }

        try {
          await rendition.display(initialLocationRef.current || undefined)
        } catch {
          if (!active) return
          await rendition.display()
        }
        if (!active) return

        resizeObserver = new ResizeObserver(() => {
          if (!active || !rendition) return
          const width = element.clientWidth
          const height = element.clientHeight
          if (width > 0 && height > 0) rendition.resize(width, height)
        })
        resizeObserver.observe(element)

        setLoading(false)

        book.locations
          .generate(1600)
          .then(() => {
            if (active && rendition) void rendition.reportLocation()
          })
          .catch(() => undefined)
      } catch (error) {
        if (!active) return
        setLoadError(
          error instanceof Error ? error.message : 'No se pudo cargar el archivo EPUB.',
        )
        setLoading(false)
      }
    }

    void mount()

    return () => {
      active = false
      window.removeEventListener('keydown', handleKeyDown)
      resizeObserver?.disconnect()
      renditionRef.current = null
      if (objectUrl) URL.revokeObjectURL(objectUrl)

      const pendingBook = book
      const pendingRendition = rendition

      // epub.js procesa start/attach/display en una cola basada en
      // requestAnimationFrame. Si se destruye el libro antes de que la cola
      // termine, Rendition.start lee un book ya liberado y lanza
      // "Cannot read properties of undefined (reading 'package')".
      // Esperamos a que la carga y la cola se asienten antes de destruir.
      void (async () => {
        if (pendingBook) {
          try {
            await pendingBook.opened
          } catch {
            /* Una carga fallida también debe poder limpiarse. */
          }
          try {
            await pendingBook.ready
          } catch {
            /* La limpieza no depende de que el EPUB sea válido. */
          }
        }

        if (pendingRendition) {
          // `started` se resuelve al final de Rendition.start; esperar aquí
          // evita destruir el libro mientras la cola aún va a ejecutar start.
          try {
            await pendingRendition.started
          } catch {
            /* Si el arranque falla, igual intentamos limpiar. */
          }
          // Después de start quedan attach y display en la misma cola.
          // Drenarla completamente antes de destruir evita errores internos.
          try {
            await pendingRendition.q.run()
          } catch {
            /* La cola puede rechazar si el CFI inicial no era válido. */
          }
          try {
            pendingRendition.destroy()
          } catch {
            /* La limpieza del visor no debe romper la navegación. */
          }
        }

        try {
          pendingBook?.destroy()
        } catch {
          /* La limpieza del libro no debe romper la navegación. */
        }
      })()
    }
  }, [contentId])

  const palette = THEME_PALETTES[theme]
  const activeHref = (() => {
    if (!currentHref) return ''
    const exact = toc.find((item) => item.href === currentHref)
    if (exact) return exact.href
    const currentBase = currentHref.split('#')[0]
    const partial = toc.find((item) => item.href.split('#')[0] === currentBase)
    return partial?.href ?? ''
  })()

  function goTo(target: string) {
    void renditionRef.current?.display(target).catch(() => undefined)
  }

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-border',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card/90 px-3 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => void renditionRef.current?.prev().catch(() => undefined)}
            disabled={loading || atStart}
            aria-label="Sección anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => void renditionRef.current?.next().catch(() => undefined)}
            disabled={loading || atEnd}
            aria-label="Sección siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {toc.length > 0 ? (
            <Select value={activeHref} onValueChange={goTo}>
              <SelectTrigger className="h-8 w-[11rem] text-xs sm:w-[16rem]">
                <SelectValue placeholder="Índice del libro" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {toc.map((item, index) => (
                  <SelectItem key={`${item.href}-${index}`} value={item.href}>
                    <span style={{ paddingLeft: `${Math.min(item.depth, 3) * 0.75}rem` }}>
                      {item.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="px-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
              EPUB
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-muted">
            {Math.round(percentage)}%
          </span>
          {blobUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={blobUrl} download={filename}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Descargar</span>
              </a>
            </Button>
          )}
        </div>
      </div>

      <div
        className="relative h-[70vh] min-h-[420px] w-full"
        style={{ backgroundColor: palette.background }}
      >
        <div ref={containerRef} className="h-full w-full" />

        {loading && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-muted">
            <Loader2 className="h-7 w-7 animate-spin text-clay" />
            <p className="text-sm">Preparando el libro desde GridFS…</p>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 p-8 text-center">
            <p className="font-medium text-destructive">No se pudo cargar el EPUB</p>
            <p className="max-w-md text-sm text-ink-muted">{loadError}</p>
          </div>
        )}
      </div>
    </div>
  )
}
