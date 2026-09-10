'use client'

import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, Fuel, Gauge, MoreHorizontal, Plus, TrendingUp, Zap } from 'lucide-react'
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
  BarChart,
  Bar,
} from 'recharts'
import { PlatformShell } from '@/components/platform-shell'
import type { Profile, InvestmentHolding, PortfolioHolding, Stock, Transaction, DashboardStats } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function fmtCompact(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(n)
}

/* ── Animated Stat Card ─────────────────────────────── */
function Stat({
  label,
  value,
  change,
  down = false,
  icon: Icon,
  delay = 0,
  sparkData,
}: {
  label: string
  value: string
  change?: string
  down?: boolean
  icon?: React.ElementType
  delay?: number
  sparkData?: number[]
}) {
  return (
    <div
      className="animate-count-up border border-border bg-card p-5 transition-all duration-300 hover:border-primary/50 animate-pulse-glow"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        {Icon && <Icon size={16} className="text-primary/60" />}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
      <div className="mt-2 flex items-center justify-between">
        {change && (
          <p className={`flex items-center gap-1 text-xs ${down ? 'text-primary' : 'text-green-500'}`}>
            {down ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{change}
          </p>
        )}
        {sparkData && sparkData.length > 0 && (
          <div className="h-6 w-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sparkData.map(v => ({ v }))}>
                <Bar dataKey="v" fill="currentColor" className="text-primary/40" radius={[1, 1, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── SVG Gauge Component ────────────────────────────── */
function GaugeRing({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const circumference = 2 * Math.PI * 45
  const offset = circumference * (1 - pct)

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100" className="chart-glow">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-border" strokeWidth="6" />
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="currentColor"
          className="text-primary animate-gauge"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ '--gauge-offset': offset } as React.CSSProperties}
        />
        <text x="50" y="48" textAnchor="middle" className="fill-foreground text-lg font-bold" fontSize="18">
          {Math.round(pct * 100)}%
        </text>
        <text x="50" y="63" textAnchor="middle" className="fill-muted-foreground" fontSize="8">
          {label}
        </text>
      </svg>
    </div>
  )
}

/* ── Chart Tooltip ──────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-mono text-muted-foreground">{label}</p>
      <p className="font-bold text-primary">{fmt(payload[0].value)}</p>
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

  // Generate mock performance data points from total balance
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
    { name: 'Investments', value: investmentTotal, color: 'var(--primary)' },
    { name: 'Stocks', value: stockTotal, color: 'var(--chart-2)' },
    { name: 'Cash', value: cashBalance, color: 'var(--chart-3)' },
  ].filter(d => d.value > 0)

  // Spark data for stats
  const txSpark = recentTransactions.slice(0, 7).map(t => Math.abs(Number(t.amount)))
  const investSpark = investmentHoldings.map(h => Number(h.current_value))

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
        <Stat
          label="Total balance"
          value={fmt(stats.totalBalance)}
          change={stats.allTimeChange !== 0 ? `${stats.allTimeChange >= 0 ? '+' : ''}${fmt(stats.allTimeChange)} (${stats.allTimeChangePercent.toFixed(1)}%)` : undefined}
          down={stats.allTimeChange < 0}
          icon={Gauge}
          delay={0}
          sparkData={txSpark}
        />
        <Stat label="Available cash" value={fmt(stats.availableCash)} icon={Fuel} delay={100} />
        <Stat
          label="Invested"
          value={fmt(stats.investedAmount)}
          icon={TrendingUp}
          delay={200}
          sparkData={investSpark}
        />
        <Stat
          label="VIP status"
          value={(profile?.vip_tier || 'standard').toUpperCase()}
          change={profile?.vip_expires_at ? `Until ${new Date(profile.vip_expires_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'Active'}
          icon={Zap}
          delay={300}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Portfolio Performance — AreaChart */}
        <section className="border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Portfolio performance</p>
              <p className="mt-2 text-2xl font-bold">{fmt(stats.totalBalance)}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              <span className="ml-3 bg-primary px-2 py-1 text-primary-foreground">YTD</span>
            </span>
          </div>
          {hasData ? (
            <div className="mt-6 h-52 chart-glow">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => fmtCompact(v)}
                    width={50}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#perfGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--background)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-8 flex h-48 items-center justify-center border-b border-border text-sm text-muted-foreground">
              Your performance chart will appear here once you start investing.
            </div>
          )}
        </section>

        {/* Allocation — Doughnut PieChart + Gauge */}
        <section className="border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Allocation</p>
            <MoreHorizontal size={17} className="text-muted-foreground" />
          </div>
          {hasData && allocationData.length > 0 ? (
            <>
              <div className="mt-4 flex items-center justify-center gap-6">
                <div className="h-44 w-44 chart-glow">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={68}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {allocationData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: any) => fmt(Number(v) || 0)}
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <GaugeRing
                  value={investmentTotal + stockTotal}
                  max={stats.totalBalance || 1}
                  label="DEPLOYED"
                />
              </div>

              {/* Legend */}
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                {allocationData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="size-2.5" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-bold">{fmt(d.value)}</span>
                  </div>
                ))}
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
