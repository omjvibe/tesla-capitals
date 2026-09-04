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
      <div className="w-full max-w-md">
        <div className="mb-12"><Brand /></div>
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

        <form onSubmit={handleSignup} className="mt-8 flex flex-col gap-5">
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
            className="h-12 bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50"
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
