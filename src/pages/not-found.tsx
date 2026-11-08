import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-ink-muted">
        <BookOpen className="h-7 w-7" />
      </span>
      <p className="mt-6 font-display text-7xl font-semibold text-clay">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
        Esta página no está en el catálogo
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        Puede que el enlace haya cambiado o que el contenido ya no exista. Vuelve al
        inicio y sigue explorando.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/catalogo">Explorar catálogo</Link>
        </Button>
      </div>
    </div>
  )
}
