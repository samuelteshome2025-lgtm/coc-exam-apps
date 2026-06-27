'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Card, Badge, Button, Input, Modal, EmptyState } from '@/components/ui'
import { toast } from 'sonner'

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)

  const load = () => fetch('/api/users?role=ADMIN').then(r => r.json()).then(d => { setAdmins(d.users || []); setLoading(false) })
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Fill all fields'); return }
    setSaving(true)
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, role: 'ADMIN' }) })
    const data = await res.json()
    if (res.ok) { toast.success('Admin account created!'); setModal(false); setForm({ name: '', email: '', password: '' }); load() }
    else toast.error(data.error || 'Failed to create admin')
    setSaving(false)
  }

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !active }) })
    toast.success(`Account ${active ? 'disabled' : 'enabled'}`); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this admin account?')) return
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    toast.success('Admin deleted'); load()
  }

  return (
    <div>
      <Topbar title="Admin Accounts" subtitle="Manage administrator accounts" />
      <div className="p-7 animate-fade-in">
        <div className="flex justify-end mb-5">
          <Button onClick={() => setModal(true)}>+ Add Admin</Button>
        </div>
        <Card>
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /></div>
          ) : admins.length === 0 ? (
            <EmptyState icon="🛡️" title="No admin accounts" subtitle="Create admin accounts to help manage the platform." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Admin</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Joined</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{a.name?.[0]}</div>
                          <span className="font-semibold text-slate-800">{a.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{a.email}</td>
                      <td className="px-5 py-3.5 text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5"><Badge variant={a.active ? 'success' : 'danger'}>{a.active ? 'Active' : 'Inactive'}</Badge></td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => toggle(a.id, a.active)}>{a.active ? 'Disable' : 'Enable'}</Button>
                          <Button variant="danger" size="sm" onClick={() => del(a.id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Admin Account">
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Admin Name" />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@coc.edu" />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={create} disabled={saving}>{saving ? 'Creating...' : 'Create Admin'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
