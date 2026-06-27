'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Card, EmptyState } from '@/components/ui'
import { timeSince } from '@/lib/utils'

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/activity').then(r => r.json()).then(d => { setLogs(d.logs || []); setLoading(false) })
  }, [])

  return (
    <div>
      <Topbar title="Activity Log" subtitle="System activity and audit trail" />
      <div className="p-7 animate-fade-in">
        <Card className="p-6">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /></div>
          ) : logs.length === 0 ? (
            <EmptyState icon="🗂️" title="No activity yet" subtitle="Activity will appear here as users interact with the system." />
          ) : (
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                    {log.user?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{log.action}</div>
                    <div className="text-xs text-slate-400">{log.user?.name || 'System'}</div>
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap">{timeSince(log.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
