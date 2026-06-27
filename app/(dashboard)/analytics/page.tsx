'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Card, StatCard, Progress, Button } from '@/components/ui'
import { useSession } from 'next-auth/react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899', '#14B8A6']

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN'

  if (loading) return (
    <div>
      <Topbar title="Analytics" subtitle="Performance overview" />
      <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /></div>
    </div>
  )

  const radarData = data?.levelPerf?.map((l: any) => ({ subject: `Level ${l.level}`, score: l.avg })) || []
  const trendData = data?.trend?.map((t: any, i: number) => ({ name: `#${i + 1}`, score: t.score })) || []

  return (
    <div>
      <Topbar title="Analytics" subtitle={isAdmin ? 'System-wide performance overview' : 'Your performance overview'} />
      <div className="p-7 space-y-6 animate-fade-in">

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="📝" value={data?.totalExams || 0} label="Total Exams" />
          <StatCard icon="✅" value={data?.passed || 0} label="Passed" />
          <StatCard icon="❌" value={data?.failed || 0} label="Failed" />
          <StatCard icon="📊" value={`${data?.overall || 0}%`} label="Avg Score" />
        </div>

        {isAdmin && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="🎓" value={data?.totalStudents || 0} label="Total Students" />
            <StatCard icon="❓" value={data?.totalQuestions || 0} label="Questions" />
            <StatCard icon="🛡️" value={data?.totalAdmins || 0} label="Admins" />
            <StatCard icon="📈" value={data?.totalExams ? `${Math.round(data.passed / data.totalExams * 100)}%` : '0%'} label="Pass Rate" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar */}
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 mb-4">Performance by Level (Radar)</h3>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid gridType="polygon" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Radar name="Score" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip formatter={(v: any) => [`${v}%`, 'Avg Score']} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Take exams to see performance data</div>
            )}
          </Card>

          {/* Score Trend */}
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 mb-4">Score Trend (Last 20 Exams)</h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => [`${v}%`, 'Score']} />
                  <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2.5} dot={{ fill: '#6366F1', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400 text-sm">No trend data yet</div>
            )}
          </Card>
        </div>

        {/* Level Breakdown */}
        <Card className="p-5">
          <h3 className="font-bold text-slate-800 mb-5">Level Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {data?.levelPerf?.map((l: any) => (
              <div key={l.level} className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-sm font-bold text-slate-500 mb-2">Level {l.level}</div>
                <div className="text-3xl font-extrabold mb-2" style={{ color: l.avg >= 70 ? '#10B981' : l.avg >= 50 ? '#F59E0B' : '#EF4444' }}>{l.avg}%</div>
                <Progress value={l.avg} className="mb-2" />
                <div className="text-xs text-slate-400">{l.count} exam(s)</div>
                {isAdmin && <div className="text-xs text-slate-400 mt-1">{l.passed} passed</div>}
              </div>
            ))}
          </div>
        </Card>

        {/* Admin-only charts */}
        {isAdmin && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pass Rate by Level */}
              <Card className="p-5">
                <h3 className="font-bold text-slate-800 mb-4">Pass Rate by Level</h3>
                {data?.passRateByLevel?.some((l: any) => l.count > 0) ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.passRateByLevel} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="level" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v: any) => [`${v}%`, 'Pass Rate']} />
                      <Bar dataKey="passRate" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-60 text-slate-400 text-sm">No exam data yet</div>
                )}
              </Card>

              {/* Category Distribution */}
              <Card className="p-5">
                <h3 className="font-bold text-slate-800 mb-4">Questions by Category</h3>
                {data?.categoryData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={data.categoryData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {data.categoryData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-60 text-slate-400 text-sm">No category data yet</div>
                )}
              </Card>
            </div>

            {/* Daily Registrations */}
            {data?.dailyRegistrations?.length > 0 && (
              <Card className="p-5">
                <h3 className="font-bold text-slate-800 mb-4">Daily Student Registrations (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.dailyRegistrations} barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} name="Registrations" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
