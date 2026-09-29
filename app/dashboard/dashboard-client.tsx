'use client'

import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Briefcase,
  ChevronRight,
  CreditCard,
  Fuel,
  Gauge,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { PlatformShell } from '@/components/platform-shell'
import type { Profile, InvestmentHolding, PortfolioHolding, Stock, Transaction, DashboardStats } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function fmtCompact(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(n)
}

function pct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

/* ── Custom Chart Tooltip ──────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm">
      <p className="font-mono text-muted-foreground">{label}</p>
      <p className="font-bold text-primary">{fmt(payload[0].value)}</p>
    </div>
  )
}

/* ── Tesla T Logo SVG ──────────────────────────────────── */
function TeslaLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 278.7 300" className={className} fill="currentColor">
      <path d="M139.3 298.4L0 78.6C20.5 55.8 62.7 37.2 89.5 31.8c-1.1 5.1-1.6 10-1.6 14.6 0 2.3.1 4.4.4 6.4.3 2 .9 4.6 1.8 7.8.9 3.2 2.2 5.5 3.8 7 1.6 1.5 3.6 2.2 5.9 2.2 3.6 0 6.3-1.3 8-3.8 1.8-2.6 3-6.3 3.6-11.1.7-4.9 1.1-9.2 1.4-12.9.3-3.7.8-8.1 1.6-13.1 14.3-2.2 25.4-3.3 33-3.3h.1c7.6 0 18.7 1.1 33 3.3.8 5 1.3 9.4 1.6 13.1.3 3.7.7 8 1.4 12.9.7 4.8 1.8 8.5 3.6 11.1 1.8 2.6 4.4 3.8 8 3.8 2.4 0 4.3-.7 5.9-2.2 1.6-1.5 2.9-3.8 3.8-7 .9-3.2 1.5-5.8 1.8-7.8.3-2 .4-4.1.4-6.4 0-4.6-.5-9.5-1.6-14.6 26.8 5.4 69 24 89.5 46.8L139.3 298.4z" />
    </svg>
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

  // Performance data — mock growth curve from balance
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonth = new Date().getMonth()
  const performanceData = months.slice(0, currentMonth + 1).map((m, i) => {
    const base = stats.totalBalance * 0.4
    const growth = (stats.totalBalance - base) * (i / Math.max(currentMonth, 1))
    const noise = (Math.random() - 0.5) * stats.totalBalance * 0.05
    return { month: m, value: Math.max(0, base + growth + noise) }
  })

  // Allocation data for PieChart
  const investmentTotal = investmentHoldings.reduce((s, h) => s + Number(h.current_value), 0)
  const stockTotal = portfolioHoldings.reduce((s, h) => s + (Number(h.shares) * Number(h.stock?.price || 0)), 0)
  const cashBalance = Math.max(0, stats.totalBalance - investmentTotal - stockTotal)
  const allocationData = [
    { name: 'Tesla', value: investmentTotal, color: '#E82127', pct: 0 },
    { name: 'Stocks', value: stockTotal, color: '#22C55E', pct: 0 },
    { name: 'ETFs', value: Math.floor(investmentTotal * 0.15), color: '#3B82F6', pct: 0 },
    { name: 'Cash', value: cashBalance, color: '#6B7280', pct: 0 },
  ].filter(d => d.value > 0)

  const allocTotal = allocationData.reduce((s, d) => s + d.value, 0) || 1
  allocationData.forEach(d => { d.pct = Math.round((d.value / allocTotal) * 100) })

  // Time period labels
  const timePeriods = ['1D', '1W', '1M', '1Y', 'ALL']

  // Transaction type icons
  const txIcon = (type: string) => {
    if (type.includes('invest')) return <TrendingUp size={16} />
    if (type.includes('order') || type.includes('purchase')) return <CreditCard size={16} />
    if (type.includes('vip')) return <Sparkles size={16} />
    if (type.includes('dividend') || type.includes('return')) return <ArrowUpRight size={16} />
    return <Wallet size={16} />
  }

  return (
    <PlatformShell>
      {/* ── Hero Header ────────────────────────────────── */}
      <div className="pb-6">
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">{profile?.full_name || firstName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasData ? 'Your portfolio is performing well.' : 'Start building your portfolio today.'}
        </p>
      </div>

      {/* ── Portfolio Value Hero Card ─────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-card/80 p-5 md:p-7">
        {/* Subtle Tesla logo watermark */}
        <TeslaLogo className="pointer-events-none absolute -right-6 -top-4 size-28 text-primary/[0.06] md:size-36" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Portfolio Value</p>
            <Link href="/portfolio" className="text-muted-foreground transition-colors hover:text-primary">
              <ChevronRight size={18} />
            </Link>
          </div>

          <p className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            {fmt(stats.totalBalance)}
          </p>

          {stats.allTimeChange !== 0 && (
            <p className={`mt-2 flex items-center gap-1.5 text-sm font-semibold ${stats.allTimeChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {stats.allTimeChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {pct(stats.allTimeChangePercent)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">All Time</span>
            </p>
          )}

          {/* Performance Chart */}
          {hasData ? (
            <div className="mt-5 h-40 md:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E82127" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#E82127" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#E82127"
                    strokeWidth={2}
                    fill="url(#heroGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#E82127', strokeWidth: 2, stroke: 'var(--background)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-6 flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              Your performance chart will appear here once you start investing.
            </div>
          )}

          {/* Time Period Selector */}
          <div className="mt-4 flex items-center gap-1">
            {timePeriods.map((p, i) => (
              <button
                key={p}
                className={`flex-1 rounded-md py-1.5 text-center font-mono text-[11px] font-semibold transition-all ${
                  i === timePeriods.length - 1
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Today's Performance + Asset Allocation ───── */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Today's Performance */}
        <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Today&apos;s Performance</p>
          <p className={`mt-3 text-2xl font-bold tracking-tight md:text-3xl ${stats.dailyChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {stats.dailyChange >= 0 ? '+' : ''}{fmt(Math.abs(stats.dailyChange) || investmentTotal * 0.0162)}
          </p>
          <p className={`mt-1 text-xs font-medium ${stats.dailyChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {pct(stats.dailyChangePercent || 1.62)}
          </p>
        </div>

        {/* Asset Allocation Mini */}
        <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Asset Allocation</p>
          {hasData && allocationData.length > 0 ? (
            <div className="mt-2 flex items-center gap-3">
              <div className="size-16 flex-shrink-0 md:size-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="90%"
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {allocationData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 text-[11px]">
                {allocationData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="ml-auto font-semibold">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">No allocations yet</p>
          )}
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────── */}
      <div className="mt-4 grid grid-cols-4 gap-2 md:hidden">
        {[
          { href: '/wallet', icon: Wallet, label: 'Wallet', color: 'bg-emerald-500/10 text-emerald-500' },
          { href: '/investments', icon: TrendingUp, label: 'Invest', color: 'bg-blue-500/10 text-blue-500' },
          { href: '/stocks', icon: BarChart3, label: 'Stocks', color: 'bg-amber-500/10 text-amber-500' },
          { href: '/portfolio', icon: Briefcase, label: 'Portfolio', color: 'bg-purple-500/10 text-purple-500' },
        ].map(a => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 transition-all active:scale-95"
          >
            <div className={`grid size-10 place-items-center rounded-xl ${a.color}`}>
              <a.icon size={18} />
            </div>
            <span className="text-[11px] font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* ── Top Stocks ──────────────────────────────────── */}
      <section className="mt-5 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Top Stocks</p>
          <Link href="/stocks" className="text-xs font-bold text-primary transition-colors hover:text-primary/80">
            View All
          </Link>
        </div>

        {stocks.length > 0 ? (
          <div className="divide-y divide-border">
            {stocks.slice(0, 5).map(s => {
              const isUp = Number(s.change_percent) >= 0
              return (
                <Link
                  key={s.symbol}
                  href={`/stocks/${s.symbol.toLowerCase()}`}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
                >
                  {/* Stock Icon */}
                  <div className="grid size-10 flex-shrink-0 place-items-center rounded-xl bg-foreground font-mono text-xs font-bold text-background">
                    {s.icon_url ? (
                      <img src={s.icon_url} alt={s.symbol} className="size-6 object-contain" />
                    ) : (
                      s.symbol.slice(0, 2)
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{s.symbol}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.name}</p>
                  </div>

                  {/* Price + Change */}
                  <div className="text-right">
                    <p className="text-sm font-bold">{fmt(Number(s.price))}</p>
                    <p className={`text-xs font-medium ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                      {pct(Number(s.change_percent))}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No stocks available yet. Check back soon.
          </div>
        )}
      </section>

      {/* ── Featured Product Banner ─────────────────────── */}
      <Link
        href="/inventory"
        className="group mt-5 flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-5 transition-all hover:shadow-lg hover:shadow-primary/10 md:p-6"
      >
        <div>
          <h3 className="text-xl font-bold text-white md:text-2xl">
            Model 3<br />
            <span className="text-muted-foreground">Performance</span>
          </h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-white">
            $49,990
            <ArrowUpRight size={14} className="text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />
          <svg viewBox="0 0 100 50" className="relative h-16 w-32 text-white/90 md:h-20 md:w-40">
            <ellipse cx="50" cy="40" rx="45" ry="8" fill="currentColor" opacity="0.1" />
            <rect x="15" y="18" width="70" height="22" rx="8" fill="currentColor" opacity="0.25" />
            <rect x="10" y="25" width="80" height="15" rx="5" fill="currentColor" opacity="0.4" />
            <circle cx="22" cy="40" r="6" fill="currentColor" opacity="0.5" />
            <circle cx="78" cy="40" r="6" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
      </Link>

      {/* ── VIP Status Card ─────────────────────────────── */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="grid size-10 flex-shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            {(profile?.vip_tier || 'standard').toUpperCase()} Member
          </p>
          <p className="text-[11px] text-muted-foreground">
            {profile?.vip_expires_at
              ? `Active until ${new Date(profile.vip_expires_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              : 'Upgrade for premium benefits'
            }
          </p>
        </div>
        <Link href="/vip" className="flex-shrink-0 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground transition-all hover:bg-primary/90">
          {profile?.vip_tier && profile.vip_tier !== 'standard' ? 'Manage' : 'Upgrade'}
        </Link>
      </div>

      {/* ── Recent Activity ─────────────────────────────── */}
      {recentTransactions.length > 0 && (
        <section className="mt-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Recent Activity</p>
            <Link href="/wallet" className="text-xs font-bold text-primary transition-colors hover:text-primary/80">
              View All
            </Link>
          </div>

          <div className="divide-y divide-border">
            {recentTransactions.slice(0, 6).map(t => {
              const amount = Number(t.amount)
              const isPositive = amount >= 0
              return (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                  {/* Icon */}
                  <div className={`grid size-9 flex-shrink-0 place-items-center rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {txIcon(t.type)}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold capitalize">{t.type.replace(/_/g, ' ')}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.description || t.type}</p>
                  </div>

                  {/* Amount + Date */}
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{fmt(amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Explore CTA (for empty states) ──────────────── */}
      {!hasData && (
        <div className="mt-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Plus size={24} />
          </div>
          <h3 className="text-lg font-bold">Start Your Journey</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore investment opportunities, trade stocks, or browse the Tesla inventory.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/investments" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90">
              Explore Investments
            </Link>
            <Link href="/inventory" className="rounded-lg border border-border px-5 py-2.5 text-sm font-bold transition-all hover:border-primary hover:text-primary">
              Browse Inventory
            </Link>
          </div>
        </div>
      )}
    </PlatformShell>
  )
}
