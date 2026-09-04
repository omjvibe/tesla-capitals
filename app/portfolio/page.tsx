import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowDownRight, ArrowLeft, ArrowUpRight, MoreHorizontal, TrendingUp } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export default async function PortfolioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: investmentHoldings } = await supabase
    .from('investment_holdings')
    .select('*, investment:investments(name, category)')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const { data: portfolioHoldings } = await supabase
    .from('portfolio_holdings')
    .select('*, stock:stocks(symbol, name, price, change_percent)')
    .eq('user_id', user.id)

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const invTotal = (investmentHoldings || []).reduce((s, h) => s + Number(h.current_value), 0)
  const stockTotal = (portfolioHoldings || []).reduce((s, h) => s + (Number(h.shares) * Number(h.stock?.price || 0)), 0)
  const totalValue = invTotal + stockTotal
  const costBasis = (investmentHoldings || []).reduce((s, h) => s + Number(h.amount), 0) + (portfolioHoldings || []).reduce((s, h) => s + (Number(h.shares) * Number(h.avg_cost)), 0)
  const totalPL = totalValue - costBasis
  const plPercent = costBasis > 0 ? (totalPL / costBasis * 100) : 0

  return (
    <PlatformShell>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Your positions</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Portfolio</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">A complete view of your holdings and performance.</p>
      </div>

      {/* Summary */}
      <div className="grid gap-3 py-8 sm:grid-cols-3">
        <div className="border border-border bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total value</p>
          <p className="mt-4 text-3xl font-bold">{fmt(totalValue)}</p>
        </div>
        <div className="border border-border bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total P&L</p>
          <p className={`mt-4 text-3xl font-bold ${totalPL >= 0 ? 'text-green-500' : 'text-primary'}`}>
            {totalPL >= 0 ? '+' : ''}{fmt(totalPL)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%</p>
        </div>
        <div className="border border-border bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Cost basis</p>
          <p className="mt-4 text-3xl font-bold">{fmt(costBasis)}</p>
        </div>
      </div>

      {/* Investment Holdings */}
      {(investmentHoldings && investmentHoldings.length > 0) && (
        <section className="border border-border bg-card">
          <div className="border-b border-border p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Investment holdings</p>
          </div>
          {investmentHoldings.map((h: any) => (
            <div key={h.id} className="flex items-center justify-between border-b border-border p-5 last:border-0">
              <div>
                <p className="text-sm font-bold">{h.investment?.name || 'Investment'}</p>
                <p className="font-mono text-[10px] text-muted-foreground capitalize">{h.investment?.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{fmt(Number(h.current_value))}</p>
                <p className="text-xs text-muted-foreground">Invested: {fmt(Number(h.amount))}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Stock Holdings */}
      {(portfolioHoldings && portfolioHoldings.length > 0) && (
        <section className="mt-5 border border-border bg-card">
          <div className="border-b border-border p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Stock holdings</p>
          </div>
          {portfolioHoldings.map((h: any) => {
            const val = Number(h.shares) * Number(h.stock?.price || 0)
            const cost = Number(h.shares) * Number(h.avg_cost)
            const pl = val - cost
            return (
              <div key={h.id} className="flex items-center justify-between border-b border-border p-5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center bg-foreground font-mono text-xs text-background">{h.stock?.symbol?.slice(0, 2)}</div>
                  <div>
                    <p className="text-sm font-bold">{h.stock?.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{Number(h.shares).toFixed(2)} shares · {h.stock?.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{fmt(val)}</p>
                  <p className={`text-xs ${pl >= 0 ? 'text-green-500' : 'text-primary'}`}>{pl >= 0 ? '+' : ''}{fmt(pl)}</p>
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* Transactions */}
      {(transactions && transactions.length > 0) && (
        <section className="mt-5 border border-border bg-card">
          <div className="border-b border-border p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Transaction history</p>
          </div>
          {transactions.map(t => (
            <div key={t.id} className="flex items-center justify-between border-b border-border p-5 last:border-0">
              <div>
                <p className="text-sm font-bold capitalize">{t.type.replace('_', ' ')}</p>
                <p className="text-xs text-muted-foreground">{t.description || t.type}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${Number(t.amount) >= 0 ? 'text-green-500' : 'text-primary'}`}>
                  {Number(t.amount) >= 0 ? '+' : ''}{fmt(Number(t.amount))}
                </p>
                <p className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Empty state */}
      {(!investmentHoldings || investmentHoldings.length === 0) && (!portfolioHoldings || portfolioHoldings.length === 0) && (
        <div className="py-20 text-center">
          <p className="text-lg font-bold">Your portfolio is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">Start investing to build your portfolio.</p>
          <Link href="/investments" className="mt-6 inline-block bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Explore investments</Link>
        </div>
      )}
    </PlatformShell>
  )
}
