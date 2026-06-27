'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const [liveData, setLiveData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/homepage').then(r => r.json()).then(setLiveData).catch(() => {})
  }, [])

  const features = [
    { icon: '📝', title: '5-Level Exam Engine', desc: 'Practice with Level 1–5 exams, mixed exams, and full COC simulations with randomized questions and a live timer.', bg: '#EEF2FF' },
    { icon: '📊', title: 'Smart Analytics', desc: 'Deep performance analytics by level, trend charts, and readiness percentage so you know exactly where to focus.', bg: '#ECFDF5' },
    { icon: '🤖', title: 'Personalized Feedback', desc: 'AI-style feedback identifying your strong and weak areas with actionable improvement recommendations.', bg: '#FFF7ED' },
    { icon: '🏆', title: 'Competitive Leaderboard', desc: 'Compete with fellow students on all-time rankings. Earn points and unlock achievement badges.', bg: '#FDF4FF' },
    { icon: '💡', title: 'Answer Explanations', desc: 'Every question comes with a detailed explanation so you learn from every mistake and strengthen your understanding.', bg: '#ECFEFF' },
    { icon: '📱', title: 'Mobile Friendly', desc: 'Study anywhere, anytime. Fully responsive and works perfectly on mobile, tablet, and desktop.', bg: '#FFFBEB' },
  ]

  const faqs = [
    ['What is the COC Exam?', "The Competency Occupational Certificate (COC) exam certifies occupational competency for workers in Ethiopia's TVET system across 5 levels."],
    ['How many question levels are there?', 'There are 5 levels — from basic (Level 1) to master-level (Level 5). Each builds on the previous and aligns with Ethiopian occupational standards.'],
    ['Can I retake practice exams?', 'Yes! You can take unlimited practice exams. Each session randomizes questions from our bank for diverse practice.'],
    ['How is readiness calculated?', 'Readiness is calculated from your average scores, exam frequency, and performance across all levels. Aim for 80%+ to feel confident.'],
    ['Is there a leaderboard?', 'Yes. Our competitive leaderboard ranks all students by points. Earn points for correct answers, high scores, and completing exams.'],
  ]

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFC', color: '#0F172A' }}>
      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'rgba(30,27,75,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4F46E5,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>C</div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>COC Prep</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.25)', padding: '8px 18px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Sign In</Link>
            <Link href="/register" style={{ background: 'white', color: '#3730A3', padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#1E1B4B 0%,#312E81 35%,#4F46E5 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 80px' }}>
        <div style={{ maxWidth: 760 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            🏆 #1 COC Exam Preparation Platform in Ethiopia
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: 20 }}>
            Prepare Smarter. Pass Your{' '}
            <span style={{ background: 'linear-gradient(90deg,#38BDF8,#818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>COC Examination</span>{' '}
            With Confidence.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px' }}>
            Join thousands of Ethiopian workers using our intelligent practice system to prepare for COC examinations across all 5 competency levels.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ background: 'white', color: '#3730A3', padding: '13px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>Start Free Today →</Link>
            <Link href="/login" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '13px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#4F46E5', marginBottom: 12 }}>Features</div>
            <h2 style={{ fontSize: 'clamp(26px,3vw,38px)', fontWeight: 800 }}>Built for Serious COC Candidates</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live System Info */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#4F46E5', marginBottom: 12 }}>Live System</div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800 }}>What's Happening on COC Prep</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
            {/* Top Performers */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>🏆 Top Performers</h3>
              {liveData?.topPerformers?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {liveData.topPerformers.map((p: any, i: number) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>#{i + 1}</div>
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: '#6366F1', fontWeight: 700 }}>{p.points.toLocaleString()} pts</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No performers yet — be the first!</p>
              )}
            </div>

            {/* Recent Exams */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>📝 Recent Exams</h3>
              {liveData?.recentExams?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {liveData.recentExams.map((e: any) => (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                      <span style={{ fontSize: 16 }}>{e.passed ? '✅' : '📚'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#1E293B' }}>{e.examName}</div>
                        <div style={{ color: '#94A3B8', fontSize: 12 }}>{e.user?.name}</div>
                      </div>
                      <span style={{ fontWeight: 700, color: e.percentage >= 60 ? '#10B981' : '#EF4444' }}>{e.percentage}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No exams completed yet.</p>
              )}
            </div>

            {/* Announcements */}
            <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>📢 Announcements</h3>
              {liveData?.announcements?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {liveData.announcements.map((a: any) => (
                    <div key={a.id} style={{ padding: '10px 14px', background: '#EEF2FF', borderRadius: 10, fontSize: 14 }}>
                      <div style={{ fontWeight: 600, color: '#3730A3' }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{new Date(a.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>No announcements at this time.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: 'white', borderTop: '1px solid #E2E8F0', padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#4F46E5', marginBottom: 12 }}>FAQ</div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800 }}>Common Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqs.map(([q, a]) => (
              <details key={String(q)} style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
                <summary style={{ padding: '16px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 15, background: 'white', listStyle: 'none' }}>{q}</summary>
                <div style={{ padding: '16px 20px', fontSize: 14, color: '#475569', lineHeight: 1.7, background: '#F8FAFC' }}>{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg,#1E1B4B,#4F46E5)', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(26px,3vw,38px)', fontWeight: 800, color: 'white', marginBottom: 14 }}>Ready to Pass Your COC Exam?</h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, marginBottom: 32 }}>Join thousands of students preparing smarter today.</p>
        <Link href="/register" style={{ background: 'white', color: '#3730A3', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none', display: 'inline-block' }}>Create Free Account →</Link>
      </section>

      <footer style={{ background: '#0F172A', color: '#94A3B8', textAlign: 'center', padding: '36px 24px' }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'white', marginBottom: 6 }}>COC Exam Preparation System</div>
        <div style={{ fontSize: 13, marginBottom: 16 }}>Helping Ethiopian workers achieve occupational certification excellence</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13 }}>
          <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Contact</a>
        </div>
        <div style={{ marginTop: 16, fontSize: 12 }}>© {new Date().getFullYear()} COC Exam System. All rights reserved.</div>
      </footer>
    </div>
  )
}
