'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatTime } from '@/lib/utils'
import { Button, Progress } from '@/components/ui'

interface Question { id: string; question: string; options: string[]; level: number }
interface ExamData { examType: string; title: string; duration: number; questions: Question[] }

export default function ExamSessionPage() {
  const router = useRouter()
  const [exam, setExam] = useState<ExamData | null>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('coc_exam')
    if (!stored) { router.push('/exam'); return }
    const data: ExamData = JSON.parse(stored)
    setExam(data)
    setTimeLeft(data.duration * 60)
  }, [router])

  const submitExam = useCallback(async (auto = false) => {
    if (!exam || submitting) return
    setSubmitting(true)
    if (auto) toast.info('Time is up! Submitting your exam...')
    try {
      const timeUsed = exam.duration * 60 - timeLeft
      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examType: exam.examType, title: exam.title, duration: exam.duration, timeUsed, questionIds: exam.questions.map(q => q.id), answers }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Submit failed'); setSubmitting(false); return }
      sessionStorage.removeItem('coc_exam')
      sessionStorage.setItem('coc_result', JSON.stringify(data.result))
      router.push('/exam/result')
    } catch {
      toast.error('Submission failed. Please try again.')
      setSubmitting(false)
    }
  }, [exam, timeLeft, answers, submitting, router])

  useEffect(() => {
    if (!exam) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); submitExam(true); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [exam, submitExam])

  if (!exam) return <div className="flex items-center justify-center h-screen"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>

  const q = exam.questions[current]
  const answeredCount = Object.keys(answers).length
  const isWarning = timeLeft <= 300

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Exam Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => { if (confirm('End exam? All progress will be lost.')) { sessionStorage.removeItem('coc_exam'); router.push('/exam') } }} className="text-sm text-slate-500 hover:text-slate-700 font-semibold border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">✕ End</button>
          <div>
            <div className="font-bold text-slate-900 text-sm">{exam.title}</div>
            <div className="text-xs text-slate-400">{answeredCount}/{exam.questions.length} answered</div>
          </div>
        </div>
        <div className={`flex items-center gap-2 font-mono font-extrabold text-xl px-4 py-2 rounded-xl ${isWarning ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-800'}`}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-5 grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-5">
        {/* Question */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-7 mb-4 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question {current + 1} of {exam.questions.length}</div>
            <Progress value={((current + 1) / exam.questions.length) * 100} className="mb-5" />
            <p className="text-base font-semibold text-slate-900 leading-relaxed mb-6">{q.question}</p>
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const isSelected = answers[q.id] === i
                return (
                  <div key={i} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: i }))} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'}`}>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 text-slate-500'}`}>{['A','B','C','D'][i]}</div>
                    <span className="text-sm text-slate-700 pt-0.5 font-medium">{opt}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>← Previous</Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setFlagged(prev => { const s = new Set(prev); s.has(q.id) ? s.delete(q.id) : s.add(q.id); return s })}>
                {flagged.has(q.id) ? '🚩 Flagged' : '⚑ Flag'}
              </Button>
              {current === exam.questions.length - 1 ? (
                <Button onClick={() => { if (answeredCount < exam.questions.length && !confirm(`You have ${exam.questions.length - answeredCount} unanswered questions. Submit anyway?`)) return; submitExam() }} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Exam ✓'}
                </Button>
              ) : (
                <Button onClick={() => setCurrent(c => Math.min(exam.questions.length - 1, c + 1))}>Next →</Button>
              )}
            </div>
          </div>
        </div>

        {/* Navigator */}
        <div className="lg:block">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-24 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase mb-3">Navigator</div>
            <div className="grid grid-cols-5 gap-1.5">
              {exam.questions.map((q2, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${i === current ? 'bg-indigo-600 text-white' : flagged.has(q2.id) ? 'bg-amber-100 border border-amber-300 text-amber-700' : answers[q2.id] !== undefined ? 'bg-indigo-100 border border-indigo-300 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-indigo-100 border border-indigo-300" /> Answered</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-100 border border-amber-300" /> Flagged</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-100" /> Not visited</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
