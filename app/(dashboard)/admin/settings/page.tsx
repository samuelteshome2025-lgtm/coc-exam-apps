'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Card, Button, Input, StatCard } from '@/components/ui'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then(r => r.json()),
      fetch('/api/dashboard/stats').then(r => r.json()),
    ]).then(([s, a]) => { setSettings(s.settings || {}); setStats(a); setLoading(false) })
  }, [])

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    if (res.ok) toast.success('Settings saved!')
    else toast.error('Save failed')
    setSaving(false)
  }

  return (
    <div>
      <Topbar title="System Settings" subtitle="Configure platform settings" />
      <div className="p-7 animate-fade-in space-y-6">
        {/* Live Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🎓" value={stats?.totalStudents ?? '...'} label="Total Students" />
          <StatCard icon="❓" value={stats?.totalQuestions ?? '...'} label="Questions" />
          <StatCard icon="📝" value={stats?.totalExams ?? '...'} label="Total Exams" />
          <StatCard icon="✅" value={stats?.passRate !== undefined ? `${stats.passRate}%` : '...'} label="Pass Rate" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="📊" value={stats?.avgScore !== undefined ? `${stats.avgScore}%` : '...'} label="Avg Score" />
          <StatCard icon="🏆" value={stats?.highestScore !== undefined ? `${stats.highestScore}%` : '...'} label="Highest Score" />
          <StatCard icon="🔢" value={stats?.totalLevels ?? '...'} label="Exam Levels" />
          <StatCard icon="🌐" value="Live" label="Data Status" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-5">General Settings</h3>
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                <Input label="Site Name" value={settings.siteName || ''} onChange={e => setSettings((s: any) => ({ ...s, siteName: e.target.value }))} placeholder="COC Exam System" />
                <Input label="Default Pass Mark (%)" type="number" value={settings.passMark || '60'} onChange={e => setSettings((s: any) => ({ ...s, passMark: e.target.value }))} />
                <Input label="Default Exam Duration (minutes)" type="number" value={settings.examDuration || '60'} onChange={e => setSettings((s: any) => ({ ...s, examDuration: e.target.value }))} />
                <Input label="Questions Per Exam" type="number" value={settings.questionsPerExam || '30'} onChange={e => setSettings((s: any) => ({ ...s, questionsPerExam: e.target.value }))} />
                <div className="space-y-3">
                  {[
                    { key: 'shuffleQuestions', label: 'Shuffle Question Order' },
                    { key: 'shuffleAnswers', label: 'Shuffle Answer Options' },
                    { key: 'registrationEnabled', label: 'Allow Student Registration' },
                    { key: 'examAccessEnabled', label: 'Allow Exam Access' },
                    { key: 'maintenanceMode', label: 'Maintenance Mode' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm font-semibold text-slate-700">{label}</span>
                      <button
                        onClick={() => setSettings((s: any) => ({ ...s, [key]: s[key] === 'true' ? 'false' : 'true' }))}
                        className={`w-12 h-6 rounded-full transition-all duration-200 ${settings[key] === 'true' ? 'bg-indigo-600' : 'bg-slate-300'} relative`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${settings[key] === 'true' ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <Button onClick={save} disabled={saving} className="w-full justify-center">{saving ? 'Saving...' : 'Save Settings'}</Button>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-bold text-slate-800 mb-5">Reports & Exports</h3>
              <div className="space-y-3">
                {[
                  { type: 'results', label: 'Export Results Report', icon: '📋', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
                  { type: 'students', label: 'Export Student List', icon: '🎓', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
                  { type: 'questions', label: 'Export Question Bank', icon: '❓', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
                ].map(r => (
                  <button
                    key={r.type}
                    onClick={() => window.open(`/api/reports?type=${r.type}&format=xlsx`, '_blank')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${r.color}`}
                  >
                    <span className="text-lg">{r.icon}</span>
                    {r.label}
                    <span className="ml-auto text-xs opacity-60">⬇ Excel</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-slate-800 mb-5">Danger Zone</h3>
              <div className="space-y-3">
                <div className="p-4 border border-red-200 rounded-xl bg-red-50">
                  <div className="font-semibold text-red-800 mb-1 text-sm">Reset All Data</div>
                  <p className="text-xs text-red-600 mb-3">This will permanently delete all exam results and activity logs.</p>
                  <Button variant="danger" size="sm" onClick={() => toast.error('This action is disabled for safety.')}>Reset Data</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
