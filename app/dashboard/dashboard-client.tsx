'use client'

import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, MoreHorizontal, Plus, TrendingUp } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import type { Profile, InvestmentHolding, PortfolioHolding, Stock, Transaction, DashboardStats } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function Stat({ label, value, change, down = false }: { label: string; value: string; change?: string; down?: boolean }) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
      {change && (
        <p className={`mt-2 flex items-center gap-1 text-xs ${down ? 'text-primary' : 'text-muted-foreground'}`}>
          {down ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{change}
        </p>
      )}
    </div>
  )
}

interface Props {
  profile: Profile | null
  investmentHoldings: (InvestmentHolding & { investment: { name: string; category: string } })[]
  portfolioHoldings: (PortfolioHolding & { stock: Stock })[]
  recentTransactions: Transaction[]
  stocks: Stock[]
  stats: DashboardStats
}

export function DashboardClient({ profile, investmentHoldings, portfolioHoldings, recentTransactions, stocks, stats }: Props) {
  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const hasData = stats.totalBalance > 0 || investmentHoldings.length > 0 || portfolioHoldings.length > 0

  return (
    <PlatformShell>
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">{greeting}, {firstName}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Your capital, moving.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            {hasData ? 'Here is your portfolio at a glance.' : 'Start building your portfolio by exploring investments and stocks.'}
          </p>
        </div>
        <Link href="/investments" className="flex items-center gap-2 self-start border border-border px-4 py-3 text-xs font-bold hover:border-primary sm:self-auto">
          <Plus size={16} /> Explore opportunities
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total balance" value={fmt(stats.totalBalance)} change={stats.allTimeChange !== 0 ? `${stats.allTimeChange >= 0 ? '+' : ''}${fmt(stats.allTimeChange)} (${stats.allTimeChangePercent.toFixed(1)}%)` : undefined} down={stats.allTimeChange < 0} />
        <Stat label="Available cash" value={fmt(stats.availableCash)} />
        <Stat label="Invested" value={fmt(stats.investedAmount)} />
        <Stat label="VIP status" value={(profile?.vip_tier || 'standard').toUpperCase()} change={profile?.vip_expires_at ? `Until ${new Date(profile.vip_expires_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'Active'} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Portfolio Performance */}
        <section className="border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Portfolio performance</p>
              <p className="mt-2 text-2xl font-bold">{fmt(stats.totalBalance)}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              <span className="ml-3 bg-primary px-2 py-1 text-primary-foreground">ALL</span>
            </span>
          </div>
          {hasData ? (
            <div className="mt-8 flex h-48 items-end gap-2 border-b border-border px-2">
              {[35,42,38,55,49,62,58,72,67,82,76,94,88,100,92,110,104,128,120,145].map((h, i) => (
                <div key={i} className="flex-1 bg-primary/80 transition-all hover:bg-primary" style={{ height: `${h}px` }} />
              ))}
            </div>
          ) : (
            <div className="mt-8 flex h-48 items-center justify-center border-b border-border text-sm text-muted-foreground">
              Your performance chart will appear here once you start investing.
            </div>
          )}
          <div className="mt-3 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>JAN</span><span>MAR</span><span>JUN</span><span>SEP</span><span>DEC</span>
          </div>
        </section>

        {/* Allocation */}
        <section className="border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Allocation</p>
            <MoreHorizontal size={17} className="text-muted-foreground" />
          </div>
          {hasData ? (
            <>
              <div className="mx-auto my-8 grid size-36 place-items-center border-[18px] border-primary border-r-muted border-b-muted">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.investedAmount > 0 ? Math.round((stats.investedAmount / (stats.totalBalance || 1)) * 100) : 0}%</p>
                  <p className="font-mono text-[9px] text-muted-foreground">INVESTED</p>
                </div>
              </div>
              <div className="flex justify-between border-t border-border pt-4 text-xs">
                <span className="text-muted-foreground">Investments</span>
                <b>{investmentHoldings.length} positions</b>
              </div>
              <div className="mt-3 flex justify-between text-xs">
                <span className="text-muted-foreground">Stocks</span>
                <b>{portfolioHoldings.length} positions</b>
              </div>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No allocations yet.
            </div>
          )}
        </section>
      </div>

      {/* Top Stocks */}
      <section className="mt-5 border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Market overview</p>
          <Link href="/stocks" className="text-xs font-bold text-primary">
            View all <ArrowUpRight className="ml-1 inline" size={13} />
          </Link>
        </div>
        {stocks.length > 0 ? (
          stocks.map(s => (
            <Link key={s.symbol} href={`/stocks/${s.symbol.toLowerCase()}`} className="flex items-center justify-between border-b border-border p-5 last:border-0 hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center bg-foreground font-mono text-xs text-background">
                  {s.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-bold">{s.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{s.symbol} · {s.market}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{fmt(Number(s.price))}</p>
                <p className={`flex items-center gap-1 text-xs ${Number(s.change_percent) >= 0 ? 'text-green-500' : 'text-primary'}`}>
                  {Number(s.change_percent) >= 0 ? <TrendingUp size={12} /> : <ArrowDownRight size={12} />}
                  {Number(s.change_percent) >= 0 ? '+' : ''}{Number(s.change_percent).toFixed(2)}%
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No stocks available yet. Check back soon.
          </div>
        )}
      </section>

      {/* Recent Activity */}
      {recentTransactions.length > 0 && (
        <section className="mt-5 border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Recent activity</p>
          </div>
          {recentTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between border-b border-border p-5 last:border-0">
              <div>
                <p className="text-sm font-bold capitalize">{t.type.replace('_', ' ')}</p>
                <p className="text-xs text-muted-foreground">{t.description || t.type}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${Number(t.amount) >= 0 ? '' : 'text-primary'}`}>
                  {Number(t.amount) >= 0 ? '+' : ''}{fmt(Number(t.amount))}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}
    </PlatformShell>
  )
}
