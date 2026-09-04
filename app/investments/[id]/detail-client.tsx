'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Wallet } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import type { Investment, InvestmentHolding, Profile } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export function InvestmentDetailClient({ investment, holding, profile, userId }: { investment: Investment; holding: InvestmentHolding | null; profile: Profile; userId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const userBalance = Number(profile?.wallet_balance || 0)

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const num = parseFloat(amount)

    if (isNaN(num) || num < Number(investment.min_amount)) {
      setError(`Minimum investment is ${fmt(Number(investment.min_amount))}`)
      return
    }

    if (num > userBalance) {
      setError(`Insufficient wallet balance. Available cash: ${fmt(userBalance)}. Please deposit funds first.`)
      toast('Insufficient Balance', 'You do not have enough funds in your digital wallet.', 'error')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // 1. Create holding
    const { error: insertError } = await supabase.from('investment_holdings').insert({
      user_id: userId,
      investment_id: investment.id,
      amount: num,
      current_value: num,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // 2. Deduct from wallet balance
    const newBal = Math.max(0, userBalance - num)
    await supabase.from('profiles').update({ wallet_balance: newBal }).eq('id', userId)

    // 3. Log transaction
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'investment',
      amount: -num,
      description: `Investment in ${investment.name}`,
      reference_id: investment.id,
    })

    setSuccess(true)
    toast('Investment Confirmed!', `Allocated ${fmt(num)} from your digital wallet.`)
    setLoading(false)
    setTimeout(() => router.push('/investments'), 2000)
  }

  return (
    <PlatformShell>
      <Link href="/investments" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Back to investments
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex items-start gap-4">
            <div className="grid size-12 place-items-center bg-muted text-primary"><TrendingUp size={24} /></div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-primary capitalize">{investment.category}</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{investment.name}</h1>
            </div>
          </div>
          <p className="mt-6 text-sm leading-7 text-muted-foreground">{investment.description}</p>

          <div className="mt-8 grid grid-cols-2 gap-5 border-t border-border pt-6 sm:grid-cols-4">
            <div>
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Min Investment</p>
              <p className="mt-2 text-lg font-bold">{fmt(Number(investment.min_amount))}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Target Return</p>
              <p className="mt-2 text-lg font-bold">{investment.target_return ? `${investment.target_return}%` : '—'}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Duration</p>
              <p className="mt-2 text-lg font-bold">{investment.duration_months ? `${investment.duration_months}mo` : 'Open'}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Risk Level</p>
              <p className={`mt-2 text-lg font-bold capitalize ${investment.risk_level === 'high' ? 'text-primary' : investment.risk_level === 'moderate' ? 'text-yellow-600' : 'text-green-600'}`}>{investment.risk_level}</p>
            </div>
          </div>

          {holding && (
            <div className="mt-8 border border-primary/30 bg-primary/5 p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Your position</p>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Invested</p>
                  <p className="text-xl font-bold">{fmt(Number(holding.amount))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current value</p>
                  <p className="text-xl font-bold">{fmt(Number(holding.current_value))}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invest Form */}
        <div className="border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Invest now</p>
            <div className="flex items-center gap-1.5 font-mono text-xs text-primary font-bold">
              <Wallet size={14} /> {fmt(userBalance)}
            </div>
          </div>
          <h2 className="mt-2 text-xl font-bold">Make an investment</h2>

          {success ? (
            <div className="mt-6 border border-primary/30 bg-primary/5 p-5 text-center">
              <p className="text-lg font-bold text-primary">Investment successful!</p>
              <p className="mt-2 text-sm text-muted-foreground">Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleInvest} className="mt-6 flex flex-col gap-5">
              {error && (
                <div className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
              )}
              <label className="flex flex-col gap-2 text-xs font-bold">
                Investment amount (USD)
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder={`Min ${fmt(Number(investment.min_amount))}`}
                  min={Number(investment.min_amount)}
                  step="0.01"
                  required
                  className="h-12 border border-border bg-background px-4 outline-none focus:border-primary"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="h-12 bg-primary text-sm font-bold text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm investment'}
              </button>
              <p className="text-center text-[10px] text-muted-foreground">
                Funds will be deducted directly from your digital wallet available cash ({fmt(userBalance)}).
              </p>
            </form>
          )}
        </div>
      </div>
    </PlatformShell>
  )
}
