import { useState } from 'react'
import { ArrowLeft, LockKeyhole, LogIn } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function AdminLogin() {
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState('')
  const [busy,setBusy] = useState(false)
  const navigate = useNavigate()
  async function submit(e) {
    e.preventDefault(); setError('')
    if (!isSupabaseConfigured) { setError('Supabase is not configured yet. Follow the README setup instructions first.'); return }
    setBusy(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (authError) setError(authError.message)
    else navigate('/admin')
  }
  return <main className="login-page"><Link to="/" className="login-back"><ArrowLeft size={16}/> Back to storefront</Link><div className="login-card"><div className="login-logo"><span className="brand-mark">m.</span></div><p className="eyebrow">STORE MANAGEMENT</p><h1>Welcome <em>back.</em></h1><p className="login-intro">Sign in to manage your product catalogue.</p><form onSubmit={submit} className="admin-form login-form"><label>Email address<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com"/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark full-button" disabled={busy}>{busy ? 'Signing in…' : <><LockKeyhole size={17}/> Sign in securely <LogIn size={16}/></>}</button></form><p className="login-footnote">Admin access only. Accounts are created in your Supabase project.</p></div></main>
}