import type { ReactNode } from 'react'
import { BookOpen, Check, Database, Sparkles } from 'lucide-react'

import { Logo } from '@/components/logo'

interface AuthShellProps {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="container grid min-h-[calc(100vh-4rem)] items-center gap-12 py-10 lg:grid-cols-2 lg:gap-16">
      <div className="relative hidden overflow-hidden rounded-3xl bg-ink p-10 text-paper lg:flex lg:min-h-[640px] lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-clay/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-pine/40 blur-3xl" />

        <div className="relative">
          <Logo inverted />
          <p className="mt-12 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-gold">
            Biblioteca digital
          </p>
          <h2 className="mt-3 max-w-md text-balance font-display text-4xl font-semibold leading-tight">
            Un lugar para todo lo que quieres leer.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/60">
            Descubre contenidos curados, guarda tu biblioteca personal y retoma cada
            lectura exactamente donde la dejaste.
          </p>
        </div>

        <div className="relative mt-10 space-y-3">
          {[
            { icon: BookOpen, text: 'Lectura de PDFs en el navegador con progreso automático' },
            { icon: Database, text: 'Catálogo y recomendaciones impulsados por MongoDB' },
            { icon: Sparkles, text: 'Reseñas, calificaciones y descubrimiento por afinidad' },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gold">
                <item.icon className="h-4 w-4" />
              </span>
              <p className="text-sm text-paper/75">{item.text}</p>
              <Check className="ml-auto h-4 w-4 shrink-0 text-pine" />
            </div>
          ))}
        </div>

        <p className="relative mt-10 text-xs text-paper/35">
          Lector+ · FastAPI + MongoDB + React
        </p>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="text-balance font-display text-4xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{subtitle}</p>

        <div className="mt-8">{children}</div>

        <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div>

        <p className="mt-8 text-center text-xs text-ink-muted/70">
          Al continuar aceptas nuestras condiciones de uso y política de privacidad.
        </p>
      </div>
    </div>
  )
}
