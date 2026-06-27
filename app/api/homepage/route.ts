import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [recentStudents, recentExams, announcements, topPerformers, categories] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.result.findMany({
      select: {
        id: true, examName: true, percentage: true, passed: true, createdAt: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.announcement.findMany({
      where: { active: true },
      select: { id: true, title: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.user.findMany({
      where: { role: 'STUDENT', points: { gt: 0 } },
      select: { id: true, name: true, points: true },
      orderBy: { points: 'desc' },
      take: 5,
    }),
    prisma.question.groupBy({
      by: ['category'],
      _count: { id: true },
      where: { active: true, category: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
  ])

  return NextResponse.json({ recentStudents, recentExams, announcements, topPerformers, categories })
}
