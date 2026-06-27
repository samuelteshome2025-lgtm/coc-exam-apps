import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [
    totalStudents,
    totalQuestions,
    totalExams,
    results,
    levels,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.question.count({ where: { active: true } }),
    prisma.result.count(),
    prisma.result.findMany({ select: { percentage: true, passed: true } }),
    prisma.question.groupBy({ by: ['level'], _count: true }),
  ])

  const passRate = results.length
    ? Math.round((results.filter(r => r.passed).length / results.length) * 100)
    : 0
  const avgScore = results.length
    ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length)
    : 0
  const highestScore = results.length
    ? Math.round(Math.max(...results.map(r => r.percentage)))
    : 0

  return NextResponse.json({
    totalStudents,
    totalQuestions,
    totalExams,
    passRate,
    avgScore,
    highestScore,
    totalLevels: levels.length,
  })
}
