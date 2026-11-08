import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  inverted?: boolean
}

export function Logo({ className, inverted = false }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label="Lector+, ir al inicio"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-paper shadow-sm transition-transform duration-300 group-hover:-rotate-6">
        <BookOpen className="h-[18px] w-[18px]" strokeWidth={2.2} />
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-background" />
      </span>
      <span
        className={cn(
          'font-display text-xl font-semibold tracking-tight',
          inverted ? 'text-paper' : 'text-ink',
        )}
      >
        Lector<span className="text-clay">+</span>
      </span>
    </Link>
  )
}
