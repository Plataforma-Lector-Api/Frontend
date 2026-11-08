import { useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  BookMarked,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  UserRound,
  X,
} from 'lucide-react'

import { Logo } from '@/components/logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { cn, initials } from '@/lib/utils'

const BASE_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/consultas', label: 'Consultas' },
]

export function Navbar() {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const term = query.trim()
    setMobileOpen(false)
    navigate(term ? `/catalogo?q=${encodeURIComponent(term)}` : '/catalogo')
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const links = [
    ...BASE_LINKS,
    ...(isAuthenticated ? [{ to: '/biblioteca', label: 'Biblioteca' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-ink/[0.055] text-ink'
                    : 'text-ink-muted hover:bg-ink/[0.04] hover:text-ink',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative hidden xl:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar títulos, autores…"
              className="h-9 w-56 rounded-full border-transparent bg-muted/80 pl-9 text-sm focus-visible:bg-card"
              aria-label="Buscar en el catálogo"
            />
          </form>

          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full border border-border/80 bg-card/70 p-1 pr-2.5 transition-colors hover:bg-card"
                  aria-label="Abrir menú de usuario"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-[0.65rem]">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[7.5rem] truncate text-sm font-medium sm:block">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                  <p className="truncate text-xs text-ink-muted">{user.email}</p>
                  <Badge variant={isAdmin ? 'gold' : 'muted'} className="mt-2">
                    {isAdmin ? 'Administrador' : 'Lector'}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate('/perfil')}>
                  <UserRound />
                  Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/biblioteca')}>
                  <BookMarked />
                  Mi biblioteca
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onSelect={() => navigate('/admin')}>
                    <LayoutDashboard />
                    Panel administrativo
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="text-destructive">
                  <LogOut />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Ingresar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/registro">Crear cuenta</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/70 bg-background/95 px-5 py-4 lg:hidden">
          <form onSubmit={handleSearch} className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar en el catálogo…"
              className="pl-9"
              aria-label="Buscar en el catálogo"
            />
          </form>

          <nav className="grid gap-1" aria-label="Navegación móvil">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-3 py-2.5 text-sm font-medium',
                    isActive ? 'bg-ink/[0.055] text-ink' : 'text-ink-muted',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="outline" asChild>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Ingresar
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/registro" onClick={() => setMobileOpen(false)}>
                    Crear cuenta
                  </Link>
                </Button>
              </div>
            )}
            {isAdmin && (
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-gold/15 px-3 py-2 text-xs font-medium text-[#8a6417]">
                <Shield className="h-4 w-4" />
                Sesión de administrador
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
