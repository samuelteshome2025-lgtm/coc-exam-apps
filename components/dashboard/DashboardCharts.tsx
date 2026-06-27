'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import { Card } from '@/components/ui'

export default function DashboardCharts() {
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setAnalytics)
  }, [])

  if (!analytics) return null

  const levelData = analytics.levelPerf?.map((l: any) => ({
    name: `L${l.level}`,
    avg: l.avg,
    count: l.count,
    passRate: l.count ? Math.round((l.passed / l.count) * 100) : 0,
  })) || []

  const trendData = analytics.trend?.map((t: any, i: number) => ({ name: `#${i+1}`, score: t.score })) || []

  const pieData = [
    { name: 'Passed', value: analytics.passed || 0, color: '#10B981' },
    { name: 'Failed', value: analytics.failed || 0, color: '#EF4444' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Level Average Scores */}
      <Card className="p-5">
        <h3 className="font-bold text-slate-800 mb-4">Average Score by Level</h3>
        {levelData.some((l: any) => l.count > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={levelData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip formatter={(v: any) => [`${v}%`, 'Avg Score']} />
              <Bar dataKey="avg" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No exam data yet</div>
        )}
      </Card>

      {/* Pass / Fail Pie */}
      <Card className="p-5">
        <h3 className="font-bold text-slate-800 mb-4">Pass / Fail Distribution</h3>
        {(analytics.passed || 0) + (analytics.failed || 0) > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={12}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No exam data yet</div>
        )}
      </Card>

      {/* Score Trend */}
      {trendData.length > 0 && (
        <Card className="p-5">
          <h3 className="font-bold text-slate-800 mb-4">Recent Score Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [`${v}%`, 'Score']} />
              <Line type="monotone" dataKey="score" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3, fill: '#06B6D4' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Pass Rate by Level (admin) */}
      {analytics.passRateByLevel && analytics.passRateByLevel.some((l: any) => l.count > 0) && (
        <Card className="p-5">
          <h3 className="font-bold text-slate-800 mb-4">Pass Rate by Level</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.passRateByLevel} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="level" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [`${v}%`, 'Pass Rate']} />
              <Bar dataKey="passRate" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}
