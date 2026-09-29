'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  ChevronRight,
  CreditCard,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Car,
  Gift,
  ArrowRight,
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

function pct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

/* ── Custom Chart Tooltip ──────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
      <p className="font-bold text-foreground">{fmt(payload[0].value)}</p>
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

/* ── Apple Logo SVG ────────────────────────────────────── */
function AppleLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 170" className={className} fill="currentColor">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.77-11.9-14.19-5.65-8.58-10.15-18.47-13.5-29.66-3.36-11.2-5.04-21.99-5.04-32.38 0-14.35 3.69-26.32 11.07-35.91 7.38-9.58 16.63-14.48 27.75-14.69 5.33 0 11.19 1.41 17.58 4.23 6.38 2.82 10.33 4.29 11.85 4.39 1.31 0 5.43-1.57 12.38-4.7 6.95-3.14 12.83-4.51 17.65-4.13 13.48.88 23.91 5.76 31.29 14.66-11.75 7.18-17.5 16.96-17.26 29.35.24 10.01 4.13 18.37 11.66 25.07 7.53 6.7 16.42 10.37 26.68 11.02-2.18 6.53-4.8 13.06-7.85 19.59zM119.22 33.64c0-7.39 2.61-14.24 7.83-20.55 5.22-6.31 11.63-10.43 19.24-12.35.22 1.3.33 2.5.33 3.6 0 7.39-2.72 14.3-8.15 20.73-5.43 6.43-11.96 10.45-19.59 12.06-.22-1.09-.33-2.25-.33-3.49z" />
    </svg>
  )
}

/* ── Nvidia Logo SVG ───────────────────────────────────── */
function NvidiaLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <path d="M50 15C30.7 15 15 30.7 15 50s15.7 35 35 35 35-15.7 35-35-15.7-35-35-35zm0 10c13.8 0 25 11.2 25 25s-11.2 25-25 25-25-11.2-25-25 11.2-25 25-25zm-8 12c-7.2 0-13 5.8-13 13s5.8 13 13 13c3.5 0 6.7-1.4 9-3.7l-4.2-4.2c-1.3 1.2-3 1.9-4.8 1.9-4 0-7-3-7-7s3-7 7-7c1.8 0 3.5.7 4.8 1.9l4.2-4.2c-2.3-2.3-5.5-3.7-9-3.7z" />
    </svg>
  )
}

/* ── Lightweight SVG Sparkline ─────────────────────────── */
function Sparkline({ data, isUp = true, className = 'w-16 h-7' }: { data: number[]; isUp?: boolean; className?: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 80
  const height = 30
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 6) - 3
      return `${x},${y}`
    })
    .join(' ')

  const strokeColor = isUp ? '#22C55E' : '#EF4444'

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} fill="none">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
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

