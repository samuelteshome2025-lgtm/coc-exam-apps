'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Card, Badge, LevelBadge, EmptyState } from '@/components/ui'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function ResultsPage() {
  const { data: session } = useSession()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/results?limit=50').then(r => r.json()).then(d => { setResults(d.results || []); setLoading(false) })
  }, [])

  const isAdmin = session?.user?.role !== 'STUDENT'

  return (
    <div>
      <Topbar title={isAdmin ? 'All Results' : 'My Results'} subtitle="Exam history and scores" />
      <div className="p-7 animate-fade-in">
        <Card className="p-6">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin" style={{ borderWidth: 3 }} /></div>
          ) : results.length === 0 ? (
            <EmptyState icon="📊" title="No results yet" subtitle="Complete an exam to see your results here." action={<Link href="/exam" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm">Start Exam</Link>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 rounded-xl">
                  <tr>
                    {isAdmin && <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Student</th>}
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Exam</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Correct</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">{r.user?.name?.[0]}</div>
                            <span className="font-semibold text-slate-800">{r.user?.name}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 font-semibold text-slate-800">{r.examName}</td>
                      <td className="px-4 py-3"><LevelBadge level={r.level} /></td>
                      <td className="px-4 py-3 font-bold" style={{ color: r.percentage >= 60 ? '#10B981' : '#EF4444' }}>{r.percentage}%</td>
                      <td className="px-4 py-3 text-slate-500">{r.score}/{r.total}</td>
                      <td className="px-4 py-3 text-slate-400">{Math.floor(r.timeUsed / 60)}m</td>
                      <td className="px-4 py-3 text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><Badge variant={r.passed ? 'success' : 'danger'}>{r.passed ? 'Passed' : 'Failed'}</Badge></td>
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
