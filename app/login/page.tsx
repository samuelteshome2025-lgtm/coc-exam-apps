'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'superadmin@coc.edu', password: 'SuperAdmin@123' },
  { label: 'Admin', email: 'admin1@coc.edu', password: 'Admin@123' },
  { label: 'Student', email: 'abebe@student.com', password: 'Student@123' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('abebe@student.com')
  const [password, setPassword] = useState('Student@123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) { setError('Invalid email or password. Please try again.'); setLoading(false); return }
      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1E1B4B,#4F46E5)', padding: 24, fontFamily: "'Inter',sans-serif" }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 40, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#4F46E5,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 20, margin: '0 auto 12px' }}>C</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>Sign In</h1>
          <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>COC Exam Preparation System</p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '9px 13px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#4F46E5'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '9px 13px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#4F46E5'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.15s' }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#64748B' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
        </div>

        {/* Demo accounts */}
        <div style={{ marginTop: 20, borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#94A3B8', marginBottom: 8 }}>Demo Accounts — Click to Fill</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEMO_ACCOUNTS.map(a => (
              <div key={a.label} onClick={() => { setEmail(a.email); setPassword(a.password) }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#F8FAFC', borderRadius: 8, cursor: 'pointer', border: '1px solid #E2E8F0', transition: 'background 0.15s' }} onMouseOver={e => (e.currentTarget.style.background = '#EEF2FF')} onMouseOut={e => (e.currentTarget.style.background = '#F8FAFC')}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{a.label}</span>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>{a.email}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Link href="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
