// @ts-nocheck
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Topbar from '@/components/layout/Topbar'
import { Card, StatCard, Badge, Progress, LevelBadge } from '@/components/ui'
import { calculateReadiness } from '@/lib/utils'
import Link from 'next/link'
import DashboardCharts from '@/components/dashboard/DashboardCharts'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const userId = session.user.id
  const role = session.user.role

  if (role === 'STUDENT') {
    const results = await prisma.result.findMany({
      where: { userId },
      select: { percentage: true, passed: true, level: true, examName: true, examType: true, createdAt: true, id: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
    const allResults = await prisma.result.findMany({ where: { userId }, select: { percentage: true, level: true } })
    const avg = allResults.length ? Math.round(allResults.reduce((a, r) => a + r.percentage, 0) / allResults.length) : 0
    const best = allResults.length ? Math.max(...allResults.map(r => r.percentage)) : 0
    const readiness = calculateReadiness(avg, allResults.length)

    const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true, points: true }, orderBy: { points: 'desc' } })
    const rank = students.findIndex(s => s.id === userId) + 1
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, points: true } })

    const levelPerf = [1, 2, 3, 4, 5].map(l => {
      const lr = allResults.filter(r => r.level === String(l))
      return { level: l, avg: lr.length ? Math.round(lr.reduce((a, r) => a + r.percentage, 0) / lr.length) : 0, count: lr.length }
    })

    const weakest = [...levelPerf].filter(l => l.count > 0).sort((a, b) => a.avg - b.avg)[0]
    const strongest = [...levelPerf].filter(l => l.count > 0).sort((a, b) => b.avg - a.avg)[0]

    const badges = [
      { icon: '🌱', name: 'Beginner', earned: allResults.length >= 1 },
      { icon: '⭐', name: 'Intermediate', earned: allResults.length >= 5 },
      { icon: '🔥', name: 'Advanced', earned: avg >= 70 },
      { icon: '💎', name: 'Expert', earned: avg >= 85 },
      { icon: '👑', name: 'COC Master', earned: avg >= 95 },
      { icon: '📅', name: 'Consistent', earned: allResults.length >= 10 },
    ]

    return (
      <div>
        <Topbar title="Dashboard" subtitle={`Welcome back, ${user?.name?.split(' ')[0]}!`} />
        <div className="p-7 space-y-6 animate-fade-in">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white flex items-center gap-5 flex-wrap">
            <div className="text-4xl">👋</div>
            <div className="flex-1">
              <div className="text-xl font-extrabold">Welcome back, {user?.name?.split(' ')[0]}!</div>
              <div className="text-indigo-200 mt-1 text-sm">Keep studying — your COC exam is within reach.</div>
            </div>
            <div className="text-center bg-white/15 rounded-xl px-6 py-3 backdrop-blur-sm">
              <div className="text-3xl font-extrabold">{readiness}%</div>
              <div className="text-xs text-indigo-200 mt-1">Readiness</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="📝" value={allResults.length} label="Exams Taken" />
            <StatCard icon="📊" value={`${avg}%`} label="Average Score" />
            <StatCard icon="🏆" value={`${best}%`} label="Best Score" />
            <StatCard icon="🥇" value={rank > 0 ? `#${rank}` : 'N/A'} label="Current Rank" />
          </div>

          {/* Weakest / Strongest */}
          {allResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-4 flex items-center gap-4">
                <div className="text-3xl">📉</div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Weakest Subject</div>
                  <div className="text-base font-bold text-red-600">{weakest ? `Level ${weakest.level} (${weakest.avg}%)` : '—'}</div>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-4">
                <div className="text-3xl">📈</div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Strongest Subject</div>
                  <div className="text-base font-bold text-emerald-600">{strongest ? `Level ${strongest.level} (${strongest.avg}%)` : '—'}</div>
                </div>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Level Performance */}
            <Card className="p-5">
              <h3 className="font-bold text-slate-800 mb-4">Level Performance</h3>
              <div className="space-y-4">
                {levelPerf.map(lp => (
                  <div key={lp.level}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-semibold text-slate-600">Level {lp.level}</span>
                      <span className="text-sm font-bold text-slate-800">{lp.avg}% ({lp.count} exams)</span>
                    </div>
                    <Progress value={lp.avg} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">Achievements</h3>
                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-full">{badges.filter(b => b.earned).length}/{badges.length}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {badges.map(b => (
                  <div key={b.name} className={`flex flex-col items-center p-3 rounded-xl border-2 text-center ${b.earned ? 'border-amber-300 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
                    <div className={`text-2xl mb-1 ${b.earned ? '' : 'grayscale opacity-40'}`}>{b.icon}</div>
                    <div className={`text-xs font-bold ${b.earned ? 'text-amber-700' : 'text-slate-400'}`}>{b.name}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Feedback */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-bold text-slate-800">Smart Feedback</h3>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">AI Insights</span>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-slate-600 leading-relaxed">
              {allResults.length === 0 ? (
                <span>🚀 <strong>Welcome!</strong> Take your first exam to receive personalized feedback and track your progress.</span>
              ) : (
                <div>
                  <p>📊 <strong>Readiness: {readiness}%</strong></p>
                  <p className="mt-2">
                    {levelPerf.filter(l => l.avg >= 75 && l.count > 0).length > 0 && (
                      <span>✅ Strong in: {levelPerf.filter(l => l.avg >= 75 && l.count > 0).map(l => `Level ${l.level}`).join(', ')}. </span>
                    )}
                    {levelPerf.filter(l => l.avg < 60 && l.count > 0).length > 0 && (
                      <span>⚠️ Needs work: {levelPerf.filter(l => l.avg < 60 && l.count > 0).map(l => `Level ${l.level}`).join(', ')}. </span>
                    )}
                  </p>
                  <p className="mt-2">
                    {readiness >= 85 ? '🎉 Excellent progress! You are highly ready for the COC examination.' :
                      readiness >= 65 ? '💪 Good progress! Continue practicing advanced questions.' :
                        '📖 Keep studying consistently. Regular practice across all levels is key to COC success.'}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Results */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Recent Exams</h3>
              <Link href="/results" className="text-sm text-indigo-600 font-semibold hover:underline">View All →</Link>
            </div>
            {results.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">📝</div>
                <p className="font-semibold text-slate-700 mb-1">No exams yet</p>
                <p className="text-sm text-slate-400 mb-4">Take your first exam to start tracking progress</p>
                <Link href="/exam" className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">Start Exam</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Exam</th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Level</th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Score</th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">{r.examName}</td>
                        <td className="px-4 py-3"><LevelBadge level={r.level} /></td>
                        <td className="px-4 py-3 font-bold" style={{ color: r.percentage >= 60 ? '#10B981' : '#EF4444' }}>{r.percentage}%</td>
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

  // Admin/Superadmin dashboard — live data
  const [
    totalStudents,
    totalQuestions,
    totalAdmins,
    results,
    recentStudents,
    recentActivity,
    levels,
    announcements,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.question.count({ where: { active: true } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.result.findMany({ select: { percentage: true, passed: true, createdAt: true }, orderBy: { createdAt: 'desc' } }),
    prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true, name: true, email: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.activityLog.findMany({ include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.question.groupBy({ by: ['level'], _count: true }),
    prisma.announcement.count({ where: { active: true } }),
  ])

  const avg = results.length ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length) : 0
  const passRate = results.length ? Math.round(results.filter(r => r.passed).length / results.length * 100) : 0
  const highestScore = results.length ? Math.round(Math.max(...results.map(r => r.percentage))) : 0

  return (
    <div>
      <Topbar title="Dashboard" subtitle="System Overview" />
      <div className="p-7 space-y-6 animate-fade-in">

        {/* Primary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🎓" value={totalStudents.toLocaleString()} label="Total Students" />
          <StatCard icon="❓" value={totalQuestions.toLocaleString()} label="Total Questions" />
          <StatCard icon="📝" value={results.length.toLocaleString()} label="Total Exams" />
          <StatCard icon="📊" value={`${avg}%`} label="Average Score" />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="✅" value={`${passRate}%`} label="Pass Rate" />
          <StatCard icon="🏆" value={`${highestScore}%`} label="Highest Score" />
          <StatCard icon="🔢" value={levels.length} label="Exam Levels" />
          {role === 'SUPERADMIN' && <StatCard icon="🛡️" value={totalAdmins} label="Admins" />}
        </div>

        <DashboardCharts />

        {/* Recently Registered Students */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Recently Registered Students</h3>
            <Link href="/admin/students" className="text-sm text-indigo-600 font-semibold hover:underline">View All →</Link>
          </div>
          {recentStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No students registered yet.</div>
          ) : (
            <div className="space-y-2">
              {recentStudents.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">{s.name?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{s.name}</div>
                    <div className="text-xs text-slate-400 truncate">{s.email}</div>
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Recent Activity</h3>
            <Link href="/admin/activity" className="text-sm text-indigo-600 font-semibold hover:underline">View All →</Link>
          </div>
          <div className="space-y-2">
            {recentActivity.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-sm">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">{a.user?.name?.[0] || '?'}</div>
                <div className="flex-1 font-medium text-slate-700">{a.action}</div>
                <div className="text-xs text-slate-400 whitespace-nowrap">{new Date(a.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-5">
          <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/admin/questions" className="flex flex-col items-center gap-2 p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors text-center">
              <span className="text-2xl">❓</span>
              <span className="text-xs font-semibold text-indigo-700">Add Questions</span>
            </Link>
            <Link href="/admin/questions/import" className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors text-center">
              <span className="text-2xl">⬆️</span>
              <span className="text-xs font-semibold text-emerald-700">Import Questions</span>
            </Link>
            <Link href="/admin/announcements" className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors text-center">
              <span className="text-2xl">📢</span>
              <span className="text-xs font-semibold text-amber-700">Announcements</span>
            </Link>
            <Link href="/admin/reports" className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center">
              <span className="text-2xl">📊</span>
              <span className="text-xs font-semibold text-purple-700">Reports</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
