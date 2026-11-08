import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PageProps {
  children: ReactNode
  className?: string
}

export function Page({ children, className }: PageProps) {
  return <main className={cn('container page-enter py-10 sm:py-14', className)}>{children}</main>
}
