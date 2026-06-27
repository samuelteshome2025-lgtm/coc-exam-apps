import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isStudent = session.user.role === 'STUDENT'
  const where = isStudent ? { userId: session.user.id } : {}

  const [results, users, questions] = await Promise.all([
    prisma.result.findMany({
      where,
      select: { percentage: true, passed: true, level: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    isStudent ? Promise.resolve([]) : prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    isStudent ? Promise.resolve([]) : prisma.question.findMany({
      where: { active: true },
      select: { category: true, level: true },
    }),
  ])

  const totalExams = results.length
  const passed = results.filter(r => r.passed).length
  const failed = totalExams - passed
  const overall = totalExams ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / totalExams) : 0

  const levelPerf = [1, 2, 3, 4, 5].map(l => {
    const lr = results.filter(r => r.level === String(l))
    return {
      level: l,
      avg: lr.length ? Math.round(lr.reduce((a, r) => a + r.percentage, 0) / lr.length) : 0,
      count: lr.length,
      passed: lr.filter(r => r.passed).length,
    }
  })

  const trend = results.slice(-20).map(r => ({ score: Math.round(r.percentage), date: r.createdAt }))

  const dailyRegistrations: { date: string; count: number }[] = []
  if (!isStudent && users.length > 0) {
    const last30 = new Date(); last30.setDate(last30.getDate() - 30)
    const grouped: Record<string, number> = {}
    users.filter(u => u.createdAt > last30).forEach(u => {
      const d = u.createdAt.toISOString().split('T')[0]
      grouped[d] = (grouped[d] || 0) + 1
    })
    Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, count]) => dailyRegistrations.push({ date, count }))
  }

  const categoryMap: Record<string, number> = {}
  if (!isStudent) {
    questions.forEach(q => {
      const cat = q.category || 'Uncategorized'
      categoryMap[cat] = (categoryMap[cat] || 0) + 1
    })
  }
  const categoryData = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count).slice(0, 8)

  const passRateByLevel = levelPerf.map(l => ({
    level: `Level ${l.level}`,
    passRate: l.count ? Math.round((l.passed / l.count) * 100) : 0,
    count: l.count,
  }))

  let totalStudents = 0, totalQuestions = 0, totalAdmins = 0
  if (!isStudent) {
    const [sc, qc, ac] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.question.count({ where: { active: true } }),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPERADMIN'] } } }),
    ])
    totalStudents = sc; totalQuestions = qc; totalAdmins = ac
  }

  return NextResponse.json({
    totalExams, passed, failed, overall, levelPerf, trend,
    dailyRegistrations, categoryData, passRateByLevel,
    totalStudents, totalQuestions, totalAdmins, totalResults: totalExams,
  })
}
