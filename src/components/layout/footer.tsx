import { Link } from 'react-router-dom'

import { Logo } from '@/components/logo'
import { useAuth } from '@/hooks/use-auth'

export function Footer() {
  const { isAuthenticated } = useAuth()

  const accountLinks = isAuthenticated
    ? [
        { to: '/biblioteca', label: 'Mi biblioteca' },
        { to: '/perfil', label: 'Mi perfil' },
      ]
    : [
        { to: '/login', label: 'Iniciar sesión' },
        { to: '/registro', label: 'Crear cuenta' },
      ]

  return (
    <footer className="mt-20 bg-ink text-paper/70">
      <div className="container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr]">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-paper/60">
            Tu biblioteca digital: descubre, guarda, reseña y lee libros, artículos y
            tesis desde cualquier dispositivo.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">
            Explorar
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/catalogo" className="transition-colors hover:text-paper">
                Catálogo completo
              </Link>
            </li>
            <li>
              <Link
                to="/catalogo?sort=-popularity"
                className="transition-colors hover:text-paper"
              >
                Más populares
              </Link>
            </li>
            <li>
              <Link
                to="/catalogo?sort=-rating"
                className="transition-colors hover:text-paper"
              >
                Mejor valorados
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">
            Cuenta
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {accountLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-paper">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-5 text-center text-xs text-paper/40">
          <p>© {new Date().getFullYear()} Lector+. Proyecto académico de biblioteca digital.</p>
        </div>
      </div>
    </footer>
  )
}
