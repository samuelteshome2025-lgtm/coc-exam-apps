'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const { name, email, phone, password, confirm } = form
    if (!name || !email || !password) { setError('Please fill in all required fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, phone, password }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }
      // Auto sign in
      const signInResult = await signIn('credentials', { email, password, redirect: false })
      if (signInResult?.ok) {
        toast.success('Account created! Welcome to COC Prep!')
        router.push('/dashboard')
        router.refresh()
      } else {
        toast.success('Account created! Please sign in.')
        router.push('/login')
      }
    } catch {
      setError('Registration failed. Please try again.')
      setLoading(false)
    }
  }

  const f = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))
  const inputStyle = { width: '100%', padding: '9px 13px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1E1B4B,#4F46E5)', padding: 24, fontFamily: "'Inter',sans-serif" }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 40, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#4F46E5,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 20, margin: '0 auto 12px' }}>C</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>Create Account</h1>
          <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>Start your COC exam preparation</p>
        </div>

        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleRegister}>
          {[
            { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Abebe Kebede' },
            { label: 'Email Address *', key: 'email', type: 'email', placeholder: 'your@email.com' },
            { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '0911 000 000' },
            { label: 'Password *', key: 'password', type: 'password', placeholder: 'Min. 6 characters' },
            { label: 'Confirm Password *', key: 'confirm', type: 'password', placeholder: 'Repeat password' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>{label}</label>
              <input type={type} value={form[key as keyof typeof form]} onChange={e => f(key, e.target.value)} placeholder={placeholder} style={inputStyle} onFocus={e => e.target.style.borderColor = '#4F46E5'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 11, background: '#4F46E5', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#64748B' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link href="/" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
