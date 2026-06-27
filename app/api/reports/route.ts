import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role === 'STUDENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'results'
  const format = searchParams.get('format') || 'xlsx'

  let rows: any[] = []
  let sheetName = 'Report'

  if (type === 'results') {
    const results = await prisma.result.findMany({
      select: {
        examName: true, examType: true, level: true,
        score: true, total: true, percentage: true, passed: true, timeUsed: true, createdAt: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    })
    rows = results.map(r => ({
      'Student Name': r.user.name,
      'Email': r.user.email,
      'Exam': r.examName,
      'Type': r.examType,
      'Level': r.level,
      'Score': r.score,
      'Total': r.total,
      'Percentage': `${r.percentage}%`,
      'Passed': r.passed ? 'Yes' : 'No',
      'Time Used (sec)': r.timeUsed,
      'Date': new Date(r.createdAt).toLocaleDateString(),
    }))
    sheetName = 'Results'
  } else if (type === 'students') {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { name: true, email: true, phone: true, points: true, active: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    rows = students.map(s => ({
      'Name': s.name,
      'Email': s.email,
      'Phone': s.phone || '',
      'Points': s.points,
      'Status': s.active ? 'Active' : 'Inactive',
      'Joined': new Date(s.createdAt).toLocaleDateString(),
    }))
    sheetName = 'Students'
  } else if (type === 'questions') {
    const questions = await prisma.question.findMany({
      where: { active: true },
      select: { question: true, optionA: true, optionB: true, optionC: true, optionD: true, correct: true, level: true, category: true, difficulty: true },
      orderBy: { level: 'asc' },
    })
    rows = questions.map(q => ({
      'Question': q.question,
      'Option A': q.optionA,
      'Option B': q.optionB,
      'Option C': q.optionC,
      'Option D': q.optionD,
      'Correct Answer': ['A', 'B', 'C', 'D'][q.correct],
      'Level': q.level,
      'Category': q.category || '',
      'Difficulty': q.difficulty || 'MEDIUM',
    }))
    sheetName = 'Questions'
  }

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${type}-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  })
}
