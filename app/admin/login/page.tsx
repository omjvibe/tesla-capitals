'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Brand } from '@/components/platform-shell'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Unauthorized access. Admin credentials required.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-foreground p-6">
      <div className="w-full max-w-sm">
        <Brand dark />
        <div className="mt-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Command center</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-background">Admin access.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Authorized personnel only. All access is logged.
          </p>
        </div>

        {error && (
          <div className="mt-6 border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-xs font-bold text-muted-foreground">
            Email address
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@teslacapital.com"
              required
              className="h-12 border border-border bg-card px-4 text-foreground outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-bold text-muted-foreground">
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-12 border border-border bg-card px-4 text-foreground outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Access command center'}
          </button>
        </form>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Unauthorized access is prohibited
        </p>
      </div>
    </main>
  )
}
