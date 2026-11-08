import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { Page } from '@/components/layout/page'
import { Pagination } from '@/components/pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  useAdminContents,
  useCreateContent,
  useDeleteContent,
  useDeletePdf,
  useUpdateContent,
  useUploadPdf,
} from '@/hooks/use-admin'
import { CONTENT_STATUS_LABELS, typeLabel, yearOf } from '@/lib/format'
import type { Content, ContentInput } from '@/types'

const contentSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(200),
  author: z.string().min(1, 'El autor es obligatorio').max(150),
  type: z.enum(['book', 'article', 'thesis', 'magazine', 'other']),
  description: z.string().max(2000),
  tags: z.string().max(300),
  language: z.string().min(2, 'Indica un idioma').max(10),
  published_at: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  cover_url: z.string().url('Debe ser una URL válida').or(z.literal('')).optional(),
})

type ContentForm = z.infer<typeof contentSchema>

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'published', label: 'Publicados' },
  { value: 'draft', label: 'Borradores' },
  { value: 'archived', label: 'Archivados' },
]

function statusVariant(status: string) {
  if (status === 'published') return 'secondary' as const
  if (status === 'draft') return 'gold' as const
  return 'muted' as const
}

function PdfUploadButton({ content }: { content: Content }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadPdf()
  const remove = useDeletePdf()

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Selecciona un archivo PDF.')
      return
    }
    upload.mutate(
      { contentId: content.id, file },
      {
        onSuccess: () => toast.success(`PDF de “${content.title}” actualizado.`),
        onError: (error) => toast.error(error.message),
      },
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFile}
      />
      {content.has_file ? (
        <Badge variant="gold" className="gap-1">
          <FileText className="h-3 w-3" />
          PDF
        </Badge>
      ) : (
        <Badge variant="muted">Sin PDF</Badge>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => inputRef.current?.click()}
        disabled={upload.isPending}
        aria-label={content.has_file ? 'Reemplazar PDF' : 'Subir PDF'}
        title={content.has_file ? 'Reemplazar PDF' : 'Subir PDF'}
      >
        {upload.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
      </Button>
      {content.has_file && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive"
          onClick={() =>
            remove.mutate(content.id, {
              onSuccess: () => toast.success('PDF eliminado de GridFS.'),
              onError: (error) => toast.error(error.message),
            })
          }
          disabled={remove.isPending}
          aria-label="Eliminar PDF"
          title="Eliminar PDF"
        >
          {remove.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  )
}

export function AdminContentsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Content | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Content | null>(null)

  const contentsQuery = useAdminContents(page, 12, status)
  const createContent = useCreateContent()
  const updateContent = useUpdateContent()
  const deleteContent = useDeleteContent()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContentForm>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: '',
      author: '',
      type: 'book',
      description: '',
      tags: '',
      language: 'es',
      published_at: '',
      status: 'published',
      cover_url: '',
    },
  })

  const typeValue = watch('type')
  const statusValue = watch('status')

  const items = (contentsQuery.data?.data ?? []).filter((item) => {
    if (!search.trim()) return true
    const term = search.trim().toLowerCase()
    return (
      item.title.toLowerCase().includes(term) || item.author.toLowerCase().includes(term)
    )
  })

  function openCreate() {
    setEditing(null)
    reset({
      title: '',
      author: '',
      type: 'book',
      description: '',
      tags: '',
      language: 'es',
      published_at: '',
      status: 'published',
      cover_url: '',
    })
    setDialogOpen(true)
  }

  function openEdit(content: Content) {
    setEditing(content)
    reset({
      title: content.title,
      author: content.author,
      type: content.type,
      description: content.description,
      tags: content.tags.join(', '),
      language: content.language,
      published_at: content.published_at ? content.published_at.slice(0, 10) : '',
      status: content.status,
      cover_url: content.cover_url ?? '',
    })
    setDialogOpen(true)
  }

  async function onSubmit(values: ContentForm) {
    const input: ContentInput = {
      title: values.title.trim(),
      author: values.author.trim(),
      type: values.type,
      description: values.description.trim(),
      tags: values.tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 10),
      language: values.language.trim(),
      published_at: values.published_at ? values.published_at : null,
      status: values.status,
      cover_url: values.cover_url?.trim() || null,
    }

    try {
      if (editing) {
        await updateContent.mutateAsync({ contentId: editing.id, input })
        toast.success('Contenido actualizado.')
      } else {
        await createContent.mutateAsync(input)
        toast.success('Contenido creado.')
      }
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el contenido.')
    }
  }

  function handleDelete() {
    if (!deleteTarget) return
    deleteContent.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Contenido eliminado.')
        setDeleteTarget(null)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <Page>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Administración</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Contenidos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Crea, edita y publica títulos del catálogo. Sube PDFs reales que se guardan en
            MongoDB GridFS.
          </p>
        </div>
        <Button onClick={openCreate} size="lg">
          <Plus className="h-4 w-4" />
          Nuevo contenido
        </Button>
      </div>

      <div className="paper-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filtrar por título o autor…"
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {contentsQuery.data && (
              <Badge variant="muted" className="normal-case tracking-normal">
                {contentsQuery.data.meta.total} en total
              </Badge>
            )}
          </div>
        </div>

        {contentsQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-ink-muted">
            <Loader2 className="h-5 w-5 animate-spin text-clay" />
            Cargando contenidos…
          </div>
        ) : contentsQuery.isError ? (
          <div className="p-8 text-center text-sm text-destructive">
            No se pudo cargar la lista de contenidos.
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-xl font-semibold text-ink">
              No hay contenidos con estos filtros
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Prueba con otro estado o crea un contenido nuevo.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Valoración</TableHead>
                <TableHead>PDF / GridFS</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((content) => (
                <TableRow key={content.id}>
                  <TableCell>
                    <p className="max-w-[280px] truncate font-medium text-ink">
                      {content.title}
                    </p>
                    <p className="max-w-[280px] truncate text-xs text-ink-muted">
                      {content.author}
                      {yearOf(content.published_at) && ` · ${yearOf(content.published_at)}`}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabel(content.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(content.status)}>
                      {CONTENT_STATUS_LABELS[content.status] ?? content.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-ink-soft">
                      {content.rating_count > 0
                        ? `${content.rating_avg.toFixed(1)} (${content.rating_count})`
                        : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <PdfUploadButton content={content} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(content)}
                        aria-label={`Editar ${content.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive"
                        onClick={() => setDeleteTarget(content)}
                        aria-label={`Eliminar ${content.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {contentsQuery.data && contentsQuery.data.meta.total_pages > 1 && (
          <div className="border-t border-border/70 p-4">
            <Pagination
              page={page}
              totalPages={contentsQuery.data.meta.total_pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar contenido' : 'Nuevo contenido'}</DialogTitle>
            <DialogDescription>
              Los cambios se guardan directamente en la colección{' '}
              <code className="font-mono text-xs">contents</code> de MongoDB.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" {...register('title')} aria-invalid={Boolean(errors.title)} />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  {...register('author')}
                  aria-invalid={Boolean(errors.author)}
                />
                {errors.author && (
                  <p className="text-xs text-destructive">{errors.author.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={typeValue}
                  onValueChange={(value) =>
                    setValue('type', value as ContentForm['type'], { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book">Libro</SelectItem>
                    <SelectItem value="article">Artículo</SelectItem>
                    <SelectItem value="thesis">Tesis</SelectItem>
                    <SelectItem value="magazine">Revista</SelectItem>
                    <SelectItem value="other">Ensayo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" {...register('description')} />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
                <Input
                  id="tags"
                  placeholder="novela, clasico, latinoamerica"
                  {...register('tags')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Input id="language" {...register('language')} />
                {errors.language && (
                  <p className="text-xs text-destructive">{errors.language.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="published_at">Fecha de publicación</Label>
                <Input id="published_at" type="date" {...register('published_at')} />
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={statusValue}
                  onValueChange={(value) =>
                    setValue('status', value as ContentForm['status'], { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_url">URL de portada (opcional)</Label>
                <Input id="cover_url" placeholder="https://…" {...register('cover_url')} />
                {errors.cover_url && (
                  <p className="text-xs text-destructive">{errors.cover_url.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? 'Guardar cambios' : 'Crear contenido'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar contenido</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar “{deleteTarget?.title}”? También se eliminarán sus
              reseñas, guardados, progreso y PDF asociado. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteContent.isPending}
            >
              {deleteContent.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Eliminar definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  )
}
