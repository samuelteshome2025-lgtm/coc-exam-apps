import * as XLSX from 'xlsx'
import { RawQuestionInput } from '@/lib/import-helpers'

// Maps many possible header spellings to our canonical field names
const HEADER_ALIASES: Record<string, keyof RawQuestionInput> = {
  question: 'question',
  questiontext: 'question',
  optiona: 'optionA',
  optionA: 'optionA',
  optionb: 'optionB',
  optionc: 'optionC',
  optiond: 'optionD',
  a: 'optionA',
  b: 'optionB',
  c: 'optionC',
  d: 'optionD',
  correctanswer: 'correct',
  correct: 'correct',
  answer: 'correct',
  level: 'level',
  category: 'category',
  difficulty: 'difficulty',
  explanation: 'explanation',
}

function normalizeHeader(h: string): string {
  return h.toString().trim().toLowerCase().replace(/[\s_\-]/g, '')
}

export function parseQuestionsFromSpreadsheet(buffer: Buffer): RawQuestionInput[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) return []
  const sheet = workbook.Sheets[firstSheetName]
  const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  return rows.map(row => {
    const mapped: RawQuestionInput = {}
    for (const [rawHeader, value] of Object.entries(row)) {
      const norm = normalizeHeader(rawHeader)
      const field = HEADER_ALIASES[norm]
      if (field && value !== undefined && value !== null && value !== '') {
        ;(mapped as any)[field] = value
      }
    }
    return mapped
  })
}

export function buildTemplateWorkbook(): XLSX.WorkBook {
  const headers = ['Question', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'CorrectAnswer', 'Level', 'Category', 'Difficulty', 'Explanation']
  const sampleRow = [
    'What is the safe working voltage limit for low-voltage circuits?',
    '12V',
    '50V',
    '230V',
    '400V',
    'B',
    '2',
    'Electrical Safety',
    'MEDIUM',
    'Low voltage is generally defined as up to 50V AC under IEC standards.',
  ]
  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Questions')
  return wb
}
