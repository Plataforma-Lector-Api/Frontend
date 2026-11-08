import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  tone?: 'clay' | 'pine' | 'gold' | 'ink'
  className?: string
}

const TONES = {
  clay: 'bg-clay/10 text-clay-dark',
  pine: 'bg-pine/10 text-pine-dark',
  gold: 'bg-gold/20 text-[#8a6417]',
  ink: 'bg-ink/5 text-ink',
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'clay', className }: StatCardProps) {
  return (
    <div className={cn('paper-panel p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
        </div>
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', TONES[tone])}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
      </div>
    </div>
  )
}
