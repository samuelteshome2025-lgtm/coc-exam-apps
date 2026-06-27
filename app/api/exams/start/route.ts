import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { shuffle } from '@/lib/utils'
import { z } from 'zod'

const startSchema = z.object({
  type: z.enum(['level1','level2','level3','level4','level5','mixed','full']),
})

const EXAM_CONFIG: Record<string, { title: string; duration: number; questionsPerLevel?: number; totalQuestions?: number; level?: number }> = {
  level1: { title: 'Level 1 Exam', duration: 45, level: 1, totalQuestions: 15 },
  level2: { title: 'Level 2 Exam', duration: 50, level: 2, totalQuestions: 15 },
  level3: { title: 'Level 3 Exam', duration: 55, level: 3, totalQuestions: 15 },
  level4: { title: 'Level 4 Exam', duration: 60, level: 4, totalQuestions: 15 },
  level5: { title: 'Level 5 Exam', duration: 65, level: 5, totalQuestions: 15 },
  mixed: { title: 'Mixed Level Exam', duration: 60, questionsPerLevel: 4, totalQuestions: 20 },
  full: { title: 'Full COC Simulation', duration: 120, questionsPerLevel: 10, totalQuestions: 50 },
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Students only' }, { status: 403 })

  const body = await req.json()
  const parsed = startSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid exam type' }, { status: 400 })

  const { type } = parsed.data
  const config = EXAM_CONFIG[type]
  let questions: any[] = []

  if (type === 'mixed' || type === 'full') {
    for (let l = 1; l <= 5; l++) {
      const lqs = await prisma.question.findMany({ where: { level: l, active: true } })
      questions.push(...shuffle(lqs).slice(0, config.questionsPerLevel))
    }
    questions = shuffle(questions)
  } else {
    const level = config.level!
    const allQs = await prisma.question.findMany({ where: { level, active: true } })
    if (allQs.length < 5) return NextResponse.json({ error: 'Not enough questions for this level' }, { status: 400 })
    questions = shuffle(allQs).slice(0, config.totalQuestions)
  }

  if (questions.length < 5) {
    return NextResponse.json({ error: 'Not enough questions available' }, { status: 400 })
  }

  const safeQuestions = questions.map(q => ({
    id: q.id,
    question: q.question,
    options: [q.optionA, q.optionB, q.optionC, q.optionD],
    level: q.level,
  }))

  return NextResponse.json({
    examType: type,
    title: config.title,
    duration: config.duration,
    questions: safeQuestions,
  })
}
