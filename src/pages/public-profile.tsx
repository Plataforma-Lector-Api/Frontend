import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Pencil, UserRound } from 'lucide-react'

import { Page } from '@/components/layout/page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { usePublicProfile } from '@/hooks/use-profile'
import { formatDate } from '@/lib/format'
import { initials } from '@/lib/utils'

export function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user } = useAuth()
  const { data: profile, isLoading, isError } = usePublicProfile(userId)

  const isOwnProfile = Boolean(user && profile && user.id === profile.id)

  if (isLoading) {
    return (
      <Page>
        <div className="mx-auto max-w-3xl space-y-5">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </Page>
    )
  }

  if (isError || !profile) {
    return (
      <Page>
        <div className="mx-auto max-w-xl py-16 text-center">
          <UserRound className="mx-auto h-10 w-10 text-ink-muted" />
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
            Perfil no encontrado
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            La cuenta que buscas no existe o ya no está disponible.
          </p>
          <Button asChild className="mt-6">
            <Link to="/catalogo">Volver al catálogo</Link>
          </Button>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div className="mx-auto max-w-3xl">
        <Link
          to="/catalogo"
          className="mb-6 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        <div className="paper-panel overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-clay/20 via-gold/20 to-pine/20" />
          <div className="-mt-12 px-6 pb-8 sm:px-10">
            <Avatar className="h-24 w-24 border-4 border-card shadow-soft">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.name} />
              <AvatarFallback className="bg-secondary text-2xl">
                {initials(profile.name)}
              </AvatarFallback>
            </Avatar>

            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow mb-1">Perfil de la comunidad</p>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  {profile.name}
                </h1>
                <Badge variant="outline" className="mt-3 normal-case tracking-normal">
                  <CalendarDays className="h-3 w-3" />
                  Miembro desde {formatDate(profile.created_at)}
                </Badge>
              </div>

              {isOwnProfile && (
                <Button variant="outline" asChild>
                  <Link to="/perfil">
                    <Pencil className="h-4 w-4" />
                    Editar mi perfil
                  </Link>
                </Button>
              )}
            </div>

            <div className="mt-8 border-t border-border/70 pt-6">
              <h2 className="text-sm font-semibold text-ink">Sobre mí</h2>
              {profile.bio ? (
                <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
                  {profile.bio}
                </p>
              ) : (
                <p className="mt-2 text-sm text-ink-muted">
                  Este lector todavía no ha escrito una biografía.
                </p>
              )}
            </div>

            <p className="mt-8 text-xs leading-relaxed text-ink-muted">
              Por privacidad, este perfil no muestra el correo ni la actividad de lectura.
            </p>
          </div>
        </div>
      </div>
    </Page>
  )
}
