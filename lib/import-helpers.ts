export type ImportStatus = 'valid' | 'duplicate' | 'invalid'

export interface ParsedQuestionRow {
  rowIndex: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correct: number | null
  explanation?: string
  level: number | null
  category?: string
  difficulty?: string
  status: ImportStatus
  errors: string[]
  duplicateOf?: string
}

export interface RawQuestionInput {
  question?: string
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  correct?: string | number
  explanation?: string
  level?: string | number
  category?: string
  difficulty?: string
}

const ANSWER_LETTER_MAP: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, '1': 0, '2': 1, '3': 2, '4': 3 }

export function normalizeText(s: string | undefined | null): string {
  return (s || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '')
}

export function parseCorrectAnswer(raw: string | number | undefined): number | null {
  if (raw === undefined || raw === null || raw === '') return null
  if (typeof raw === 'number') {
    if (raw >= 0 && raw <= 3) return raw
    if (raw >= 1 && raw <= 4) return raw - 1
    return null
  }
  const cleaned = raw.toString().trim().toUpperCase().replace(/[.):]/g, '')
  if (cleaned in ANSWER_LETTER_MAP) return ANSWER_LETTER_MAP[cleaned]
  const n = parseInt(cleaned, 10)
  if (!isNaN(n)) {
    if (n >= 0 && n <= 3) return n
    if (n >= 1 && n <= 4) return n - 1
  }
  return null
}

export function parseLevel(raw: string | number | undefined): number | null {
  if (raw === undefined || raw === null || raw === '') return null
  const n = typeof raw === 'number' ? raw : parseInt(raw.toString().replace(/[^\d]/g, ''), 10)
  if (isNaN(n) || n < 1 || n > 5) return null
  return n
}

export function normalizeDifficulty(raw?: string): string {
  const v = (raw || '').trim().toUpperCase()
  if (['EASY', 'MEDIUM', 'HARD'].includes(v)) return v
  return 'MEDIUM'
}

/**
 * Validates a single raw row and returns structured errors, without checking duplicates.
 */
export function validateRow(raw: RawQuestionInput, rowIndex: number): ParsedQuestionRow {
  const errors: string[] = []

  const question = (raw.question || '').trim()
  const optionA = (raw.optionA || '').trim()
  const optionB = (raw.optionB || '').trim()
  const optionC = (raw.optionC || '').trim()
  const optionD = (raw.optionD || '').trim()
  const correct = parseCorrectAnswer(raw.correct)
  const level = parseLevel(raw.level)
  const category = (raw.category || '').trim() || undefined
  const difficulty = normalizeDifficulty(raw.difficulty)
  const explanation = (raw.explanation || '').trim() || undefined

  if (!question || question.length < 5) errors.push('Question text missing or too short')
  if (!optionA) errors.push('Option A missing')
  if (!optionB) errors.push('Option B missing')
  if (!optionC) errors.push('Option C missing')
  if (!optionD) errors.push('Option D missing')
  if (correct === null) errors.push('Correct answer missing or invalid (use A–D or 1–4)')
  if (level === null) errors.push('Level missing or invalid (must be 1–5)')

  return {
    rowIndex,
    question,
    optionA,
    optionB,
    optionC,
    optionD,
    correct,
    explanation,
    level,
    category,
    difficulty,
    status: errors.length ? 'invalid' : 'valid',
    errors,
  }
}

/**
 * Given a list of already-validated rows, marks duplicates against both
 * existing DB questions and earlier rows within the same batch.
 */
export async function flagDuplicates(rows: ParsedQuestionRow[]): Promise<ParsedQuestionRow[]> {
  const candidates = rows.filter(r => r.status === 'valid')
  if (candidates.length === 0) return rows

  const { prisma } = await import('@/lib/prisma')
  const existing = await prisma.question.findMany({
    where: { active: true },
    select: { id: true, question: true },
  })
  const existingMap = new Map<string, string>(existing.map(q => [normalizeText(q.question), q.id as string]))
  const seenInBatch = new Map<string, number>() // normalized text -> rowIndex

  for (const row of rows) {
    if (row.status !== 'valid') continue
    const norm = normalizeText(row.question)
    const existingId = existingMap.get(norm)
    if (existingId) {
      row.status = 'duplicate'
      row.duplicateOf = existingId
      row.errors.push('Matches an existing question in the database')
      continue
    }
    const earlierRow = seenInBatch.get(norm)
    if (earlierRow !== undefined) {
      row.status = 'duplicate'
      row.errors.push(`Duplicate of row #${earlierRow} in this import`)
      continue
    }
    seenInBatch.set(norm, row.rowIndex)
  }

  return rows
}
