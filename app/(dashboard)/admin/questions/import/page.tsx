'use client'
import { Fragment, useRef, useState } from 'react'
import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import { Card, Button, Badge, EmptyState, Spinner } from '@/components/ui'
import { toast } from 'sonner'

type Tab = 'pdf' | 'spreadsheet'

interface Row {
  rowIndex: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correct: number | null
  explanation?: string
  level: number | null
  category?: string
  difficulty?: string
  status: 'valid' | 'duplicate' | 'invalid'
  errors: string[]
  duplicateOf?: string
}

interface Summary {
  total: number
  valid: number
  duplicate: number
  invalid: number
}

export default function ImportQuestionsPage() {
  const [tab, setTab] = useState<Tab>('pdf')
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [rows, setRows] = useState<Row[] | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [committing, setCommitting] = useState(false)
  const [result, setResult] = useState<{ created: number; skippedDuplicates: number; submitted: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setFile(null)
    setRows(null)
    setSummary(null)
    setSelected(new Set())
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const switchTab = (t: Tab) => {
    setTab(t)
    reset()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    setRows(null)
    setSummary(null)
    setResult(null)
    setError(null)
  }

  const parse = async () => {
    if (!file) { toast.error('Choose a file first'); return }
    setParsing(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', tab === 'pdf' ? 'pdf' : 'excel')
      const res = await fetch('/api/admin/questions/import/parse', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to parse file')
        setParsing(false)
        return
      }
      setRows(data.rows)
      setSummary(data.summary)
      setSelected(new Set(data.rows.filter((r: Row) => r.status === 'valid').map((r: Row) => r.rowIndex)))
    } catch {
      setError('Something went wrong reading that file.')
    }
    setParsing(false)
  }

  const toggleRow = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const toggleAll = (status?: Row['status']) => {
    if (!rows) return
    const target = status ? rows.filter(r => r.status === status) : rows
    const allSelected = target.every(r => selected.has(r.rowIndex))
    setSelected(prev => {
      const next = new Set(prev)
      target.forEach(r => allSelected ? next.delete(r.rowIndex) : next.add(r.rowIndex))
      return next
    })
  }

  const commit = async () => {
    if (!rows) return
    const chosen = rows.filter(r => selected.has(r.rowIndex) && r.status !== 'invalid')
    if (chosen.length === 0) { toast.error('Select at least one valid question to import'); return }
    setCommitting(true)
    try {
      const res = await fetch('/api/admin/questions/import/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: tab === 'pdf' ? 'pdf' : (file?.name.toLowerCase().endsWith('.csv') ? 'csv' : 'excel'),
          rows: chosen.map(r => ({
            question: r.question,
            optionA: r.optionA,
            optionB: r.optionB,
            optionC: r.optionC,
            optionD: r.optionD,
            correct: r.correct,
            level: r.level,
            category: r.category,
            difficulty: r.difficulty,
            explanation: r.explanation,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Import failed'); setCommitting(false); return }
      setResult(data)
      toast.success(`Imported ${data.created} question(s)`)
    } catch {
      toast.error('Import failed. Please try again.')
    }
    setCommitting(false)
  }

  const downloadTemplate = (format: 'xlsx' | 'csv') => {
    window.open(`/api/admin/questions/import/template?format=${format}`, '_blank')
  }

  const statusBadge = (status: Row['status']) => {
    if (status === 'valid') return <Badge variant="success">Valid</Badge>
    if (status === 'duplicate') return <Badge variant="warning">Duplicate</Badge>
    return <Badge variant="danger">Invalid</Badge>
  }

  return (
    <div>
      <Topbar title="Import Questions" subtitle="Bulk-add questions from PDF, Excel, or CSV" />
      <div className="p-7 animate-fade-in max-w-5xl">
        <Link href="/admin/questions" className="text-sm text-indigo-600 font-semibold hover:underline mb-4 inline-block">← Back to Question Bank</Link>

        <div className="flex gap-2 mb-5">
          <button onClick={() => switchTab('pdf')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'pdf' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>📄 PDF Import</button>
          <button onClick={() => switchTab('spreadsheet')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'spreadsheet' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>📊 Excel / CSV Import</button>
        </div>

        {!result && (
          <Card className="p-6 mb-6">
            {tab === 'pdf' ? (
              <p className="text-sm text-slate-500 mb-4">
                Upload a PDF where each question follows a numbered pattern with options A–D and an answer line, e.g. <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">1. Question text... A. ... B. ... Answer: B Level: 2 Category: Safety</span>. Level and Category lines are optional but recommended.
              </p>
            ) : (
              <div className="text-sm text-slate-500 mb-4 flex items-center justify-between flex-wrap gap-2">
                <span>Upload an .xlsx or .csv file with columns Question, OptionA–D, CorrectAnswer, Level, Category, Difficulty, Explanation.</span>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => downloadTemplate('xlsx')}>Download .xlsx template</Button>
                  <Button variant="outline" size="sm" onClick={() => downloadTemplate('csv')}>Download .csv template</Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept={tab === 'pdf' ? '.pdf' : '.xlsx,.xls,.csv'}
                onChange={handleFileChange}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold file:text-xs"
              />
              <Button onClick={parse} disabled={!file || parsing}>{parsing ? 'Reading file...' : 'Parse & Preview'}</Button>
              {file && <Button variant="ghost" onClick={reset}>Clear</Button>}
            </div>

            {error && (
              <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
            )}
          </Card>
        )}

        {parsing && (
          <div className="flex justify-center py-16"><Spinner /></div>
        )}

        {!result && rows && summary && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <Card className="p-4"><div className="text-2xl font-extrabold text-slate-900">{summary.total}</div><div className="text-xs text-slate-500 font-semibold">Detected</div></Card>
              <Card className="p-4"><div className="text-2xl font-extrabold text-emerald-600">{summary.valid}</div><div className="text-xs text-slate-500 font-semibold">Valid</div></Card>
              <Card className="p-4"><div className="text-2xl font-extrabold text-amber-600">{summary.duplicate}</div><div className="text-xs text-slate-500 font-semibold">Duplicates</div></Card>
              <Card className="p-4"><div className="text-2xl font-extrabold text-red-600">{summary.invalid}</div><div className="text-xs text-slate-500 font-semibold">Invalid</div></Card>
            </div>

            <Card>
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm text-slate-500 font-semibold">{selected.size} selected for import</span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => toggleAll('valid')}>Toggle all valid</Button>
                  <Button variant="secondary" size="sm" onClick={() => toggleAll()}>Toggle all</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 w-10"></th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Question</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Level</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map(r => (
                      <Fragment key={r.rowIndex}>
                        <tr className={`hover:bg-slate-50 transition-colors ${r.status === 'invalid' ? 'opacity-60' : ''}`}>
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={selected.has(r.rowIndex)} disabled={r.status === 'invalid'} onChange={() => toggleRow(r.rowIndex)} className="w-4 h-4 accent-indigo-600" />
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs font-mono">{r.rowIndex}</td>
                          <td className="px-4 py-3 max-w-md">
                            <button onClick={() => setExpanded(expanded === r.rowIndex ? null : r.rowIndex)} className="truncate font-medium text-slate-800 text-left hover:text-indigo-600" title={r.question}>
                              {r.question || <span className="text-slate-400 italic">No question text detected</span>}
                            </button>
                            {r.errors.length > 0 && <div className="text-xs text-red-500 mt-1">{r.errors.join('; ')}</div>}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{r.level ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{r.category || '—'}</td>
                          <td className="px-4 py-3">{statusBadge(r.status)}</td>
                        </tr>
                        {expanded === r.rowIndex && (
                          <tr key={`${r.rowIndex}-detail`} className="bg-slate-50">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div><span className="font-bold text-slate-500">A.</span> {r.optionA || '—'}</div>
                                <div><span className="font-bold text-slate-500">B.</span> {r.optionB || '—'}</div>
                                <div><span className="font-bold text-slate-500">C.</span> {r.optionC || '—'}</div>
                                <div><span className="font-bold text-slate-500">D.</span> {r.optionD || '—'}</div>
                              </div>
                              <div className="text-xs mt-2"><span className="font-bold text-slate-500">Correct:</span> {r.correct !== null ? ['A', 'B', 'C', 'D'][r.correct] : '—'}</div>
                              {r.explanation && <div className="text-xs mt-1"><span className="font-bold text-slate-500">Explanation:</span> {r.explanation}</div>}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="secondary" onClick={reset}>Start Over</Button>
                <Button onClick={commit} disabled={committing || selected.size === 0}>{committing ? 'Importing...' : `Import ${selected.size} Question(s)`}</Button>
              </div>
            </Card>
          </>
        )}

        {result && (
          <Card className="p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Import Complete</h3>
            <p className="text-slate-500 text-sm mb-6">
              Added <span className="font-bold text-emerald-600">{result.created}</span> new question(s) to the bank.
              {result.skippedDuplicates > 0 && <> Skipped <span className="font-bold text-amber-600">{result.skippedDuplicates}</span> duplicate(s).</>}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={reset}>Import Another File</Button>
              <Link href="/admin/questions"><Button>Go to Question Bank</Button></Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
