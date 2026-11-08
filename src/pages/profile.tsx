import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  BookMarked,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Mail,
  Save,
  Shield,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

import { Page } from '@/components/layout/page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import { useLibrary, useProgressList } from '@/hooks/use-library'
import { apiFetch } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { initials } from '@/lib/utils'
import type { User } from '@/types'

const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  bio: z.string().max(500, 'La biografía no puede superar 500 caracteres').optional(),
  avatar_url: z.string().url('Debe ser una URL válida').or(z.literal('')).optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { user, updateUser, isAdmin } = useAuth()
  const [saving, setSaving] = useState(false)
  const library = useLibrary(1, 50)
  const progress = useProgressList(true, 50)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      bio: user?.bio ?? '',
      avatar_url: user?.avatar_url ?? '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        bio: user.bio ?? '',
        avatar_url: user.avatar_url ?? '',
      })
    }
  }, [user, reset])

  if (!user) return null

  const savedCount = library.data?.meta.total ?? 0
  const progressItems = progress.data ?? []
  const inProgress = progressItems.filter((item) => item.percentage < 100).length
  const completed = progressItems.filter((item) => item.percentage >= 100).length

  async function onSubmit(values: ProfileForm) {
    setSaving(true)
    try {
      const updated = await apiFetch<User>('/users/me', {
        method: 'PATCH',
        body: {
          name: values.name,
          bio: values.bio || null,
          avatar_url: values.avatar_url || null,
        },
      })
      updateUser(updated)
      reset({ name: updated.name, bio: updated.bio ?? '', avatar_url: updated.avatar_url ?? '' })
      toast.success('Perfil actualizado correctamente.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el perfil.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page>
      <div className="mb-10">
        <p className="eyebrow mb-2">Cuenta</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Mi perfil
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Administra tus datos y revisa tu actividad de lectura.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <div className="paper-panel overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-clay/20 via-gold/20 to-pine/20" />
            <div className="-mt-10 px-6 pb-6">
              <Avatar className="h-20 w-20 border-4 border-card shadow-soft">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-secondary text-xl">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <h2 className="mt-3 font-display text-2xl font-semibold text-ink">{user.name}</h2>
              <p className="flex items-center gap-1.5 text-sm text-ink-muted">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={isAdmin ? 'gold' : 'secondary'}>
                  {isAdmin ? (
                    <>
                      <Shield className="h-3 w-3" /> Administrador
                    </>
                  ) : (
                    'Lector'
                  )}
                </Badge>
                <Badge variant="muted" className="normal-case tracking-normal">
                  <CalendarDays className="h-3 w-3" />
                  Miembro desde {formatDate(user.created_at)}
                </Badge>
              </div>
              {user.bio && <p className="mt-4 text-sm leading-relaxed text-ink-soft">{user.bio}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="paper-panel p-4 text-center">
              <BookMarked className="mx-auto h-4 w-4 text-clay" />
              <p className="mt-2 font-display text-xl font-semibold text-ink">{savedCount}</p>
              <p className="text-[0.65rem] uppercase tracking-wide text-ink-muted">Guardados</p>
            </div>
            <div className="paper-panel p-4 text-center">
              <BookOpen className="mx-auto h-4 w-4 text-pine" />
              <p className="mt-2 font-display text-xl font-semibold text-ink">{inProgress}</p>
              <p className="text-[0.65rem] uppercase tracking-wide text-ink-muted">En curso</p>
            </div>
            <div className="paper-panel p-4 text-center">
              <CheckCircle2 className="mx-auto h-4 w-4 text-gold" />
              <p className="mt-2 font-display text-xl font-semibold text-ink">{completed}</p>
              <p className="text-[0.65rem] uppercase tracking-wide text-ink-muted">Completados</p>
            </div>
          </div>

          <div className="paper-panel p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-clay" />
              <h3 className="text-sm font-semibold text-ink">Tu actividad reciente</h3>
            </div>
            {progressItems.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">
                Todavía no hay lecturas registradas.{' '}
                <Link to="/catalogo" className="link-underline text-clay">
                  Empieza por el catálogo
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {progressItems.slice(0, 4).map((item) => (
                  <li key={item.content_id}>
                    <Link
                      to={`/leer/${item.content_id}`}
                      className="group block rounded-xl p-2 transition-colors hover:bg-muted/60"
                    >
                      <p className="truncate text-sm font-medium text-ink group-hover:text-clay">
                        {item.content?.title ?? 'Contenido'}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Progress value={item.percentage} className="h-1" />
                        <span className="shrink-0 text-[0.65rem] text-ink-muted">
                          {item.percentage}%
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="paper-panel h-fit p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-ink">Editar datos</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Actualiza tu nombre, biografía y foto de perfil.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...register('name')} aria-invalid={Boolean(errors.name)} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" value={user.email} disabled />
              <p className="text-xs text-ink-muted">El correo no se puede modificar.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url">URL de avatar (opcional)</Label>
              <Input
                id="avatar_url"
                placeholder="https://ejemplo.com/mi-foto.jpg"
                {...register('avatar_url')}
                aria-invalid={Boolean(errors.avatar_url)}
              />
              {errors.avatar_url && (
                <p className="text-xs text-destructive">{errors.avatar_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                placeholder="Cuéntanos qué te gusta leer…"
                {...register('bio')}
                aria-invalid={Boolean(errors.bio)}
              />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-xs text-ink-muted">
                Los cambios se guardan en MongoDB al instante.
              </p>
              <Button type="submit" disabled={saving || !isDirty}>
                <Save className="h-4 w-4" />
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Page>
  )
}
