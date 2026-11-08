import type { ContentType } from '@/types'

const dateFormatter = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const longDateFormatter = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const numberFormatter = new Intl.NumberFormat('es')

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return dateFormatter.format(date)
}

export function formatLongDate(value: string | null | undefined): string {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return longDateFormatter.format(date)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatRating(value: number): string {
  return value.toFixed(1)
}

export function relativeDate(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  return formatDate(value)
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  book: 'Libro',
  article: 'Artículo',
  thesis: 'Tesis',
  magazine: 'Revista',
  other: 'Ensayo',
}

export const CONTENT_STATUS_LABELS = {
  published: 'Publicado',
  draft: 'Borrador',
  archived: 'Archivado',
} as const

export function typeLabel(type: string): string {
  return CONTENT_TYPE_LABELS[type as ContentType] ?? 'Contenido'
}

export function yearOf(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return String(date.getFullYear())
}
