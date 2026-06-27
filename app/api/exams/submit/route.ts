import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const submitSchema = z.object({
  examType: z.string(),
  title: z.string(),
  duration: z.number(),
  timeUsed: z.number(),
  questionIds: z.array(z.string()),
  answers: z.record(z.string(), z.number()),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })

  const { examType, title, duration, timeUsed, questionIds, answers } = parsed.data

  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
  })

  if (questions.length === 0) return NextResponse.json({ error: 'Questions not found' }, { status: 400 })

  let correct = 0
  const questionResults = questions.map(q => {
    const selected = answers[q.id] ?? -1
    const isCorrect = selected === q.correct
    if (isCorrect) correct++
    return {
      id: q.id,
      question: q.question,
      options: [q.optionA, q.optionB, q.optionC, q.optionD],
      correct: q.correct,
      selected,
      explanation: q.explanation,
      level: q.level,
    }
  })

  const total = questions.length
  const percentage = Math.round((correct / total) * 100)
  const passed = percentage >= 60

  const levelMap: Record<string, string> = {
    level1: '1', level2: '2', level3: '3', level4: '4', level5: '5',
    mixed: 'mixed', full: 'full',
  }
  const level = levelMap[examType] || 'mixed'

  const result = await prisma.result.create({
    data: {
      userId: session.user.id,
      examName: title,
      examType,
      level,
      score: correct,
      total,
      percentage,
      passed,
      timeUsed,
      answers,
      questions: questionResults,
    },
  })

  const pointsEarned = correct * 10 + (passed ? 50 : 0)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { points: { increment: pointsEarned } },
  })

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: `Completed ${title} — ${percentage}%`,
    },
  }).catch(() => {})

  return NextResponse.json({ result: { ...result, questions: questionResults } })
}
