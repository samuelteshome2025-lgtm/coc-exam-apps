'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import { Card, Button, Input, Modal, LevelBadge, EmptyState } from '@/components/ui'
import { toast } from 'sonner'

const EMPTY_FORM = { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: 0, explanation: '', level: 1, category: '', difficulty: 'MEDIUM' }

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState('all')
  const [diffFilter, setDiffFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 50

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (levelFilter !== 'all') params.set('level', levelFilter)
    if (search) params.set('search', search)
    params.set('page', String(page))
    params.set('limit', String(LIMIT))
    fetch(`/api/questions?${params}`).then(r => r.json()).then(d => {
      setQuestions(d.questions || [])
      setTotalPages(d.pages || 1)
      setTotal(d.total || 0)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [levelFilter, diffFilter, search, page])

  const openAdd = () => { setEditId(null); setForm({ ...EMPTY_FORM }); setModal(true) }
  const openEdit = (q: any) => {
    setEditId(q.id)
    setForm({ question: q.question, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, correct: q.correct, explanation: q.explanation || '', level: q.level, category: q.category || '', difficulty: q.difficulty || 'MEDIUM' })
    setModal(true)
  }

  const save = async () => {
    if (!form.question || !form.optionA || !form.optionB || !form.optionC || !form.optionD) { toast.error('Fill in all fields'); return }
    setSaving(true)
    const url = editId ? `/api/questions/${editId}` : '/api/questions'
    const method = editId ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success(editId ? 'Question updated!' : 'Question added!'); setModal(false); load() }
    else { const d = await res.json(); toast.error(d.error || 'Save failed') }
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this question?')) return
    await fetch(`/api/questions/${id}`, { method: 'DELETE' })
    toast.success('Question deleted'); load()
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }

  const toggleAll = () => {
    if (selected.size === questions.length) setSelected(new Set())
    else setSelected(new Set(questions.map(q => q.id)))
  }

  const bulkDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} selected question(s)? This cannot be undone.`)) return
    setBulkDeleting(true)
    await Promise.all([...selected].map(id => fetch(`/api/questions/${id}`, { method: 'DELETE' })))
    toast.success(`Deleted ${selected.size} questions`)
    setSelected(new Set())
    setBulkDeleting(false)
    load()
  }

  const exportQuestions = () => {
    window.open('/api/reports?type=questions&format=xlsx', '_blank')
  }

  const displayed = questions.filter(q =>
    (diffFilter === 'all' || q.difficulty === diffFilter) &&
    (!search || q.question.toLowerCase().includes(search.toLowerCase()) || (q.category || '').toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <Topbar title="Question Bank" subtitle="Manage exam questions" />
      <div className="p-7 animate-fade-in">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
              <span className="text-slate-400 text-sm">🔍</span>
              <input
                className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 w-44"
                placeholder="Search questions..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400" value={levelFilter} onChange={e => { setLevelFilter(e.target.value); setPage(1) }}>
              <option value="all">All Levels</option>
              {[1,2,3,4,5].map(l => <option key={l} value={l}>Level {l}</option>)}
            </select>
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400" value={diffFilter} onChange={e => setDiffFilter(e.target.value)}>
              <option value="all">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selected.size > 0 && (
              <Button variant="danger" onClick={bulkDelete} disabled={bulkDeleting}>
                {bulkDeleting ? 'Deleting...' : `🗑 Delete ${selected.size}`}
              </Button>
            )}
            <Button variant="secondary" onClick={exportQuestions}>⬇ Export</Button>
            <Link href="/admin/questions/import"><Button variant="secondary">⬆ Import</Button></Link>
            <Button onClick={openAdd}>+ Add Question</Button>
          </div>
        </div>

        <Card>
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500 font-semibold">{total.toLocaleString()} questions total · showing {displayed.length}</span>
            {totalPages > 1 && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>←</Button>
                <span className="text-xs text-slate-400 px-2 py-1">{page} / {totalPages}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>→</Button>
              </div>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /></div>
          ) : displayed.length === 0 ? (
            <EmptyState icon="❓" title="No questions found" subtitle="Add questions to build the exam bank." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={selected.size === questions.length && questions.length > 0} onChange={toggleAll} className="w-4 h-4 accent-indigo-600" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Question</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Difficulty</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Answer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayed.map((q, i) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggleSelect(q.id)} className="w-4 h-4 accent-indigo-600" />
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">{(page - 1) * LIMIT + i + 1}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="truncate font-medium text-slate-800" title={q.question}>{q.question}</div>
                      </td>
                      <td className="px-4 py-3"><LevelBadge level={String(q.level)} /></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{q.category || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${q.difficulty === 'EASY' ? 'bg-emerald-100 text-emerald-700' : q.difficulty === 'HARD' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {q.difficulty || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold text-xs">
                        <div className="truncate max-w-[120px]">{['A','B','C','D'][q.correct]}. {[q.optionA, q.optionB, q.optionC, q.optionD][q.correct]?.slice(0, 30)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => openEdit(q)}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => del(q.id)}>Delete</Button>
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

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Question' : 'Add Question'}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-600">Question Text</label>
            <textarea className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none h-24" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="Enter the question..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Option A" value={form.optionA} onChange={e => setForm(f => ({ ...f, optionA: e.target.value }))} />
            <Input label="Option B" value={form.optionB} onChange={e => setForm(f => ({ ...f, optionB: e.target.value }))} />
            <Input label="Option C" value={form.optionC} onChange={e => setForm(f => ({ ...f, optionC: e.target.value }))} />
            <Input label="Option D" value={form.optionD} onChange={e => setForm(f => ({ ...f, optionD: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-600">Correct Answer</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={form.correct} onChange={e => setForm(f => ({ ...f, correct: parseInt(e.target.value) }))}>
                {['Option A', 'Option B', 'Option C', 'Option D'].map((o, i) => <option key={i} value={i}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-600">Level</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={form.level} onChange={e => setForm(f => ({ ...f, level: parseInt(e.target.value) }))}>
                {[1, 2, 3, 4, 5].map(l => <option key={l} value={l}>Level {l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Category (optional)" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Electrical Safety" />
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-600">Difficulty</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                {['EASY', 'MEDIUM', 'HARD'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-600">Explanation (optional)</label>
            <textarea className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none h-20" value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Explain the correct answer..." />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Question'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
