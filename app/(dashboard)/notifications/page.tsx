'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Card } from '@/components/ui'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => {
      setNotifications(d.notifications || [])
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <Topbar title="Notifications" subtitle="Your recent updates and activity" />
      <div className="p-7 animate-fade-in max-w-2xl">
        <Card>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🔔</div>
              <div className="font-semibold text-slate-700 mb-1">No notifications yet</div>
              <div className="text-sm text-slate-400">Complete exams or check back for announcements.</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map(n => (
                <div key={n.id} className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-base flex-shrink-0">
                    {n.type === 'announcement' ? '📢' : '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{n.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
