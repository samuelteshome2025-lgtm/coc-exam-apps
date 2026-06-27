import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch recent announcements as notifications
  const announcements = await prisma.announcement.findMany({
    where: { active: true },
    select: { id: true, title: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Recent results for this user (exam completions)
  const recentResults = await prisma.result.findMany({
    where: { userId: session.user.id },
    select: { id: true, examName: true, passed: true, percentage: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const notifications = [
    ...announcements.map(a => ({
      id: `ann-${a.id}`,
      type: 'announcement' as const,
      title: '📢 ' + a.title,
      createdAt: a.createdAt,
    })),
    ...recentResults.map(r => ({
      id: `result-${r.id}`,
      type: 'exam' as const,
      title: r.passed ? `✅ Passed: ${r.examName} (${r.percentage}%)` : `📚 Completed: ${r.examName} (${r.percentage}%)`,
      createdAt: r.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15)

  return NextResponse.json({ notifications, count: notifications.length })
}
