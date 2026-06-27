'use client'
import Topbar from '@/components/layout/Topbar'
import { Card, Button } from '@/components/ui'
import { toast } from 'sonner'

const reports = [
  {
    id: 'results',
    icon: '📋',
    title: 'Student Results Report',
    desc: 'All exam results with student names, scores, pass/fail status and dates.',
    color: 'bg-indigo-50 border-indigo-200',
    iconBg: '#EEF2FF',
  },
  {
    id: 'students',
    icon: '🎓',
    title: 'Student List Report',
    desc: 'Full list of registered students with contact info, points and status.',
    color: 'bg-emerald-50 border-emerald-200',
    iconBg: '#ECFDF5',
  },
  {
    id: 'questions',
    icon: '❓',
    title: 'Question Bank Export',
    desc: 'Export all active questions with options, correct answers, levels and categories.',
    color: 'bg-amber-50 border-amber-200',
    iconBg: '#FFFBEB',
  },
]

export default function ReportsPage() {
  const download = (type: string) => {
    toast.info(`Generating ${type} report...`)
    window.open(`/api/reports?type=${type}&format=xlsx`, '_blank')
  }

  return (
    <div>
      <Topbar title="Reports" subtitle="Download system data and statistics" />
      <div className="p-7 animate-fade-in max-w-3xl">
        <div className="space-y-4">
          {reports.map(r => (
            <div key={r.id} className={`flex items-center gap-5 p-5 border rounded-2xl ${r.color}`}>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: r.iconBg }}
              >
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-800 text-base mb-1">{r.title}</div>
                <div className="text-sm text-slate-500">{r.desc}</div>
              </div>
              <Button onClick={() => download(r.id)} className="flex-shrink-0">
                ⬇ Download Excel
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-500">
          <div className="font-semibold text-slate-700 mb-1">📌 About Reports</div>
          All reports are exported as Excel (.xlsx) files and include data up to the moment of download.
          Large datasets may take a few seconds to generate.
        </div>
      </div>
    </div>
  )
}