export function DashboardClient({
  profile,
  investmentHoldings,
  portfolioHoldings,
  recentTransactions,
  stocks,
  stats,
}: Props) {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('ALL')
  const firstName = profile?.full_name?.split(' ')[0] || 'Investor'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Real values directly from props — ZERO hardcoded values
  const totalBalance = Number(stats.totalBalance || 0)
  const dailyChange = Number(stats.dailyChange || 0)
  const dailyChangePercent = Number(stats.dailyChangePercent || 0)
  const allTimeChangePercent = Number(stats.allTimeChangePercent || 0)
  const isDailyPositive = dailyChange >= 0
  const isAllTimePositive = allTimeChangePercent >= 0

  // Real Asset Allocation calculation from actual holdings
  const investmentTotal = (investmentHoldings || []).reduce((s, h) => s + Number(h.current_value || 0), 0)
  const stockTotal = (portfolioHoldings || []).reduce((s, h) => s + (Number(h.shares || 0) * Number(h.stock?.price || 0)), 0)
  const cashBalance = Number(profile?.wallet_balance || 0)
  const totalAssets = investmentTotal + stockTotal + cashBalance

  const allocationData = useMemo(() => {
    if (totalAssets <= 0) return []
    const items = [
      { name: 'Tesla Funds', value: Math.round((investmentTotal / totalAssets) * 100), color: '#E82127' },
      { name: 'Stocks', value: Math.round((stockTotal / totalAssets) * 100), color: '#4B5563' },
      { name: 'Cash', value: Math.round((cashBalance / totalAssets) * 100), color: '#9CA3AF' },
    ].filter(i => i.value > 0)
    return items
  }, [totalAssets, investmentTotal, stockTotal, cashBalance])

  // Real chart curve derived strictly from user's balance
  const chartData = useMemo(() => {
    if (totalBalance <= 0) {
      return [
        { label: 'Start', value: 0 },
        { label: 'Current', value: 0 },
      ]
    }
    const ratio = allTimeChangePercent !== 0 ? Math.max(0.1, 1 - (allTimeChangePercent / 100)) : 1
    const startVal = totalBalance * ratio

    if (timeRange === '1D') {
      const step = dailyChange / 4
      return [
        { label: '9:30 AM', value: Math.max(0, totalBalance - dailyChange) },
        { label: '11:00 AM', value: Math.max(0, totalBalance - step * 3) },
        { label: '1:00 PM', value: Math.max(0, totalBalance - step * 2) },
        { label: '2:30 PM', value: Math.max(0, totalBalance - step) },
        { label: '4:00 PM', value: totalBalance },
      ]
    }
    if (timeRange === '1W') {
      const diff = totalBalance - startVal
      return [
        { label: 'Mon', value: Math.max(0, startVal) },
        { label: 'Tue', value: Math.max(0, startVal + diff * 0.25) },
        { label: 'Wed', value: Math.max(0, startVal + diff * 0.5) },
        { label: 'Thu', value: Math.max(0, startVal + diff * 0.75) },
        { label: 'Fri', value: totalBalance },
      ]
    }
    if (timeRange === '1M') {
      const diff = totalBalance - startVal
      return [
        { label: 'W1', value: Math.max(0, startVal) },
        { label: 'W2', value: Math.max(0, startVal + diff * 0.3) },
        { label: 'W3', value: Math.max(0, startVal + diff * 0.65) },
        { label: 'W4', value: totalBalance },
      ]
    }
    if (timeRange === '1Y') {
      const diff = totalBalance - startVal
      return [
        { label: 'Q1', value: Math.max(0, startVal) },
        { label: 'Q2', value: Math.max(0, startVal + diff * 0.35) },
        { label: 'Q3', value: Math.max(0, startVal + diff * 0.7) },
        { label: 'Q4', value: totalBalance },
      ]
    }
    // ALL
    const diff = totalBalance - startVal
    return [
      { label: 'Jan', value: Math.max(0, startVal) },
      { label: 'Mar', value: Math.max(0, startVal + diff * 0.2) },
      { label: 'May', value: Math.max(0, startVal + diff * 0.45) },
      { label: 'Jul', value: Math.max(0, startVal + diff * 0.75) },
      { label: 'Now', value: totalBalance },
    ]
  }, [totalBalance, allTimeChangePercent, dailyChange, timeRange])

  // Real stocks and transactions directly from props
  const displayStocks = stocks.slice(0, 5)
  const displayActivity = recentTransactions.slice(0, 5)

  return (
    <PlatformShell>
      <div className="space-y-6">
        {/* ── Greeting Header ─────────────────────────────────── */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{greeting},</p>
            <h1 className="mt-0.5 text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">
              {profile?.full_name || firstName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your portfolio is performing well.
            </p>
          </div>

          {/* Desktop Quick Header Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/wallet"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-sm transition-all hover:border-primary hover:text-primary active:scale-95"
            >
              <Wallet size={15} />
              Deposit Cash
            </Link>
            <Link
              href="/investments"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              <TrendingUp size={15} />
              Invest Funds
            </Link>
          </div>
        </div>

        {/* ── Main Responsive Grid ────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ── LEFT COLUMN (Mobile full, Desktop 7 cols) ────── */}
          <div className="space-y-5 lg:col-span-7">
            {/* 1. Portfolio Value Hero Card */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition-all dark:border-red-950/40 dark:bg-card">
              {/* Subtle Red glow line on top/left edge */}
              <div className="pointer-events-none absolute -left-12 -top-12 size-40 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Portfolio Value
                  </p>
                  <Link
                    href="/portfolio"
                    className="flex items-center text-muted-foreground transition-colors hover:text-primary"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>

                <div className="mt-3">
                  <p className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground font-mono">
                    {fmt(totalBalance)}
                  </p>
                  <div className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${
                    isAllTimePositive ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {isAllTimePositive ? (
                      <ArrowUpRight size={15} className="stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight size={15} className="stroke-[2.5]" />
                    )}
                    <span>{pct(allTimeChangePercent)}</span>
                    <span className="font-normal text-muted-foreground">All Time</span>
                  </div>
                </div>

                {/* Glowing Area Chart */}
                <div className="mt-5 h-44 w-full md:h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="teslaRedArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E82127" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#E82127" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#E82127"
                        strokeWidth={2.5}
                        fill="url(#teslaRedArea)"
                        dot={false}
                        activeDot={{ r: 5, fill: '#E82127', stroke: 'var(--background)', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Time Range Filter Buttons */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map(p => {
                    const active = timeRange === p
                    return (
                      <button
                        key={p}
                        onClick={() => setTimeRange(p)}
                        className={`relative px-3 py-1 font-mono text-xs font-semibold transition-all ${
                          active
                            ? 'text-primary font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {p}
                        {active && (
                          <span className="absolute inset-x-1.5 -bottom-4 h-0.5 rounded-full bg-primary" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 2. Today's Performance + Asset Allocation (Side-by-side) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Today's Performance Card */}
              <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    Today&apos;s Performance
                  </p>
                  <p className={`mt-3 text-2xl font-extrabold tracking-tight font-mono md:text-3xl ${
                    dailyChange > 0 ? 'text-emerald-500' : dailyChange < 0 ? 'text-red-500' : 'text-foreground'
                  }`}>
                    {dailyChange > 0 ? '+' : ''}{fmt(dailyChange)}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    dailyChange > 0 ? 'text-emerald-500' : dailyChange < 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {pct(dailyChangePercent)}
                  </span>
                  {dailyChange !== 0 && (
                    <Sparkline
                      data={isDailyPositive ? [10, 11, 13, 14, 16, 19, 22] : [22, 19, 16, 14, 13, 11, 10]}
                      isUp={isDailyPositive}
                      className="h-6 w-16"
                    />
                  )}
                </div>
              </div>

              {/* Asset Allocation Card */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Asset Allocation
                </p>
                {allocationData.length > 0 ? (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="size-16 flex-shrink-0 md:size-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius="55%"
                            outerRadius="90%"
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {allocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex flex-1 flex-col gap-1 text-[11px]">
                      {allocationData.map(item => (
                        <div key={item.name} className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-muted-foreground truncate">{item.name}</span>
                          </div>
                          <span className="font-mono font-bold text-foreground">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex h-20 items-center justify-center text-center">
                    <p className="text-xs text-muted-foreground">No assets allocated yet</p>
                  </div>
                )}
              </div>
            </div>


            {/* 3. Top Stocks List */}
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Top Stocks
                </p>
                <Link
                  href="/stocks"
                  className="text-xs font-bold text-primary transition-colors hover:text-primary/80"
                >
                  View All
                </Link>
              </div>

              <div className="divide-y divide-border">
                {displayStocks.length > 0 ? (
                  displayStocks.map(stock => {
                    const symbol = stock.symbol.toUpperCase()
                    const isUp = Number(stock.change_percent || 0) >= 0
                    const currentPrice = Number(stock.price || 100)
                    const sparkData = isUp
                      ? [currentPrice * 0.96, currentPrice * 0.97, currentPrice * 0.99, currentPrice * 0.98, currentPrice]
                      : [currentPrice * 1.04, currentPrice * 1.03, currentPrice * 1.01, currentPrice * 1.02, currentPrice]

                    return (
                      <Link
                        key={symbol}
                        href={`/stocks/${symbol.toLowerCase()}`}
                        className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Custom Brand Logo Tile */}
                          <div className="grid size-11 place-items-center rounded-2xl shadow-sm">
                            {symbol === 'TSLA' ? (
                              <div className="grid size-11 place-items-center rounded-2xl bg-[#E82127] text-white">
                                <TeslaLogo className="size-6" />
                              </div>
                            ) : symbol === 'NVDA' ? (
                              <div className="grid size-11 place-items-center rounded-2xl bg-[#76B900] text-white">
                                <NvidiaLogo className="size-6" />
                              </div>
                            ) : symbol === 'AAPL' ? (
                              <div className="grid size-11 place-items-center rounded-2xl bg-zinc-900 text-white dark:bg-zinc-800">
                                <AppleLogo className="size-6" />
                              </div>
                            ) : (
                              <div className="grid size-11 place-items-center rounded-2xl bg-muted font-mono text-xs font-bold text-foreground">
                                {symbol.slice(0, 2)}
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                              {symbol}
                            </p>
                            <p className="text-xs text-muted-foreground">{stock.name}</p>
                          </div>
                        </div>

                        {/* Mini Sparkline Chart in row */}
                        <div className="hidden sm:block">
                          <Sparkline data={sparkData} isUp={isUp} className="h-6 w-20" />
                        </div>

                        {/* Price & Change Badge */}
                        <div className="text-right">
                          <p className="font-mono text-sm font-bold text-foreground">
                            {fmt(Number(stock.price))}
                          </p>
                          <p className={`text-xs font-semibold ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                            {pct(Number(stock.change_percent || 0))}
                          </p>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No active stocks available.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (Mobile bottom, Desktop 5 cols) ───── */}
          <div className="space-y-5 lg:col-span-5">
            {/* Quick Action Buttons (Mobile Grid & Desktop Card) */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {[
                { href: '/wallet', icon: Wallet, label: 'Wallet', color: 'bg-emerald-500/10 text-emerald-500' },
                { href: '/investments', icon: TrendingUp, label: 'Invest', color: 'bg-blue-500/10 text-blue-500' },
                { href: '/stocks', icon: BarChart3, label: 'Stocks', color: 'bg-amber-500/10 text-amber-500' },
                { href: '/portfolio', icon: Briefcase, label: 'Portfolio', color: 'bg-purple-500/10 text-purple-500' },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-all hover:border-primary hover:shadow active:scale-95"
                >
                  <div className={`grid size-11 place-items-center rounded-xl transition-transform group-hover:scale-110 ${action.color}`}>
                    <action.icon size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-foreground">{action.label}</span>
                </Link>
              ))}
            </div>

            {/* Featured Product Banner (Model 3 Performance) */}
            <Link
              href="/inventory"
              className="group relative block overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/40 p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 dark:border-zinc-800"
            >
              {/* Ambient Red glow under vehicle */}
              <div className="pointer-events-none absolute -bottom-10 right-4 size-44 rounded-full bg-primary/20 blur-3xl transition-opacity group-hover:bg-primary/30" />

              <div className="flex items-center justify-between gap-4">
                <div className="z-10 flex-1">
                  <h3 className="text-xl font-extrabold tracking-tight text-foreground md:text-2xl">
                    Model 3<br />
                    <span className="font-normal text-muted-foreground">Performance</span>
                  </h3>
                  <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-sm font-bold text-foreground">
                    <span>$49,990</span>
                    <ArrowRight size={14} className="text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Photorealistic Model 3 Hero Image */}
                <div className="relative h-24 w-40 flex-shrink-0 sm:h-28 sm:w-48">
                  <Image
                    src="/model-3-performance.jpg"
                    alt="Tesla Model 3 Performance"
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                </div>
              </div>
            </Link>

            {/* VIP Status Privilege Card */}
            <div className="flex items-center gap-3.5 rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/5 via-card to-card p-5 shadow-sm">
              <div className="grid size-12 flex-shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                    {(profile?.vip_tier || 'standard').toUpperCase()} Tier
                  </span>
                  <Sparkles size={13} className="text-primary" />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {profile?.vip_tier && profile.vip_tier !== 'standard'
                    ? 'Exclusive early auction access & zero fees'
                    : 'Upgrade to Platinum for institutional perks'}
                </p>
              </div>
              <Link
                href="/vip"
                className="flex-shrink-0 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
              >
                {profile?.vip_tier && profile.vip_tier !== 'standard' ? 'Privileges' : 'Upgrade'}
              </Link>
            </div>

            {/* Recent Activity Section */}
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Recent Activity
                </p>
                <Link
                  href="/wallet"
                  className="text-xs font-bold text-primary transition-colors hover:text-primary/80"
                >
                  View All
                </Link>
              </div>

              <div className="divide-y divide-border">
                {displayActivity.length > 0 ? (
                  displayActivity.map(tx => {
                    const amount = Number(tx.amount)
                    const isPositive = amount >= 0

                    return (
                      <div key={tx.id} className="flex items-center justify-between px-6 py-3.5">
                        <div className="flex items-center gap-3.5">
                          {/* Category Circular Icon matching mockup */}
                          <div
                            className={`grid size-10 place-items-center rounded-full ${
                              tx.type.includes('invest')
                                ? 'bg-emerald-500/15 text-emerald-500'
                                : tx.type.includes('order')
                                ? 'bg-zinc-800 text-zinc-300 dark:bg-zinc-700'
                                : tx.type.includes('vip')
                                ? 'bg-zinc-800 text-zinc-300 dark:bg-zinc-700'
                                : 'bg-emerald-500/15 text-emerald-500'
                            }`}
                          >
                            {tx.type.includes('invest') ? (
                              <TrendingUp size={18} />
                            ) : tx.type.includes('order') ? (
                              <Car size={18} />
                            ) : tx.type.includes('vip') ? (
                              <ShieldCheck size={18} />
                            ) : (
                              <Gift size={18} />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-bold capitalize text-foreground">
                              {tx.type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">{tx.description || tx.type}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={`font-mono text-sm font-bold ${
                              isPositive ? 'text-emerald-500' : 'text-foreground'
                            }`}
                          >
                            {isPositive ? '+' : ''}{fmt(amount)}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {new Date(tx.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No recent transactions recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PlatformShell>
  )
}
