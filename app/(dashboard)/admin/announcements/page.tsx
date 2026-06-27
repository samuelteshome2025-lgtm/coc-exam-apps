'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Card, Button, Modal, EmptyState } from '@/components/ui'
import { toast } from 'sonner'

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => fetch('/api/announcements').then(r => r.json()).then(d => { setAnnouncements(d.announcements || []); setLoading(false) })
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!title.trim() || !body.trim()) { toast.error('Fill in all fields'); return }
    setSaving(true)
    const res = await fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, body }) })
    if (res.ok) { toast.success('Announcement published!'); setModal(false); setTitle(''); setBody(''); load() }
    else toast.error('Failed to publish')
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    toast.success('Deleted'); load()
  }

  return (
    <div>
      <Topbar title="Announcements" subtitle="Manage platform notices" />
      <div className="p-7 animate-fade-in">
        <div className="flex justify-end mb-5">
          <Button onClick={() => setModal(true)}>+ New Announcement</Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /></div>
        ) : announcements.length === 0 ? (
          <EmptyState icon="📢" title="No announcements yet" />
        ) : (
          <div className="space-y-4">
            {announcements.map(a => (
              <Card key={a.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-900">{a.title}</div>
                    <div className="text-sm text-slate-500 mt-1">{a.body}</div>
                    <div className="text-xs text-slate-400 mt-2">{new Date(a.createdAt).toLocaleDateString()}</div>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => del(a.id)}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="New Announcement">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-600">Title</label>
            <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-600">Body</label>
            <textarea className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-28" value={body} onChange={e => setBody(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={create} disabled={saving}>{saving ? 'Publishing...' : 'Publish'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
