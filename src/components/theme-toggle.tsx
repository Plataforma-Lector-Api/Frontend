import { Coffee, Moon, Sun, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme, type Theme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

interface ThemeOption {
  value: Theme
  label: string
  description: string
  icon: LucideIcon
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'light',
    label: 'Claro',
    description: 'Papel luminoso, ideal de día',
    icon: Sun,
  },
  {
    value: 'sepia',
    label: 'Sepia',
    description: 'Tono cálido que reduce el contraste',
    icon: Coffee,
  },
  {
    value: 'dark',
    label: 'Oscuro',
    description: 'Fondo profundo para poca luz',
    icon: Moon,
  },
]

function useCurrentTheme() {
  const { theme, setTheme } = useTheme()
  const current = THEME_OPTIONS.find((option) => option.value === theme) ?? THEME_OPTIONS[0]
  return { theme, setTheme, current }
}

export function ThemeToggle() {
  const { theme, setTheme, current } = useCurrentTheme()
  const Icon = current.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 px-2.5"
          aria-label={`Modo de lectura: ${current.label}. Cambiar modo`}
          title="Modo de lectura"
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Modo de lectura</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as Theme)}
        >
          {THEME_OPTIONS.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="items-start gap-2.5 py-2.5 pr-2"
            >
              <option.icon className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="space-y-0.5">
                <span className="block text-sm font-medium text-ink">{option.label}</span>
                <span className="block text-xs leading-snug text-ink-muted">
                  {option.description}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface ReadingThemePickerProps {
  className?: string
}

export function ReadingThemePicker({ className }: ReadingThemePickerProps) {
  const { theme, setTheme } = useCurrentTheme()

  return (
    <div
      role="group"
      aria-label="Modo de lectura"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border border-border/80 bg-card/70 p-0.5',
        className,
      )}
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon
        const active = theme === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={active}
            aria-label={`Modo ${option.label}`}
            title={option.label}
            className={cn(
              'inline-flex h-7 w-8 items-center justify-center rounded-full transition-colors',
              active
                ? 'bg-ink text-paper shadow-sm'
                : 'text-ink-muted hover:bg-muted hover:text-ink',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        )
      })}
    </div>
  )
}
