'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, Badge, StatCard } from '@/components/ui'

export default function ExamResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('coc_result')
    if (!stored) { router.push('/exam'); return }
    setResult(JSON.parse(stored))
  }, [router])

  if (!result) return <div className="flex items-center justify-center h-screen"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>

  const tm = Math.floor(result.timeUsed / 60)
  const ts = result.timeUsed % 60
  const questions: any[] = result.questions || []

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Score Card */}
        <div className={`rounded-2xl p-10 text-center text-white shadow-lg ${result.passed ? 'bg-gradient-to-br from-emerald-600 to-emerald-500' : 'bg-gradient-to-br from-red-700 to-red-500'}`}>
          <div className="text-2xl mb-3">{result.passed ? '🎉 Congratulations!' : '📚 Keep Practicing!'}</div>
          <div className="text-6xl font-extrabold mb-2">{result.percentage}%</div>
          <div className="text-lg opacity-90 mb-4">{result.examName}</div>
          <div className="inline-block bg-white/20 px-6 py-2 rounded-full font-extrabold text-lg backdrop-blur-sm">
            {result.passed ? 'PASSED ✓' : 'FAILED ✗'}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="✅" value={result.score} label="Correct" />
          <StatCard icon="❌" value={result.total - result.score} label="Incorrect" />
          <StatCard icon="⏱" value={`${tm}m ${ts}s`} label="Time Used" />
          <StatCard icon="📊" value={`${result.percentage}%`} label="Score" />
        </div>

        {/* Answer Review */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">Answer Review</h2>
            <span className="text-sm bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">{result.total} questions</span>
          </div>
          <div className="space-y-4">
            {questions.map((q: any, i: number) => {
              const isCorrect = q.selected === q.correct
              return (
                <div key={q.id} className={`border-l-4 rounded-xl p-5 border ${isCorrect ? 'border-l-emerald-500 border-emerald-100 bg-emerald-50/50' : 'border-l-red-500 border-red-100 bg-red-50/50'}`}>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Q{i + 1} · {isCorrect ? '✅ Correct' : '❌ Incorrect'}</div>
                  <p className="font-semibold text-slate-800 text-sm mb-3">{q.question}</p>
                  <div className="space-y-1.5">
                    {q.options.map((opt: string, j: number) => (
                      <div key={j} className={`px-3 py-2 rounded-lg text-sm font-medium ${j === q.correct ? 'bg-emerald-100 text-emerald-800' : j === q.selected && j !== q.correct ? 'bg-red-100 text-red-800' : 'bg-slate-50 text-slate-600'}`}>
                        <span className="font-bold mr-2">{'ABCD'[j]}.</span>{opt}
                        {j === q.correct && ' ✓'}
                        {j === q.selected && j !== q.correct && ' ✗'}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700">
                      <span className="font-bold">💡 Explanation: </span>{q.explanation}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        <div className="flex gap-3 justify-center">
          <Link href="/results" className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 font-semibold px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors">📋 All Results</Link>
          <Link href="/exam" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors">🔄 New Exam</Link>
        </div>
      </div>
    </div>
  )
}
