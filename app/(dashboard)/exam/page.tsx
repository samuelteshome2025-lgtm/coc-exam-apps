'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import { Card, Button } from '@/components/ui'

const EXAM_TYPES = [
  { id: 'level1', title: 'Level 1 Exam', desc: 'Foundation concepts and basic principles', icon: '🌱', color: '#1D4ED8', bg: '#EFF6FF', duration: 45, questions: 15 },
  { id: 'level2', title: 'Level 2 Exam', desc: 'Intermediate knowledge and application', icon: '📗', color: '#166534', bg: '#F0FDF4', duration: 50, questions: 15 },
  { id: 'level3', title: 'Level 3 Exam', desc: 'Advanced concepts and problem solving', icon: '📙', color: '#92400E', bg: '#FFFBEB', duration: 55, questions: 15 },
  { id: 'level4', title: 'Level 4 Exam', desc: 'Expert-level knowledge and analysis', icon: '🔥', color: '#9A3412', bg: '#FFF7ED', duration: 60, questions: 15 },
  { id: 'level5', title: 'Level 5 Exam', desc: 'Master-level competency assessment', icon: '💎', color: '#7E22CE', bg: '#FDF4FF', duration: 65, questions: 15 },
  { id: 'mixed', title: 'Mixed Level Exam', desc: 'Questions from all levels combined', icon: '🎯', color: '#4F46E5', bg: '#EEF2FF', duration: 60, questions: 20 },
  { id: 'full', title: 'Full COC Simulation', desc: 'Complete exam simulation — all 5 levels', icon: '🏆', color: '#D97706', bg: '#FFFBEB', duration: 120, questions: 50 },
]

export default function ExamPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const startExam = async (type: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/exams/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to start exam'); return }
      // Store exam data in sessionStorage for the exam engine page
      sessionStorage.setItem('coc_exam', JSON.stringify(data))
      router.push('/exam/session')
    } catch {
      toast.error('Failed to start exam. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Topbar title="Take Exams" subtitle="Choose an exam type to begin" />
      <div className="p-7 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Select Your Exam</h2>
          <p className="text-slate-500 text-sm">Each session uses randomized questions. Practice as many times as you like.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {EXAM_TYPES.map(exam => (
            <Card key={exam.id} className="p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => !loading && startExam(exam.id)}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: exam.bg }}>{exam.icon}</div>
                <div>
                  <div className="font-bold text-slate-900 text-base">{exam.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{exam.desc}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-extrabold text-slate-800">{exam.questions}</div>
                  <div className="text-xs text-slate-400">Questions</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-extrabold text-slate-800">{exam.duration}</div>
                  <div className="text-xs text-slate-400">Minutes</div>
                </div>
              </div>
              <Button variant="primary" className="w-full justify-center" disabled={loading}>
                {loading ? 'Loading...' : 'Start Exam →'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
