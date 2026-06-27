import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { normalizeText } from '@/lib/import-helpers'

const rowSchema = z.object({
  question: z.string().min(5),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  correct: z.number().min(0).max(3),
  level: z.number().min(1).max(5),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  explanation: z.string().optional(),
})

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1).max(1000),
  source: z.enum(['pdf', 'excel', 'csv']).optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 })
  }

  const { rows, source } = parsed.data

  // Re-check duplicates server-side at commit time to guard against races
  // (e.g. two admins importing overlapping files at once).
  const existing = await prisma.question.findMany({ where: { active: true }, select: { question: true } })
  const existingSet = new Set(existing.map(q => normalizeText(q.question)))

  const toCreate: typeof rows = []
  const seenInBatch = new Set<string>()
  let skippedDuplicates = 0

  for (const row of rows) {
    const norm = normalizeText(row.question)
    if (existingSet.has(norm) || seenInBatch.has(norm)) {
      skippedDuplicates++
      continue
    }
    seenInBatch.add(norm)
    toCreate.push(row)
  }

  let created = 0
  if (toCreate.length > 0) {
    const result = await prisma.question.createMany({
      data: toCreate.map(r => ({
        question: r.question,
        optionA: r.optionA,
        optionB: r.optionB,
        optionC: r.optionC,
        optionD: r.optionD,
        correct: r.correct,
        level: r.level,
        category: r.category || null,
        difficulty: r.difficulty || 'MEDIUM',
        explanation: r.explanation || null,
      })),
    })
    created = result.count
  }

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      action: `Imported ${created} question(s)${source ? ` via ${source.toUpperCase()}` : ''}`,
      details: `Skipped ${skippedDuplicates} duplicate(s) out of ${rows.length} submitted`,
    },
  }).catch(() => {})

  return NextResponse.json({
    created,
    skippedDuplicates,
    submitted: rows.length,
  })
}
