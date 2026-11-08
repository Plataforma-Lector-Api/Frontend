import { useState } from 'react'

import { typeLabel } from '@/lib/format'
import { cn, coverPalette } from '@/lib/utils'

interface ContentCoverProps {
  title: string
  author: string
  type: string
  coverUrl?: string | null
  className?: string
}

export function ContentCover({ title, author, type, coverUrl, className }: ContentCoverProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const palette = coverPalette(title)
  const showImage = Boolean(coverUrl) && !imageFailed

  return (
    <div
      className={cn(
        'relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-cover',
        className,
      )}
      style={{
        background: `linear-gradient(150deg, ${palette.from} 0%, ${palette.to} 100%)`,
        color: palette.text,
      }}
    >
      {showImage ? (
        <img
          src={coverUrl ?? ''}
          alt={`Portada de ${title}`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex h-full flex-col justify-between p-5">
          <div className="flex items-center justify-between text-[0.58rem] uppercase tracking-[0.22em] opacity-75">
            <span>{typeLabel(type)}</span>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: palette.accent }}
            />
          </div>

          <div>
            <p className="text-balance font-display text-[1.3rem] font-semibold leading-[1.15]">
              {title}
            </p>
            <div
              className="my-3 h-px w-10 opacity-80"
              style={{ backgroundColor: palette.accent }}
            />
            <p className="text-[0.66rem] uppercase tracking-[0.18em] opacity-75">{author}</p>
          </div>

          <div className="flex items-center justify-between text-[0.52rem] uppercase tracking-[0.2em] opacity-55">
            <span>Lector+</span>
            <span>Edición digital</span>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/25 to-transparent" />
    </div>
  )
}
