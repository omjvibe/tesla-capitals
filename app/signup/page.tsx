'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Brand } from '@/components/platform-shell'

export default function Signup() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  const handleSocialAuth = async (provider: 'google' | 'twitter') => {
    setSocialLoading(provider)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (authError) {
      setError(authError.message)
      setSocialLoading(null)
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <Brand />
          <div className="mt-12 border border-primary/30 bg-primary/5 p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Verification required</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">Check your email.</h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              We sent a confirmation link to <strong className="text-foreground">{email}</strong>.
              Click the link to activate your account and start investing.
            </p>
          </div>
          <Link href="/login" className="mt-8 inline-block text-sm font-bold text-primary underline">
            Back to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md py-12">
        <div className="mb-10"><Brand /></div>
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Open your account</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Start building forward.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Join the next generation of investors. Your account will be activated after email verification.
        </p>

        {error && (
          <div className="mt-6 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Social Auth Options */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => handleSocialAuth('google')}
            disabled={!!socialLoading}
            className="flex h-12 items-center justify-center gap-3 border border-border bg-card text-xs font-bold transition-all hover:border-primary active:scale-95 disabled:opacity-50"
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            {socialLoading === 'google' ? 'Connecting to Google...' : 'Continue with Google'}
          </button>

          <button
            onClick={() => handleSocialAuth('twitter')}
            disabled={!!socialLoading}
            className="flex h-12 items-center justify-center gap-3 border border-border bg-card text-xs font-bold transition-all hover:border-primary active:scale-95 disabled:opacity-50"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            {socialLoading === 'twitter' ? 'Connecting to X...' : 'Continue with X / Twitter'}
          </button>
        </div>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <span className="relative bg-background px-3 font-mono text-[10px] uppercase text-muted-foreground">Or with email</span>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-bold">
              First name
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="h-12 border border-border bg-card px-4 outline-none focus:border-primary"
                placeholder="Jordan"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-bold">
              Last name
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="h-12 border border-border bg-card px-4 outline-none focus:border-primary"
                placeholder="Davis"
                required
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-xs font-bold">
            Email address
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-12 border border-border bg-card px-4 outline-none focus:border-primary"
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-bold">
            Create password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-12 border border-border bg-card px-4 outline-none focus:border-primary"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-bold">
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="h-12 border border-border bg-card px-4 outline-none focus:border-primary"
              placeholder="Re-enter your password"
              required
              minLength={8}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-primary text-sm font-bold text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already a member?{' '}
          <Link href="/login" className="font-bold text-foreground underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
