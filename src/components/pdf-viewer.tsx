import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
} from 'lucide-react'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiFetchBlob } from '@/lib/api'
import { cn } from '@/lib/utils'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

interface PdfViewerProps {
  contentId: string
  filename: string
  initialPage?: number
  onPageChange?: (page: number, totalPages: number) => void
  className?: string
}

export function PdfViewer({
  contentId,
  filename,
  initialPage = 1,
  onPageChange,
  className,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [pageInput, setPageInput] = useState(String(initialPage))
  const [scale, setScale] = useState(1)
  const [containerWidth, setContainerWidth] = useState(900)

  useEffect(() => {
    let active = true
    let objectUrl: string | null = null

    apiFetchBlob(`/contents/${contentId}/file`)
      .then((blob) => {
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch((error: Error) => {
        if (active) setLoadError(error.message)
      })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [contentId])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) setContainerWidth(width)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  function goToPage(nextPage: number) {
    const total = numPages || 1
    const clamped = Math.max(1, Math.min(total, nextPage))
    setPage(clamped)
    setPageInput(String(clamped))
    onPageChange?.(clamped, numPages)
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
      if (event.key === 'ArrowLeft') {
        setPage((current) => {
          const next = Math.max(1, current - 1)
          onPageChange?.(next, numPages)
          return next
        })
      }
      if (event.key === 'ArrowRight') {
        setPage((current) => {
          const next = Math.min(numPages || 1, current + 1)
          onPageChange?.(next, numPages)
          return next
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [numPages, onPageChange])

  const pageWidth = Math.min(Math.max(containerWidth - 32, 280), 900) * scale

  if (loadError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="font-medium text-destructive">No se pudo cargar el PDF</p>
        <p className="mt-2 text-sm text-ink-muted">{loadError}</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-2xl border border-border bg-paper-deep', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card/90 px-3 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5 text-sm">
            <Input
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
              onBlur={() => {
                const parsed = Number(pageInput)
                if (Number.isFinite(parsed)) goToPage(parsed)
                else setPageInput(String(page))
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  const parsed = Number(pageInput)
                  if (Number.isFinite(parsed)) goToPage(parsed)
                }
              }}
              className="h-8 w-12 px-1 text-center text-xs"
              inputMode="numeric"
              aria-label="Ir a página"
            />
            <span className="whitespace-nowrap text-xs text-ink-muted">
              de {numPages || '—'}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => goToPage(page + 1)}
            disabled={page >= numPages}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setScale((value) => Math.max(0.6, Number((value - 0.15).toFixed(2))))}
            aria-label="Reducir zoom"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs font-medium text-ink-muted">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setScale((value) => Math.min(2.4, Number((value + 0.15).toFixed(2))))}
            aria-label="Aumentar zoom"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setScale(1)}
            aria-label="Restablecer zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
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

      <div ref={containerRef} className="scrollbar-thin max-h-[78vh] overflow-auto p-4">
        {!blobUrl ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink-muted">
            <Loader2 className="h-7 w-7 animate-spin text-clay" />
            <p className="text-sm">Cargando documento desde GridFS…</p>
          </div>
        ) : (
          <Document
            file={blobUrl}
            onLoadSuccess={({ numPages: total }) => {
              setNumPages(total)
              const safePage = Math.min(Math.max(initialPage, 1), total)
              setPage(safePage)
              setPageInput(String(safePage))
              onPageChange?.(safePage, total)
            }}
            onLoadError={(error) => setLoadError(error.message)}
            loading={
              <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-clay" />
              </div>
            }
          >
            {numPages > 0 && page >= 1 && page <= numPages && (
              <Page
                pageNumber={page}
                width={pageWidth}
                renderAnnotationLayer
                renderTextLayer
                className="mx-auto overflow-hidden rounded-lg bg-white shadow-lift"
              />
            )}
          </Document>
        )}
      </div>
    </div>
  )
}
