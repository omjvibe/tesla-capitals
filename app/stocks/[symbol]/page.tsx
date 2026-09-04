import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowDownRight, ArrowLeft, TrendingUp } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { StockTradeWidget } from './trade-widget'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export default async function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: stock } = await supabase
    .from('stocks')
    .select('*')
    .ilike('symbol', symbol)
    .single()

  if (!stock) notFound()

  const { data: holding } = await supabase
    .from('portfolio_holdings')
    .select('*')
    .eq('user_id', user.id)
    .eq('stock_id', stock.id)
    .maybeSingle()

  const { data: watchlistItem } = await supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('stock_id', stock.id)
    .maybeSingle()

  const up = Number(stock.change_percent) >= 0

  return (
    <PlatformShell>
      <Link href="/stocks" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Back to stocks
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Stock Info */}
        <div>
          <div className="flex items-center gap-4">
            {stock.icon_url ? (
              <div className="relative size-14 overflow-hidden rounded-full border border-border bg-background p-1">
                <Image src={stock.icon_url} alt={stock.name} fill className="object-contain" />
              </div>
            ) : (
              <div className="grid size-14 place-items-center bg-foreground font-mono text-lg text-background">
                {stock.symbol.slice(0, 2)}
              </div>
            )}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{stock.symbol} · {stock.market}</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{stock.name}</h1>
            </div>
          </div>

          <div className="mt-8 flex items-end gap-4">
            <p className="text-5xl font-bold">{fmt(Number(stock.price))}</p>
            <p className={`mb-1 flex items-center gap-1 text-lg font-bold ${up ? 'text-green-500' : 'text-primary'}`}>
              {up ? <TrendingUp size={20} /> : <ArrowDownRight size={20} />}
              {up ? '+' : ''}{Number(stock.change_percent).toFixed(2)}%
            </p>
          </div>

          {stock.description && (
            <p className="mt-6 text-sm leading-7 text-muted-foreground">{stock.description}</p>
          )}

          {/* Chart placeholder */}
          <div className="mt-8 border border-border bg-card p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Price history</p>
            <div className="mt-4 flex h-48 items-end gap-1 border-b border-border px-2">
              {Array.from({ length: 30 }, (_, i) => {
                const base = Number(stock.price) * 0.85
                const h = base + (Math.sin(i * 0.5) * Number(stock.price) * 0.1) + (i * Number(stock.price) * 0.005)
                const maxH = Number(stock.price) * 1.1
                const pct = Math.min(((h - base * 0.9) / (maxH - base * 0.9)) * 100, 100)
                return <div key={i} className="flex-1 bg-primary/70 hover:bg-primary" style={{ height: `${pct}%` }} />
              })}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>30d ago</span><span>Today</span>
            </div>
          </div>

          {/* Market data */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="border border-border bg-card p-4">
              <p className="font-mono text-[10px] text-muted-foreground">MARKET</p>
              <p className="mt-2 text-sm font-bold">{stock.market}</p>
            </div>
            <div className="border border-border bg-card p-4">
              <p className="font-mono text-[10px] text-muted-foreground">SYMBOL</p>
              <p className="mt-2 text-sm font-bold">{stock.symbol}</p>
            </div>
            <div className="border border-border bg-card p-4">
              <p className="font-mono text-[10px] text-muted-foreground">CHANGE</p>
              <p className={`mt-2 text-sm font-bold ${up ? 'text-green-500' : 'text-primary'}`}>
                {up ? '+' : ''}{Number(stock.change_percent).toFixed(2)}%
              </p>
            </div>
            <div className="border border-border bg-card p-4">
              <p className="font-mono text-[10px] text-muted-foreground">UPDATED</p>
              <p className="mt-2 text-sm font-bold">{new Date(stock.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Stock Purchasing Trade Widget */}
          <StockTradeWidget stock={stock} profile={profile} holding={holding} />

          {/* Position */}
          {holding && (
            <div className="border border-primary/30 bg-primary/5 p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Your position</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Shares</p>
                  <p className="text-xl font-bold">{Number(holding.shares).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Market value</p>
                  <p className="text-xl font-bold">{fmt(Number(holding.shares) * Number(stock.price))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg cost</p>
                  <p className="text-sm font-bold">{fmt(Number(holding.avg_cost))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">P&L</p>
                  {(() => {
                    const pl = Number(holding.shares) * (Number(stock.price) - Number(holding.avg_cost))
                    return <p className={`text-sm font-bold ${pl >= 0 ? 'text-green-500' : 'text-primary'}`}>{pl >= 0 ? '+' : ''}{fmt(pl)}</p>
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Quick info */}
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">About {stock.symbol}</p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {stock.description || `${stock.name} (${stock.symbol}) is listed on ${stock.market}.`}
            </p>
          </div>

          {/* Watchlist indicator */}
          <div className="border border-border bg-card p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Watchlist</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {watchlistItem ? '✓ This stock is on your watchlist.' : 'Add this stock to your watchlist from the stocks page.'}
            </p>
          </div>
        </div>
      </div>
    </PlatformShell>
  )
}
