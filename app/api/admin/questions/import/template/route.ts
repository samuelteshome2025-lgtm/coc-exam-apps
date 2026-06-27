import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import * as XLSX from 'xlsx'
import { buildTemplateWorkbook } from '@/lib/spreadsheet-question-parser'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') === 'csv' ? 'csv' : 'xlsx'

  const workbook = buildTemplateWorkbook()

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]])
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="question-import-template.csv"',
      },
    })
  }

  const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="question-import-template.xlsx"',
    },
  })
}
