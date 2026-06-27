'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Card, Button, Input, Modal, Badge, EmptyState } from '@/components/ui'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

export default function AnnouncementsPage() {
  const { data: session } = useSession()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const isAdmin = session?.user?.role !== 'STUDENT'

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

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/announcements/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !active }) })
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    toast.success('Deleted'); load()
  }

  return (
    <div>
      <Topbar title="Announcements" subtitle="Platform notices and updates" />
      <div className="p-7 animate-fade-in">
        {isAdmin && (
          <div className="flex justify-end mb-5">
            <Button onClick={() => setModal(true)}>+ New Announcement</Button>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /></div>
        ) : announcements.length === 0 ? (
          <EmptyState icon="📢" title="No announcements yet" subtitle="Check back later for platform updates." />
        ) : (
          <div className="space-y-4">
            {announcements.map(a => (
              <Card key={a.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-2xl mt-0.5">📢</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-bold text-slate-900">{a.title}</h3>
                        {isAdmin && <Badge variant={a.active ? 'success' : 'secondary'}>{a.active ? 'Active' : 'Inactive'}</Badge>}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{a.body}</p>
                      <p className="text-xs text-slate-400 mt-2">{new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="secondary" size="sm" onClick={() => toggle(a.id, a.active)}>{a.active ? 'Deactivate' : 'Activate'}</Button>
                      <Button variant="danger" size="sm" onClick={() => del(a.id)}>Delete</Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="New Announcement">
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title..." />
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-600">Message</label>
            <textarea className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none h-32" value={body} onChange={e => setBody(e.target.value)} placeholder="Write your announcement..." />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={create} disabled={saving}>{saving ? 'Publishing...' : 'Publish'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
