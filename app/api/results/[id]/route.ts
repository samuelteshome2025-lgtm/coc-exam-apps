import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const result = await prisma.result.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  })

  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (session.user.role === 'STUDENT' && result.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ result })
}
