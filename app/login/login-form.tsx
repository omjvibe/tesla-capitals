'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Brand } from '@/components/platform-shell'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const message = searchParams.get('message')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(
    errorDescription ||
      (errorParam === 'auth_callback_error'
        ? 'Authentication failed or OAuth provider is not enabled in Supabase.'
        : '')
  )
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-foreground p-10 text-background lg:flex lg:flex-col lg:justify-between">
        <Brand dark />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Welcome back</p>
          <h1 className="mt-5 text-6xl font-bold tracking-tight">Your future<br />is waiting.</h1>
        </div>
        <p className="font-mono text-[10px] tracking-widest">TESLA CAPITAL / SECURE ACCESS</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden"><Brand /></div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Member sign in</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Access your account.</h1>
          <p className="mt-3 text-sm text-muted-foreground">Manage your capital, portfolio, and membership.</p>

          {message && (
            <div className="mt-6 border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-6 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-xs font-bold">
              Email address
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-12 border border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-bold">
              Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-12 border border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="h-12 bg-primary text-sm font-bold text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
              Forgot your password?
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Tesla Capital?{' '}
            <Link href="/signup" className="font-bold text-foreground underline">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
