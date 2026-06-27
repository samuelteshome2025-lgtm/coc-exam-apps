import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.user.findMany({
    where: { role: 'STUDENT', active: true },
    select: { id: true, name: true, points: true, createdAt: true },
    orderBy: { points: 'desc' },
    take: 50,
  })

  const leaderboard = users.map((u, i) => ({ ...u, rank: i + 1 }))
  return NextResponse.json({ leaderboard })
}
