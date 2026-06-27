'use client'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef, HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

// Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
      danger: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200',
      outline: 'bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
    }
    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-semibold',
      md: 'px-4 py-2 text-sm font-semibold',
      lg: 'px-6 py-3 text-base font-semibold',
      icon: 'w-9 h-9 p-0 flex items-center justify-center',
    }
    return (
      <button ref={ref} className={cn('inline-flex items-center gap-2 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer', variants[variant], sizes[size], className)} {...props} />
    )
  }
)
Button.displayName = 'Button'

// Card
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm', className)} {...props} />
}

// Input
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ className, label, error, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-semibold text-slate-600">{label}</label>}
      <input ref={ref} className={cn('w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all', error && 'border-red-400', className)} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// Textarea
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  ({ className, label, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-semibold text-slate-600">{label}</label>}
      <textarea ref={ref} className={cn('w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none', className)} {...props} />
    </div>
  )
)
Textarea.displayName = 'Textarea'

// Select
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label?: string }>(
  ({ className, label, children, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-semibold text-slate-600">{label}</label>}
      <select ref={ref} className={cn('w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer', className)} {...props}>{children}</select>
    </div>
  )
)
Select.displayName = 'Select'

// Label
export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('block text-sm font-semibold text-slate-600 mb-1.5', className)} {...props} />
}

// Badge
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'secondary'
}
export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  const variants = {
    primary: 'bg-indigo-100 text-indigo-700',
    success: 'bg-emerald-100 text-emerald-700',
    danger: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    secondary: 'bg-slate-100 text-slate-600',
  }
  return <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide', variants[variant], className)} {...props} />
}

// Avatar
export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-14 h-14 text-xl' }
  return (
    <div className={cn('rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0', sizes[size], className)}>
      {initials}
    </div>
  )
}

// StatCard
export function StatCard({ icon, value, label, color = '#4F46E5', bg = '#EEF2FF' }: { icon: string; value: string | number; label: string; color?: string; bg?: string }) {
  return (
    <Card className="p-5 animate-fade-in">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: bg }}>{icon}</div>
      <div className="text-2xl font-extrabold text-slate-900 mb-1">{value}</div>
      <div className="text-sm text-slate-500 font-medium">{label}</div>
    </Card>
  )
}

// Progress
export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 bg-slate-100 rounded-full overflow-hidden', className)}>
      <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

// Spinner
export function Spinner({ className }: { className?: string }) {
  return <div className={cn('w-8 h-8 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin', className)} style={{ borderWidth: 3 }} />
}

// Modal
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// LevelBadge
export function LevelBadge({ level }: { level: string | number }) {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    '1': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Level 1' },
    '2': { bg: 'bg-green-100', text: 'text-green-700', label: 'Level 2' },
    '3': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Level 3' },
    '4': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Level 4' },
    '5': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Level 5' },
    'mixed': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Mixed' },
    'full': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Full COC' },
  }
  const c = configs[String(level)] || configs['mixed']
  return <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold', c.bg, c.text)}>{c.label}</span>
}

// EmptyState
export function EmptyState({ icon, title, subtitle, action }: { icon: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      {subtitle && <p className="text-slate-500 text-sm mb-4">{subtitle}</p>}
      {action}
    </div>
  )
}
