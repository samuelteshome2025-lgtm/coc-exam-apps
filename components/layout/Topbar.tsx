'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Avatar } from '@/components/ui'
import { useEffect, useState } from 'react'

interface TopbarProps {
  title: string
  subtitle?: string
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { data: session } = useSession()
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => {
      setNotifCount(d.count || 0)
    }).catch(() => {})
  }, [])

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-base font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <Link href="/notifications" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors relative">
          🔔
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </Link>
        <Link href="/profile">
          <Avatar name={session?.user?.name || 'User'} size="sm" className="cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all" />
        </Link>
      </div>
    </header>
  )
}
