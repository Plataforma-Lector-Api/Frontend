import { useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  Database,
  Loader2,
  Play,
  Terminal,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApiError, apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { QueryInfo } from '@/types'

interface QueryCardProps {
  query: QueryInfo
}

interface ExecutionMeta {
  status: number
  ms: number
}

export function QueryCard({ query }: QueryCardProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<ExecutionMeta | null>(null)
  const [expanded, setExpanded] = useState(false)

  async function execute() {
    setLoading(true)
    setError(null)
    setResult(null)
    setMeta(null)
    const started = performance.now()
    try {
      const path = query.endpoint.replace(/^\/api\/v1/, '')
      const data = await apiFetch<unknown>(path)
      setResult(data)
      setMeta({ status: 200, ms: Math.round(performance.now() - started) })
    } catch (caught) {
      const apiError = caught instanceof ApiError ? caught : null
      setError(apiError ? `${apiError.status} · ${apiError.message}` : 'No se pudo conectar con la API.')
      setMeta({
        status: apiError?.status ?? 0,
        ms: Math.round(performance.now() - started),
      })
    } finally {
      setLoading(false)
    }
  }

  const serialized = result === null ? '' : JSON.stringify(result, null, 2)
  const preview = expanded ? serialized : serialized.slice(0, 1400)

  return (
    <article className="paper-panel flex flex-col overflow-hidden">
      <div className="border-b border-border/70 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-display text-sm font-semibold text-paper">
              {String(query.number).padStart(2, '0')}
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold leading-tight text-ink">
                {query.name}
              </h3>
              <p className="mt-0.5 text-xs text-ink-muted">Consulta MongoDB #{query.number}</p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {query.method}
          </Badge>
        </div>

        <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-soft">
          {query.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {query.operators.map((operator) => (
            <span
              key={operator}
              className="rounded-md bg-ink/[0.045] px-2 py-1 font-mono text-[0.68rem] text-ink-soft"
            >
              {operator}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 px-5 py-4">
        <div className="flex items-start gap-2 rounded-xl bg-muted/60 p-3">
          <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
          <code className="break-all font-mono text-xs text-ink-soft">{query.endpoint}</code>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <Database className="h-3.5 w-3.5" />
          <span className="font-medium">Índice:</span>
          <span>{query.index}</span>
        </div>

        <Button onClick={execute} disabled={loading} className="w-full" variant="secondary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {loading ? 'Ejecutando…' : 'Ejecutar consulta'}
        </Button>
      </div>

      {(result !== null || error) && (
        <div className="border-t border-border/70 bg-ink/[0.025] px-5 py-4">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
            {meta && (
              <>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 font-semibold',
                    meta.status >= 200 && meta.status < 300 ? 'text-pine' : 'text-destructive',
                  )}
                >
                  {meta.status >= 200 && meta.status < 300 ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  HTTP {meta.status || 'error'}
                </span>
                <span className="inline-flex items-center gap-1 text-ink-muted">
                  <Clock3 className="h-3.5 w-3.5" />
                  {meta.ms} ms
                </span>
              </>
            )}
          </div>

          {error ? (
            <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          ) : (
            <>
              <pre className="scrollbar-thin max-h-72 overflow-auto rounded-xl bg-ink p-4 font-mono text-[0.7rem] leading-relaxed text-paper/90">
                {preview}
                {!expanded && serialized.length > preview.length ? '\n…' : ''}
              </pre>
              {serialized.length > 1400 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded((value) => !value)}
                  className="mt-2"
                >
                  {expanded ? 'Ver menos' : 'Ver respuesta completa'}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </article>
  )
}
