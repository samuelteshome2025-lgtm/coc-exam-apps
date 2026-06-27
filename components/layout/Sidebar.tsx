'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui'

const studentNav = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/exam', icon: '📝', label: 'Take Exams' },
  { href: '/results', icon: '📋', label: 'My Results' },
  { href: '/analytics', icon: '📈', label: 'Analytics' },
  { href: '/leaderboard', icon: '🥇', label: 'Leaderboard' },
  { href: '/announcements', icon: '📢', label: 'Announcements' },
  { href: '/notifications', icon: '🔔', label: 'Notifications' },
  { href: '/profile', icon: '👤', label: 'Profile' },
]

const adminNav = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/students', icon: '🎓', label: 'Students' },
  { href: '/admin/questions', icon: '❓', label: 'Questions' },
  { href: '/admin/announcements', icon: '📢', label: 'Announcements' },
  { href: '/results', icon: '📋', label: 'All Results' },
  { href: '/analytics', icon: '📈', label: 'Analytics' },
  { href: '/leaderboard', icon: '🥇', label: 'Leaderboard' },
  { href: '/admin/reports', icon: '📊', label: 'Reports' },
  { href: '/profile', icon: '👤', label: 'Profile' },
]

const superAdminNav = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/students', icon: '🎓', label: 'Students' },
  { href: '/admin/admins', icon: '🛡️', label: 'Admins' },
  { href: '/admin/questions', icon: '❓', label: 'Questions' },
  { href: '/admin/announcements', icon: '📢', label: 'Announcements' },
  { href: '/results', icon: '📋', label: 'All Results' },
  { href: '/analytics', icon: '📈', label: 'Analytics' },
  { href: '/leaderboard', icon: '🥇', label: 'Leaderboard' },
  { href: '/admin/activity', icon: '🗂️', label: 'Activity Log' },
  { href: '/admin/reports', icon: '📥', label: 'Reports' },
  { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
  { href: '/profile', icon: '👤', label: 'Profile' },
]

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role

  const navItems = role === 'SUPERADMIN' ? superAdminNav : role === 'ADMIN' ? adminNav : studentNav

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-40 overflow-y-auto scrollbar-thin">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-base">C</div>
          <div>
            <div className="font-extrabold text-slate-900 text-base leading-tight">COC Prep</div>
            <div className="text-xs text-slate-400 font-medium">Exam System</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150', isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
          <Avatar name={session?.user?.name || 'User'} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">{session?.user?.name}</div>
            <div className="text-xs text-slate-400">{role ? role.charAt(0) + role.slice(1).toLowerCase() : ''}</div>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-slate-400 hover:text-slate-600 transition-colors text-base" title="Logout">🚪</button>
        </div>
      </div>
    </aside>
  )
}
