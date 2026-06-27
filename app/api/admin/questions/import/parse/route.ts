import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { validateRow, flagDuplicates, RawQuestionInput } from '@/lib/import-helpers'
import { parseQuestionsFromPdfText } from '@/lib/pdf-question-parser'
import { parseQuestionsFromSpreadsheet } from '@/lib/spreadsheet-question-parser'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const MAX_ROWS = 1000

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid upload' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const type = (formData.get('type') as string | null) || 'auto'

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'The uploaded file is empty' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File is too large (max 15MB)' }, { status: 400 })
  }

  const fileName = file.name.toLowerCase()
  const isPdf = type === 'pdf' || fileName.endsWith('.pdf')
  const isSpreadsheet = type === 'excel' || type === 'csv' || fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')

  if (!isPdf && !isSpreadsheet) {
    return NextResponse.json({ error: 'Unsupported file type. Upload a PDF, .xlsx, or .csv file.' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let rawRows: RawQuestionInput[] = []

  try {
    if (isPdf) {
      // Lazy-import pdf-parse to avoid loading it on every cold start unnecessarily.
      // v2 API: PDFParse class instance with getText(), not the old v1 default-export function.
      const { PDFParse } = await import('pdf-parse')
      const parser = new PDFParse({ data: buffer })
      let text = ''
      try {
        const result = await parser.getText()
        text = result.text || ''
      } finally {
        await parser.destroy()
      }
      if (!text.trim()) {
        return NextResponse.json({ error: 'No extractable text found in this PDF. It may be a scanned image without OCR.' }, { status: 400 })
      }
      rawRows = parseQuestionsFromPdfText(text).map(r => ({ ...r }))
    } else {
      rawRows = parseQuestionsFromSpreadsheet(buffer)
    }
  } catch (err) {
    console.error('Import parse error:', err)
    return NextResponse.json({ error: 'Failed to read the file. Please check the format and try again.' }, { status: 400 })
  }

  if (rawRows.length === 0) {
    return NextResponse.json({ error: 'No questions could be detected in this file.' }, { status: 400 })
  }
  if (rawRows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Too many rows (${rawRows.length}). Please split into batches of ${MAX_ROWS} or fewer.` }, { status: 400 })
  }

  let parsedRows = rawRows.map((raw, i) => validateRow(raw, i + 1))
  parsedRows = await flagDuplicates(parsedRows)

  const summary = {
    total: parsedRows.length,
    valid: parsedRows.filter(r => r.status === 'valid').length,
    duplicate: parsedRows.filter(r => r.status === 'duplicate').length,
    invalid: parsedRows.filter(r => r.status === 'invalid').length,
  }

  return NextResponse.json({ rows: parsedRows, summary })
}
