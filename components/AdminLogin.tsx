'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '@/actions/admin'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <form className="bg-white border border-cream-border rounded-xl p-6 flex flex-col gap-4" onSubmit={async e => {
        e.preventDefault()
        setPending(true)
        setError('')
        try {
          const result = await loginAdmin(email, password)
          if (result.error) setError(result.error)
          else { setPassword(''); router.refresh() }
        } catch { setError('Unable to sign in. Please try again.') }
        finally { setPending(false) }
      }}>
        <h1 className="text-lg font-bold">Admin Login</h1>
        <label className="text-sm">Email
          <input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full border border-cream-border rounded-lg p-2" />
        </label>
        <label className="text-sm">Password
          <input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border border-cream-border rounded-lg p-2" />
        </label>
        {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
        <button disabled={pending} className="bg-primary text-white font-bold text-sm py-3 rounded-lg disabled:opacity-60">{pending ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}
