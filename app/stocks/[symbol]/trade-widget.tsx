'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import type { Stock, Profile, PortfolioHolding } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

interface Props {
  stock: Stock
  profile: Profile
  holding: PortfolioHolding | null
}

export function StockTradeWidget({ stock, profile, holding }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [shares, setShares] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const userBalance = Number(profile.wallet_balance || 0)
  const numShares = parseFloat(shares) || 0
  const totalCost = numShares * Number(stock.price)

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (numShares <= 0) {
      setError('Please enter a valid number of shares.')
      return
    }

    if (totalCost > userBalance) {
      setError(`Insufficient wallet balance. Total cost is ${fmt(totalCost)}, but you have ${fmt(userBalance)} available cash.`)
      toast('Insufficient Balance', 'Deposit funds to execute this stock purchase.', 'error')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // 1. Update or Insert portfolio holding
    if (holding) {
      const newShares = Number(holding.shares) + numShares
      const totalCostBasis = (Number(holding.shares) * Number(holding.avg_cost)) + totalCost
      const newAvgCost = totalCostBasis / newShares

      await supabase.from('portfolio_holdings').update({
        shares: newShares,
        avg_cost: newAvgCost,
      }).eq('id', holding.id)
    } else {
      await supabase.from('portfolio_holdings').insert({
        user_id: profile.id,
        stock_id: stock.id,
        shares: numShares,
        avg_cost: Number(stock.price),
      })
    }

    // 2. Deduct from wallet balance
    const newBal = userBalance - totalCost
    await supabase.from('profiles').update({ wallet_balance: newBal }).eq('id', profile.id)

    // 3. Log transaction
    await supabase.from('transactions').insert({
      user_id: profile.id,
      type: 'stock_buy',
      amount: -totalCost,
      description: `Bought ${numShares} shares of ${stock.symbol} @ ${fmt(Number(stock.price))}`,
    })

    toast('Stock Purchased!', `Successfully bought ${numShares} share(s) of ${stock.symbol} for ${fmt(totalCost)}.`)
    setShares('1')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Instant Trade</p>
        <div className="flex items-center gap-1.5 font-mono text-xs text-primary font-bold">
          <Wallet size={14} /> {fmt(userBalance)}
        </div>
      </div>
      <h3 className="mt-2 text-lg font-bold">Buy {stock.symbol} Shares</h3>

      {error && (
        <div className="mt-4 border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleBuy} className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-xs font-bold">
          Number of Shares
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={shares}
            onChange={e => setShares(e.target.value)}
            required
            className="h-11 border border-border bg-background px-3 outline-none focus:border-primary"
          />
        </label>

        <div className="border-y border-border py-3 font-mono text-xs flex justify-between">
          <span className="text-muted-foreground">Estimated Total:</span>
          <span className="font-bold">{fmt(totalCost)}</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 h-11 bg-primary text-xs font-bold text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Executing Trade...' : `Buy ${stock.symbol}`} <ArrowRight size={14} />
        </button>
      </form>
    </div>
  )
}
