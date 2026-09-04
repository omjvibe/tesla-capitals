import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, Search, TrendingUp } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export default async function StocksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: stocks } = await supabase
    .from('stocks')
    .select('*')
    .eq('is_published', true)
    .order('symbol')

  return (
    <PlatformShell>
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Public markets</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Stocks</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Track the companies shaping tomorrow.</p>
        </div>
      </div>

      {(stocks && stocks.length > 0) ? (
        <div className="mt-8 border border-border bg-card">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Asset</span>
            <span className="text-right">Price</span>
            <span className="text-right">Change</span>
            <span className="hidden text-right sm:block">Market</span>
          </div>
          {stocks.map(s => (
            <Link key={s.id} href={`/stocks/${s.symbol.toLowerCase()}`} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-border px-5 py-4 last:border-0 hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center bg-foreground font-mono text-xs text-background">{s.symbol.slice(0, 2)}</div>
                <div>
                  <p className="text-sm font-bold">{s.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{s.symbol}</p>
                </div>
              </div>
              <p className="text-right text-sm font-bold">{fmt(Number(s.price))}</p>
              <p className={`flex items-center justify-end gap-1 text-right text-xs ${Number(s.change_percent) >= 0 ? 'text-green-500' : 'text-primary'}`}>
                {Number(s.change_percent) >= 0 ? <TrendingUp size={12} /> : <ArrowDownRight size={12} />}
                {Number(s.change_percent) >= 0 ? '+' : ''}{Number(s.change_percent).toFixed(2)}%
              </p>
              <p className="hidden text-right font-mono text-xs text-muted-foreground sm:block">{s.market}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 py-20 text-center">
          <TrendingUp size={40} className="mx-auto text-muted-foreground" />
          <p className="mt-4 text-lg font-bold">No stocks available</p>
          <p className="mt-2 text-sm text-muted-foreground">Market data will appear here once published by administrators.</p>
        </div>
      )}
    </PlatformShell>
  )
}
