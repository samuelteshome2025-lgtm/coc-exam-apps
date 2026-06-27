// @ts-nocheck
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const superAdminPw = await bcrypt.hash('SuperAdmin@123', 12)
  await prisma.user.upsert({
    where: { email: 'superadmin@coc.edu' },
    update: {},
    create: { name: 'Super Admin', email: 'superadmin@coc.edu', password: superAdminPw, role: 'SUPERADMIN', active: true },
  })

  const adminPw = await bcrypt.hash('Admin@123', 12)
  for (const [name, email] of [['Admin One', 'admin1@coc.edu'], ['Admin Two', 'admin2@coc.edu']]) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, password: adminPw, role: 'ADMIN', active: true },
    })
  }

  const studentPw = await bcrypt.hash('Student@123', 12)
  const students = [
    { name: 'Abebe Kebede', email: 'abebe@student.com', points: 1850 },
    { name: 'Tigist Alemu', email: 'tigist@student.com', points: 2100 },
    { name: 'Dawit Haile', email: 'dawit@student.com', points: 1560 },
    { name: 'Meron Tadesse', email: 'meron@student.com', points: 2340 },
    { name: 'Yonas Girma', email: 'yonas@student.com', points: 980 },
  ]
  for (const s of students) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { ...s, password: studentPw, role: 'STUDENT', active: true, phone: '0911' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0') },
    })
  }

  const bank = [
    { q: 'What is the primary purpose of the COC examination?', o: ['To assess academic knowledge', 'To certify occupational competency', 'To award academic degrees', 'To test language skills'], a: 1, e: 'The COC exam certifies that a worker has the required occupational competency for a specific trade.' },
    { q: 'Which body administers COC exams in Ethiopia?', o: ['Ministry of Education', 'TVET Agency', 'Ethiopian Employers Federation', 'Higher Education Agency'], a: 1, e: 'The TVET Agency is responsible for COC examinations in Ethiopia.' },
    { q: 'What is the minimum passing score for COC exams?', o: ['40%', '50%', '60%', '70%'], a: 2, e: 'The minimum passing score for COC examinations is 60%.' },
    { q: 'Which is NOT a component of a COC examination?', o: ['Written test', 'Practical demonstration', 'Oral interview', 'Physical fitness test'], a: 3, e: 'COC exams consist of written, practical, and oral components.' },
    { q: 'How many occupational levels exist in the Ethiopian TVET system?', o: ['3', '4', '5', '6'], a: 2, e: 'The Ethiopian TVET system has 5 occupational levels.' },
    { q: 'What does a COC Level 3 certificate indicate?', o: ['Entry-level competency', 'Intermediate competency', 'Advanced specialist competency', 'Supervisory competency'], a: 2, e: 'Level 3 indicates advanced specialist competency.' },
    { q: 'In a COC practical exam, assessors primarily evaluate:', o: ['Speed of completion', 'Theoretical knowledge', 'Safety standards and proper technique', 'Creativity'], a: 2, e: 'Assessors evaluate safe and correct application of required skills.' },
    { q: 'What is the validity period of a COC certificate?', o: ['1 year', '3 years', '5 years', 'Lifetime'], a: 3, e: 'COC certificates are generally valid for the lifetime of the holder.' },
    { q: 'COC Level 1 primarily targets:', o: ['University graduates', 'Workers with no formal education', 'Entry-level trade workers', 'Senior managers'], a: 2, e: 'Level 1 is designed for entry-level trade workers.' },
    { q: 'What evidence is required for RPL COC assessment?', o: ['Academic transcripts only', 'Work samples, portfolios and references', 'Criminal background check', 'Medical certificates'], a: 1, e: 'RPL requires work samples, portfolios, and references.' },
    { q: 'What is the role of an industry assessor in COC?', o: ['To teach candidates', 'To evaluate competency against national standards', 'To issue certificates', 'To set national policy'], a: 1, e: 'Industry assessors evaluate candidates against nationally defined competency standards.' },
    { q: 'Which document guides the content of a COC examination?', o: ['Industry guidelines', 'Occupational Standard (OS)', 'Employer preferences', 'ISO standards'], a: 1, e: 'The Occupational Standard defines competencies and guides COC exam content.' },
    { q: 'What is a competency unit in COC context?', o: ['A single task', 'A group of related skills forming a coherent function', 'A type of certificate', 'A training module'], a: 1, e: 'A competency unit is a group of related skills forming a meaningful workplace function.' },
    { q: 'How should a candidate prepare for the practical COC exam?', o: ['Only read textbooks', 'Practice actual job tasks and ensure tool familiarity', 'Memorize theory only', 'Focus only on written tests'], a: 1, e: 'Hands-on practice and tool familiarity is essential for the practical exam.' },
    { q: 'What happens if a candidate fails a COC examination?', o: ['Permanently banned', 'Wait 6 months', 'Retake after addressing identified gaps', 'Automatically pass next level'], a: 2, e: 'Candidates may retake after addressing identified competency gaps.' },
    { q: 'Which Ethiopian ministry oversees the TVET system?', o: ['Ministry of Labour', 'Ministry of Education', 'Ministry of Trade', 'Ministry of Science'], a: 1, e: 'The Ministry of Education oversees the TVET system.' },
    { q: 'What distinguishes COC Level 5 from Level 4?', o: ['Level 5 is for supervisors only', 'Level 4 is regional only', 'Level 5 requires managerial and higher cognitive skills', 'No difference'], a: 2, e: 'Level 5 requires planning, evaluation, and managerial competencies beyond Level 4.' },
    { q: 'What does "assessment criteria" mean in COC?', o: ['The score needed to pass', 'Specific measurable standards to judge competency', 'The list of exam questions', 'Assessor qualifications'], a: 1, e: 'Assessment criteria are measurable indicators used to judge whether competency is achieved.' },
    { q: 'What does "holistic assessment" refer to in COC?', o: ['Assessing only theory', 'Evaluating attitude only', 'All competency units assessed together in realistic context', 'Only practical demonstration'], a: 2, e: 'Holistic assessment evaluates all competency units together in a realistic work context.' },
    { q: 'What is "formative assessment" in TVET?', o: ['Final certification exam', 'Ongoing assessment to guide learning', 'Assessment by industry partners', 'International benchmark testing'], a: 1, e: 'Formative assessment is ongoing evaluation used to identify gaps and guide further study.' },
    { q: 'What does TVET stand for?', o: ['Technical and Vocational Education and Training', 'Technology and Vocational Examination Testing', 'Technical Vocational Evaluation Test', 'Training and Vocational Education Test'], a: 0, e: 'TVET stands for Technical and Vocational Education and Training.' },
    { q: 'At which COC level does a holder demonstrate supervisory ability?', o: ['Level 1', 'Level 2', 'Level 3', 'Level 4 and 5'], a: 3, e: 'Level 4 and 5 holders typically demonstrate supervisory and managerial capabilities.' },
    { q: 'Which exam tests practical application of skills?', o: ['Written exam', 'Practical/hands-on exam', 'Oral interview', 'Online test'], a: 1, e: 'The practical exam tests hands-on application of skills in a real or simulated environment.' },
    { q: 'A student who scores 72% on a COC exam has:', o: ['Failed', 'Borderline passed', 'Passed comfortably', 'Achieved distinction'], a: 2, e: '72% is above the 60% passing mark, representing a comfortable pass.' },
    { q: 'What is the purpose of the oral component in COC assessment?', o: ['To test reading speed', 'To verify understanding and communication of technical knowledge', 'To assess personality', 'To check language only'], a: 1, e: 'The oral component verifies depth of understanding and ability to communicate technical knowledge.' },
  ]

  let created = 0
  for (let level = 1; level <= 5; level++) {
    for (let i = 0; i < 20; i++) {
      const bq = bank[(i + (level - 1) * 5) % bank.length]
      await prisma.question.create({
        data: { question: `[Level ${level}] ${bq.q}`, optionA: bq.o[0], optionB: bq.o[1], optionC: bq.o[2], optionD: bq.o[3], correct: bq.a, explanation: bq.e, level },
      })
      created++
    }
  }
  console.log(`✅ Created ${created} questions`)

  await prisma.announcement.createMany({
    data: [
      { title: 'Welcome to COC Exam System!', body: 'Start your preparation journey today. New questions are added weekly. Good luck!' },
      { title: 'New Level 5 Questions Added', body: '50 new Level 5 questions have been added to help you prepare for advanced certification.' },
    ],
    skipDuplicates: true,
  })

  for (const [key, value] of Object.entries({
    siteName: 'COC Exam Preparation System',
    passMark: '60',
    examDuration: '60',
    maintenanceMode: 'false',
  })) {
    await prisma.systemSettings.upsert({ where: { key }, update: {}, create: { key, value } })
  }

  console.log('✅ Seeding complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
