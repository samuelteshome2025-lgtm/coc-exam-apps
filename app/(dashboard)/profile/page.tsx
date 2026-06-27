'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Topbar from '@/components/layout/Topbar'
import { Card, Input, Button, StatCard } from '@/components/ui'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (session?.user) { setName(session.user.name || ''); }
    fetch(`/api/users/${session?.user?.id}`).then(r => r.json()).then(d => { if (d.user) { setPhone(d.user.phone || '') } })
    fetch('/api/analytics').then(r => r.json()).then(setStats)
  }, [session])

  const save = async () => {
    setSaving(true)
    const body: any = {}
    if (name.trim()) body.name = name.trim()
    if (phone.trim()) body.phone = phone.trim()
    if (password) body.password = password
    const res = await fetch(`/api/users/${session?.user?.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { toast.success('Profile updated!'); setPassword(''); await update() }
    else toast.error('Update failed')
    setSaving(false)
  }

  return (
    <div>
      <Topbar title="My Profile" subtitle="Manage your account" />
      <div className="p-7 animate-fade-in space-y-6">
        {/* Profile Banner */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-7 text-white flex items-center gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0">
            {session?.user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-xl font-extrabold">{session?.user?.name}</div>
            <div className="text-indigo-200 text-sm mt-0.5">{session?.user?.email}</div>
            <div className="mt-2"><span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{session?.user?.role}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Edit Form */}
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-5">Edit Profile</h3>
            <div className="space-y-4">
              <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
              <Input label="Email" value={session?.user?.email || ''} disabled className="opacity-50 cursor-not-allowed" />
              <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251 911 000 000" />
              <Input label="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
              <Button onClick={save} disabled={saving} className="w-full justify-center">{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-5">Statistics</h3>
            <div className="space-y-0 divide-y divide-slate-100">
              {[
                ['Exams Taken', stats?.totalExams ?? 0],
                ['Average Score', `${stats?.overall ?? 0}%`],
                ['Passed', stats?.passed ?? 0],
                ['Failed', stats?.failed ?? 0],
                ['Role', session?.user?.role],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-bold text-slate-800">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
