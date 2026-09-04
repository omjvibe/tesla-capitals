'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Brand } from '@/components/platform-shell'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-12"><Brand /></div>
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Account recovery</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Reset your password.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter your email address and we will send you a recovery link.
        </p>

        {sent ? (
          <div className="mt-8 border border-primary/30 bg-primary/5 p-6">
            <p className="text-sm leading-6 text-foreground">
              If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mt-6 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
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
              <button
                type="submit"
                disabled={loading}
                className="h-12 bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send recovery link'}
              </button>
            </form>
          </>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="font-bold text-foreground underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
