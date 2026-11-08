import { Link } from 'react-router-dom'
import { GitBranch, ExternalLink, Database, BookOpen } from 'lucide-react'

import { Logo } from '@/components/logo'
import { API_URL } from '@/lib/api'

const apiDocsUrl = `${API_URL.replace(/\/api\/v1$/, '')}/docs`

export function Footer() {
  return (
    <footer className="mt-20 bg-ink text-paper/70">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo inverted />
          <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-paper/60">
            Tu biblioteca digital: descubre, guarda, reseña y lee libros, artículos y
            tesis desde cualquier dispositivo.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-paper/60">
              <Database className="h-3 w-3" />
              MongoDB
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-paper/60">
              <BookOpen className="h-3 w-3" />
              FastAPI
            </span>
          </div>
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
              <Link to="/catalogo?sort=-popularity" className="transition-colors hover:text-paper">
                Más populares
              </Link>
            </li>
            <li>
              <Link to="/catalogo?sort=-rating" className="transition-colors hover:text-paper">
                Mejor valorados
              </Link>
            </li>
            <li>
              <Link to="/consultas" className="transition-colors hover:text-paper">
                Las 10 consultas MongoDB
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">
            Cuenta
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/login" className="transition-colors hover:text-paper">
                Iniciar sesión
              </Link>
            </li>
            <li>
              <Link to="/registro" className="transition-colors hover:text-paper">
                Crear cuenta
              </Link>
            </li>
            <li>
              <Link to="/biblioteca" className="transition-colors hover:text-paper">
                Mi biblioteca
              </Link>
            </li>
            <li>
              <Link to="/perfil" className="transition-colors hover:text-paper">
                Mi perfil
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">
            Proyecto
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a
                href={apiDocsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-paper"
              >
                API Swagger
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Plataforma-Lector-Api"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-paper"
              >
                GitHub
                <GitBranch className="h-3.5 w-3.5" />
              </a>
            </li>
            <li>
              <Link to="/consultas" className="transition-colors hover:text-paper">
                Demostración de consultas
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-paper/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Lector+. Proyecto académico de biblioteca digital.</p>
          <p>FastAPI · MongoDB · React · GridFS</p>
        </div>
      </div>
    </footer>
  )
}
