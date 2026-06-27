'use client'
import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import { Card, Progress } from '@/components/ui'
import { useSession } from 'next-auth/react'

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const [leaders, setLeaders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then(d => { setLeaders(d.leaderboard || []); setLoading(false) })
  }, [])

  const top3 = leaders.slice(0, 3)
  const rest = leaders.slice(3)

  return (
    <div>
      <Topbar title="Leaderboard" subtitle="Top performing students" />
      <div className="p-7 animate-fade-in">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 3 && (
              <Card className="p-8 mb-6">
                <h2 className="text-center font-bold text-slate-800 text-lg mb-8">🏆 Top Performers</h2>
                <div className="flex items-end justify-center gap-6">
                  {/* 2nd */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold text-lg border-4 border-slate-300">{top3[1]?.name?.[0]}</div>
                    <div className="w-20 h-20 bg-gradient-to-b from-slate-400 to-slate-500 rounded-t-xl flex items-center justify-center text-white font-extrabold text-2xl">2</div>
                    <div className="text-xs font-bold text-center text-slate-600">{top3[1]?.name?.split(' ')[0]}</div>
                    <div className="text-xs text-slate-400">{top3[1]?.points?.toLocaleString()} pts</div>
                  </div>
                  {/* 1st */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-2xl">👑</div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl border-4 border-amber-300">{top3[0]?.name?.[0]}</div>
                    <div className="w-20 h-28 bg-gradient-to-b from-amber-400 to-amber-600 rounded-t-xl flex items-center justify-center text-white font-extrabold text-2xl">1</div>
                    <div className="text-xs font-bold text-center text-slate-600">{top3[0]?.name?.split(' ')[0]}</div>
                    <div className="text-xs text-slate-400">{top3[0]?.points?.toLocaleString()} pts</div>
                  </div>
                  {/* 3rd */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center text-white font-bold text-lg border-4 border-amber-600">{top3[2]?.name?.[0]}</div>
                    <div className="w-20 h-14 bg-gradient-to-b from-amber-700 to-amber-800 rounded-t-xl flex items-center justify-center text-white font-extrabold text-2xl">3</div>
                    <div className="text-xs font-bold text-center text-slate-600">{top3[2]?.name?.split(' ')[0]}</div>
                    <div className="text-xs text-slate-400">{top3[2]?.points?.toLocaleString()} pts</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Full table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Rank</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Student</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Points</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Avg Score</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Exams</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Readiness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaders.map((u: any) => {
                      const isMe = u.id === session?.user?.id
                      return (
                        <tr key={u.id} className={`transition-colors ${isMe ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-50'}`}>
                          <td className="px-5 py-3.5">
                            <span className="font-extrabold text-base" style={{ color: u.rank <= 3 ? '#F59E0B' : '#94A3B8' }}>
                              {u.rank <= 3 ? ['🥇','🥈','🥉'][u.rank - 1] : `#${u.rank}`}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">{u.name?.[0]}</div>
                              <span className={`font-semibold ${isMe ? 'text-indigo-700' : 'text-slate-800'}`}>{u.name}{isMe ? ' (You)' : ''}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-800">{u.points?.toLocaleString()}</td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold" style={{ color: u.avgScore >= 70 ? '#10B981' : u.avgScore >= 50 ? '#F59E0B' : '#94A3B8' }}>{u.avgScore}%</span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{u.examsCount}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <Progress value={u.readiness} className="w-20" />
                              <span className="text-xs font-bold text-slate-600">{u.readiness}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {leaders.length === 0 && (
                  <div className="text-center py-16 text-slate-400">No students have taken exams yet.</div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
