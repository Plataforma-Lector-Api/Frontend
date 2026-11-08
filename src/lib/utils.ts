import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

export interface CoverPalette {
  from: string
  to: string
  accent: string
  text: string
}

const COVER_PALETTES: CoverPalette[] = [
  { from: '#1f4d46', to: '#2f6f64', accent: '#d9a441', text: '#f7f3ea' },
  { from: '#8f3524', to: '#dc5a3a', accent: '#f2c9a0', text: '#fff8f0' },
  { from: '#1c2b45', to: '#3d5a80', accent: '#e0b15c', text: '#f5f1e8' },
  { from: '#4a2c3f', to: '#7d4a67', accent: '#e8b4a0', text: '#fdf5ef' },
  { from: '#2f3a1f', to: '#5b6c3a', accent: '#e3c56b', text: '#f8f4e8' },
  { from: '#5b3a1e', to: '#9a6437', accent: '#f0d9a8', text: '#fff9ee' },
  { from: '#25313a', to: '#4a5d6b', accent: '#d98f5a', text: '#f6f2ea' },
  { from: '#3b2a55', to: '#624a86', accent: '#e8c07a', text: '#faf5ee' },
]

export function coverPalette(title: string): CoverPalette {
  return COVER_PALETTES[hashString(title) % COVER_PALETTES.length]
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}
