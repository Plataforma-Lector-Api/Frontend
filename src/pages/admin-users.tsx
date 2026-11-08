import { useState } from 'react'
import { Loader2, Search, Shield, ShieldOff, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'

import { Page } from '@/components/layout/page'
import { Pagination } from '@/components/pagination'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useAdminUsers, useUpdateAdminUser } from '@/hooks/use-admin'
import { useAuth } from '@/hooks/use-auth'
import { formatDate, relativeDate } from '@/lib/format'
import { initials } from '@/lib/utils'
import type { User } from '@/types'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  reader: 'Lector',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  disabled: 'Deshabilitado',
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const usersQuery = useAdminUsers(page, 12, search)
  const updateUser = useUpdateAdminUser()

  function applySearch() {
    setPage(1)
    setSearch(searchInput.trim())
  }

  function changeRole(user: User, role: 'reader' | 'admin') {
    if (user.id === currentUser?.id) {
      toast.error('No puedes cambiar tu propio rol desde este panel.')
      return
    }
    updateUser.mutate(
      { userId: user.id, role },
      {
        onSuccess: () =>
          toast.success(
            role === 'admin'
              ? `${user.name} ahora es administrador.`
              : `${user.name} ahora es lector.`,
          ),
        onError: (error) => toast.error(error.message),
      },
    )
  }

  function toggleStatus(user: User) {
    if (user.id === currentUser?.id) {
      toast.error('No puedes deshabilitar tu propia cuenta.')
      return
    }
    const nextStatus = user.status === 'active' ? 'disabled' : 'active'
    updateUser.mutate(
      { userId: user.id, status: nextStatus },
      {
        onSuccess: () =>
          toast.success(
            nextStatus === 'active'
              ? `Cuenta de ${user.name} reactivada.`
              : `Cuenta de ${user.name} deshabilitada.`,
          ),
        onError: (error) => toast.error(error.message),
      },
    )
  }

  return (
    <Page>
      <div className="mb-8">
        <p className="eyebrow mb-2">Administración</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Usuarios
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Gestiona roles y estados de las cuentas registradas. Los administradores pueden
          crear, editar y eliminar contenidos del catálogo.
        </p>
      </div>

      <div className="paper-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              applySearch()
            }}
            className="flex max-w-md flex-1 items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar por nombre o correo…"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>

          {usersQuery.data && (
            <Badge variant="muted" className="normal-case tracking-normal">
              {usersQuery.data.meta.total} usuarios
            </Badge>
          )}
        </div>

        {usersQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-ink-muted">
            <Loader2 className="h-5 w-5 animate-spin text-clay" />
            Cargando usuarios…
          </div>
        ) : usersQuery.isError ? (
          <div className="p-8 text-center text-sm text-destructive">
            No se pudo cargar la lista de usuarios.
          </div>
        ) : (usersQuery.data?.data.length ?? 0) === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-xl font-semibold text-ink">
              No encontramos usuarios
            </p>
            <p className="mt-2 text-sm text-ink-muted">Prueba con otro término de búsqueda.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersQuery.data?.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
                        <AvatarFallback className="bg-secondary text-[0.65rem]">
                          {initials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="max-w-[220px] truncate text-sm font-medium text-ink">
                          {user.name}
                          {user.id === currentUser?.id && (
                            <span className="ml-2 text-[0.65rem] uppercase tracking-wide text-clay">
                              tú
                            </span>
                          )}
                        </p>
                        <p className="max-w-[220px] truncate text-xs text-ink-muted">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => changeRole(user, value as 'reader' | 'admin')}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reader">Lector</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>
                      {STATUS_LABELS[user.status] ?? user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-ink-muted">{formatDate(user.created_at)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-ink-muted">
                      {user.last_login_at ? relativeDate(user.last_login_at) : 'Nunca'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => changeRole(user, user.role === 'admin' ? 'reader' : 'admin')}
                        aria-label={
                          user.role === 'admin' ? 'Quitar rol de administrador' : 'Hacer administrador'
                        }
                        title={ROLE_LABELS[user.role === 'admin' ? 'reader' : 'admin']}
                        disabled={updateUser.isPending}
                      >
                        {user.role === 'admin' ? (
                          <ShieldOff className="h-4 w-4" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={user.status === 'active' ? 'text-destructive' : 'text-pine'}
                        onClick={() => toggleStatus(user)}
                        aria-label={
                          user.status === 'active' ? 'Deshabilitar cuenta' : 'Reactivar cuenta'
                        }
                        title={user.status === 'active' ? 'Deshabilitar' : 'Reactivar'}
                        disabled={updateUser.isPending}
                      >
                        {user.status === 'active' ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {usersQuery.data && usersQuery.data.meta.total_pages > 1 && (
          <div className="border-t border-border/70 p-4">
            <Pagination
              page={page}
              totalPages={usersQuery.data.meta.total_pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </Page>
  )
}
