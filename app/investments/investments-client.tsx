'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, Search, TrendingUp } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import type { Investment } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

const categories = ['All', 'Technology', 'Energy', 'Automotive', 'Sustainability', 'AI']

interface Props {
  investments: Investment[]
  holdings: { investment_id: string; amount: number; current_value: number }[]
}

export function InvestmentsClient({ investments, holdings }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const totalInvested = holdings.reduce((s, h) => s + Number(h.amount), 0)
  const totalValue = holdings.reduce((s, h) => s + Number(h.current_value), 0)

  const filtered = investments.filter(inv => {
    const matchSearch = inv.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || inv.category.toLowerCase() === category.toLowerCase()
    return matchSearch && matchCategory
  })

  return (
    <PlatformShell>
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Capital allocation</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Investments</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Discover opportunities built for the next decade.
          </p>
        </div>
        {holdings.length > 0 && (
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Your total invested</p>
            <p className="mt-1 text-2xl font-bold">{fmt(totalValue)}</p>
            <p className="text-xs text-muted-foreground">Cost basis: {fmt(totalInvested)}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 py-6">
        <div className="flex items-center gap-2 border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Search size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search investments"
            className="w-40 bg-transparent outline-none"
          />
        </div>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-2 text-xs font-bold transition-colors ${category === c ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Investment Cards */}
      {filtered.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(inv => {
            const userHolding = holdings.find(h => h.investment_id === inv.id)
            return (
              <Link key={inv.id} href={`/investments/${inv.id}`} className="group border border-border bg-card p-5 transition-colors hover:border-primary">
                <div className="flex items-start justify-between">
                  <div className="grid size-10 place-items-center bg-muted text-primary">
                    <TrendingUp size={20} />
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase ${inv.risk_level === 'high' ? 'bg-primary/10 text-primary' : inv.risk_level === 'moderate' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'}`}>
                    {inv.risk_level}
                  </span>
                </div>
                <p className="mt-7 text-lg font-bold">{inv.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">{inv.description}</p>
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-4">
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground">MIN INVESTMENT</p>
                    <p className="mt-1 text-sm font-bold">{fmt(Number(inv.min_amount))}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground">TARGET RETURN</p>
                    <p className="mt-1 text-sm font-bold">{inv.target_return ? `${inv.target_return}%` : '—'}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground">DURATION</p>
                    <p className="mt-1 text-sm font-bold">{inv.duration_months ? `${inv.duration_months} months` : 'Open'}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground">CATEGORY</p>
                    <p className="mt-1 text-sm font-bold capitalize">{inv.category}</p>
                  </div>
                </div>
                {userHolding && (
                  <div className="mt-4 border-t border-primary/30 bg-primary/5 p-3">
                    <p className="text-[10px] font-bold text-primary">YOU HAVE INVESTED: {fmt(Number(userHolding.current_value))}</p>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">View details</span>
                  <ArrowUpRight size={16} className="text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg font-bold">No investments found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {search || category !== 'All' ? 'Try adjusting your filters.' : 'New investment opportunities will appear here.'}
          </p>
        </div>
      )}
    </PlatformShell>
  )
}
