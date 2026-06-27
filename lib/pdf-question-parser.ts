import { RawQuestionInput } from '@/lib/import-helpers'

/**
 * Splits raw PDF text into per-question blocks and extracts fields.
 * Supports common layouts like:
 *
 *   1. What is the capital of France?
 *   A. London
 *   B. Paris
 *   C. Berlin
 *   D. Madrid
 *   Answer: B
 *   Level: 1
 *   Category: Geography
 *   Explanation: Paris is the capital of France.
 *
 * Tolerates "Q1)", "1)", "A)", "A:", "Correct Answer:", "Ans:", missing
 * Level/Category/Explanation, and extra blank lines.
 */

const QUESTION_START = /^\s*(?:Q(?:uestion)?\.?\s*)?(\d{1,3})[\.\):]\s+/i
const OPTION_LINE = /^\s*([A-Da-d])\s*[\.\):]\s*(.+)$/
const ANSWER_LINE = /^\s*(?:Correct\s+)?Ans(?:wer)?s?\s*[:\-]?\s*([A-Da-d]|[1-4])\b/i
const LEVEL_LINE = /^\s*Level\s*[:\-]?\s*(\d)/i
const CATEGORY_LINE = /^\s*Category\s*[:\-]?\s*(.+)$/i
const EXPLANATION_LINE = /^\s*Explanation\s*[:\-]?\s*(.+)$/i

export function parseQuestionsFromPdfText(text: string): RawQuestionInput[] {
  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  // Find indices where a new question starts
  const startIndices: number[] = []
  lines.forEach((line, i) => {
    if (QUESTION_START.test(line)) startIndices.push(i)
  })

  if (startIndices.length === 0) {
    // Fallback: treat the whole document as one block (rare single-question PDFs)
    return extractFieldsFromBlock(lines) ? [extractFieldsFromBlock(lines)!] : []
  }

  const blocks: string[][] = []
  for (let i = 0; i < startIndices.length; i++) {
    const start = startIndices[i]
    const end = i + 1 < startIndices.length ? startIndices[i + 1] : lines.length
    blocks.push(lines.slice(start, end))
  }

  const results: RawQuestionInput[] = []
  for (const block of blocks) {
    const parsed = extractFieldsFromBlock(block)
    if (parsed) results.push(parsed)
  }
  return results
}

function extractFieldsFromBlock(block: string[]): RawQuestionInput | null {
  if (block.length === 0) return null

  let questionText = block[0].replace(QUESTION_START, '').trim()
  const options: Record<string, string> = {}
  let answer: string | undefined
  let level: string | undefined
  let category: string | undefined
  const explanationParts: string[] = []
  let collectingExplanation = false

  for (let i = 1; i < block.length; i++) {
    const line = block[i]

    const optMatch = line.match(OPTION_LINE)
    const ansMatch = line.match(ANSWER_LINE)
    const levelMatch = line.match(LEVEL_LINE)
    const catMatch = line.match(CATEGORY_LINE)
    const expMatch = line.match(EXPLANATION_LINE)

    if (optMatch) {
      collectingExplanation = false
      options[optMatch[1].toUpperCase()] = optMatch[2].trim()
    } else if (ansMatch) {
      collectingExplanation = false
      answer = ansMatch[1].toUpperCase()
    } else if (levelMatch) {
      collectingExplanation = false
      level = levelMatch[1]
    } else if (catMatch) {
      collectingExplanation = false
      category = catMatch[1].trim()
    } else if (expMatch) {
      collectingExplanation = true
      explanationParts.push(expMatch[1].trim())
    } else if (collectingExplanation) {
      explanationParts.push(line)
    } else if (!optMatch && Object.keys(options).length === 0) {
      // Question text wrapped onto multiple lines before options begin
      questionText += ' ' + line
    }
  }

  return {
    question: questionText.trim(),
    optionA: options['A'] || '',
    optionB: options['B'] || '',
    optionC: options['C'] || '',
    optionD: options['D'] || '',
    correct: answer,
    level,
    category,
    explanation: explanationParts.join(' ').trim() || undefined,
  }
}
