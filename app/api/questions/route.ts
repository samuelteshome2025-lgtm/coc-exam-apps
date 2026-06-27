import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const questionSchema = z.object({
  question: z.string().min(5),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  correct: z.number().min(0).max(3),
  explanation: z.string().optional(),
  level: z.number().min(1).max(5),
  category: z.string().optional(),
  difficulty: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const level = searchParams.get('level')
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const skip = (page - 1) * limit

  const where: any = {
    active: true,
    ...(level && level !== 'all' ? { level: parseInt(level) } : {}),
    ...(search ? { OR: [
      { question: { contains: search, mode: 'insensitive' as const } },
      { category: { contains: search, mode: 'insensitive' as const } },
    ]} : {}),
  }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.question.count({ where }),
  ])

  return NextResponse.json({ questions, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = questionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Validation error' }, { status: 400 })
  }

  const question = await prisma.question.create({ data: parsed.data })
  await prisma.activityLog.create({
    data: { userId: session.user.id, action: `Question added: Level ${question.level}`, details: question.question.slice(0, 80) },
  }).catch(() => {})

  return NextResponse.json({ question }, { status: 201 })
}
