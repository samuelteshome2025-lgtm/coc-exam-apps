import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function timeSince(date: string | Date): string {
  const d = new Date(date)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function getLevelColor(level: string | number): string {
  const map: Record<string, string> = {
    '1': '#1D4ED8', '2': '#166534', '3': '#92400E',
    '4': '#9A3412', '5': '#7E22CE', 'mixed': '#4F46E5', 'full': '#D97706',
  }
  return map[String(level)] || '#4F46E5'
}

export function getLevelBg(level: string | number): string {
  const map: Record<string, string> = {
    '1': '#EFF6FF', '2': '#F0FDF4', '3': '#FFFBEB',
    '4': '#FFF7ED', '5': '#FDF4FF', 'mixed': '#EEF2FF', 'full': '#FFFBEB',
  }
  return map[String(level)] || '#EEF2FF'
}

export function calculateReadiness(avgScore: number, examCount: number): number {
  return Math.min(100, Math.round(avgScore * 0.6 + examCount * 2))
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
