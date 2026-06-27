import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const isStudent = session.user.role === 'STUDENT'
  const where = isStudent ? { userId: session.user.id } : {}

  const [results, total] = await Promise.all([
    prisma.result.findMany({
      where,
      select: {
        id: true, userId: true, examName: true, examType: true, level: true,
        score: true, total: true, percentage: true, passed: true, timeUsed: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.result.count({ where }),
  ])

  return NextResponse.json({ results, total, page, pages: Math.ceil(total / limit) })
}
