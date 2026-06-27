'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Card, Badge, Button, EmptyState } from '@/components/ui'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

export default function StudentsPage() {
  const { data: session } = useSession()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => {
    const q = search ? `&search=${encodeURIComponent(search)}` : ''
    fetch(`/api/users?role=STUDENT${q}`).then(r => r.json()).then(d => { setStudents(d.users || []); setLoading(false) })
  }

  useEffect(() => { load() }, [search])

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !active }) })
    toast.success(`Account ${active ? 'disabled' : 'enabled'}`)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this student permanently?')) return
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    toast.success('Student deleted')
    load()
  }

  const isSuperAdmin = session?.user?.role === 'SUPERADMIN'

  return (
    <div>
      <Topbar title="Students" subtitle="Manage student accounts" />
      <div className="p-7 animate-fade-in">
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex-1 max-w-sm shadow-sm">
            <span className="text-slate-400">🔍</span>
            <input className="bg-transparent border-none outline-none text-sm text-slate-700 flex-1 placeholder:text-slate-400" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="text-sm font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">{students.length} students</span>
        </div>

        <Card>
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /></div>
          ) : students.length === 0 ? (
            <EmptyState icon="🎓" title="No students found" subtitle="No students match your search." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Student</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Phone</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Points</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Joined</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{s.name?.[0]}</div>
                          <span className="font-semibold text-slate-800">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{s.email}</td>
                      <td className="px-5 py-3.5 text-slate-400">{s.phone || '—'}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-700">{s.points}</td>
                      <td className="px-5 py-3.5 text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5"><Badge variant={s.active ? 'success' : 'danger'}>{s.active ? 'Active' : 'Inactive'}</Badge></td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => toggle(s.id, s.active)}>{s.active ? 'Disable' : 'Enable'}</Button>
                          {isSuperAdmin && <Button variant="danger" size="sm" onClick={() => del(s.id)}>Delete</Button>}
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
    </div>
  )
}
