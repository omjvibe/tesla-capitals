'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Building2,
  MapPin,
  TrendingUp,
  Percent,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Zap,
  Search,
  Sparkles,
  Layers,
  CheckCircle2,
  Calendar,
  Wallet
} from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import type { RealEstateProperty, RealEstateInvestment, Profile, RealEstatePropertyType } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtDec(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

interface RealEstateClientProps {
  properties: RealEstateProperty[]
  holdings: (RealEstateInvestment & { property?: RealEstateProperty })[]
  profile: Profile | null
}

export function RealEstateClient({ properties, holdings, profile }: RealEstateClientProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'holdings'>('catalog')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | RealEstatePropertyType>('all')

  const userBalance = Number(profile?.wallet_balance || 0)

  // Calculations for user's positions
  const totalUserHoldingsValue = holdings.reduce((sum, h) => sum + Number(h.current_value || 0), 0)
  const totalUserInvested = holdings.reduce((sum, h) => sum + Number(h.amount_invested || 0), 0)
  const totalSharesOwned = holdings.reduce((sum, h) => sum + Number(h.shares || 0), 0)
  const userPL = totalUserHoldingsValue - totalUserInvested

  const filteredProperties = properties.filter(prop => {
    const matchesSearch =
      prop.title.toLowerCase().includes(search.toLowerCase()) ||
      prop.city.toLowerCase().includes(search.toLowerCase()) ||
      prop.location.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || prop.property_type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <PlatformShell>
      {/* Hero Section */}
      <div className="relative overflow-hidden border border-border bg-gradient-to-b from-card via-card to-background p-6 md:p-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-primary">
              <Building2 size={16} />
              <span>Real Estate Syndication</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Fractional Clean-Tech Infrastructure
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Co-own institutional-grade real estate assets powering the future of transportation and energy. 
              Earn passive monthly rental distributions backed by long-term corporate leases and capital appreciation.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-primary">
                <ShieldCheck size={14} /> 100% Asset-Backed
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-emerald-500">
                <Percent size={14} /> 8–18% Projected ARR
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 font-mono text-muted-foreground">
                <Zap size={14} /> Min. Entry $500
              </span>
            </div>
          </div>

          {/* Quick Wallet Card */}
          <div className="w-full shrink-0 border border-border bg-background/80 p-5 backdrop-blur sm:w-80">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase text-muted-foreground">
              <span>Your Digital Wallet</span>
              <Link href="/wallet" className="text-primary hover:underline">Deposit</Link>
            </div>
            <p className="mt-2 text-2xl font-bold">{fmt(userBalance)}</p>
            <p className="text-[10px] text-muted-foreground">Available cash for fractional allocations</p>

            {holdings.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Your Real Estate Equity</p>
                <p className="text-lg font-bold text-emerald-500">{fmt(totalUserHoldingsValue)}</p>
                <p className="text-[10px] text-muted-foreground">{totalSharesOwned} fractional shares owned</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="mt-8 flex items-center justify-between border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`border-b-2 pb-3 text-sm font-bold transition-all ${
              activeTab === 'catalog'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Available Properties ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('holdings')}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-bold transition-all ${
              activeTab === 'holdings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Your Positions</span>
            {holdings.length > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] text-primary-foreground">
                {holdings.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'catalog' && (
          <p className="hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:block">
            {filteredProperties.length} Opportunities Open
          </p>
        )}
      </div>

      {/* TAB CONTENT: CATALOG */}
      {activeTab === 'catalog' && (
        <div className="mt-6">
          {/* Search & Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by city, property name, or state..."
                className="h-10 w-full border border-border bg-card pl-10 pr-4 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'residential', 'commercial', 'industrial', 'land'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                    typeFilter === type
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Properties Grid */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.length === 0 ? (
              <div className="col-span-full border border-border bg-card p-12 text-center">
                <Building2 className="mx-auto size-12 text-muted-foreground/40" />
                <p className="mt-4 text-base font-bold">No real estate opportunities match your filters</p>
                <p className="mt-1 text-xs text-muted-foreground">Try clearing your search terms or filter tags.</p>
              </div>
            ) : (
              filteredProperties.map(prop => {
                const allocatedShares = prop.total_shares - prop.available_shares
                const fundingPercent = Math.min(100, Math.round((allocatedShares / prop.total_shares) * 100))
                const userHoldingInProp = holdings.find(h => h.property_id === prop.id)

                return (
                  <div
                    key={prop.id}
                    className="group flex flex-col justify-between border border-border bg-card transition-all duration-300 hover:border-primary/60 hover:shadow-xl"
                  >
                    <div>
                      {/* Property Image Container */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                        {prop.image_url ? (
                          <Image
                            src={prop.image_url}
                            alt={prop.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted-foreground">
                            TESLA REAL ESTATE
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute left-3 top-3 flex items-center gap-1.5">
                          <span className="rounded bg-black/80 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                            {prop.property_type}
                          </span>
                          {userHoldingInProp && (
                            <span className="flex items-center gap-1 rounded bg-emerald-600/90 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
                              <CheckCircle2 size={10} /> Owned
                            </span>
                          )}
                        </div>

                        <div className="absolute right-3 top-3">
                          <span className="rounded bg-primary/90 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                            {prop.risk_level} Risk
                          </span>
                        </div>

                        {/* Bottom Location */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                          <div className="flex items-center gap-1.5 text-xs font-bold drop-shadow">
                            <MapPin size={13} className="text-primary" />
                            <span>{prop.city}, {prop.country}</span>
                          </div>
                          {prop.occupancy_rate && (
                            <span className="font-mono text-[10px] text-white/90">
                              {prop.occupancy_rate}% Occupancy
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-5">
                        <h2 className="text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {prop.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {prop.description}
                        </p>

                        {/* Key Metrics Grid */}
                        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-3">
                          <div>
                            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Target ARR</p>
                            <p className="mt-0.5 text-base font-bold text-emerald-500">
                              {prop.projected_annual_return}%
                            </p>
                          </div>
                          <div>
                            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Rental Yield</p>
                            <p className="mt-0.5 text-base font-bold text-primary">
                              {prop.rental_yield}%
                            </p>
                          </div>
                          <div>
                            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Min Entry</p>
                            <p className="mt-0.5 text-sm font-bold text-foreground">
                              {fmt(Number(prop.min_investment))}
                            </p>
                          </div>
                          <div>
                            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Holding Period</p>
                            <p className="mt-0.5 text-sm font-bold text-foreground">
                              {prop.holding_period_months ? `${prop.holding_period_months} mo` : 'Open'}
                            </p>
                          </div>
                        </div>

                        {/* Funding Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                            <span>Syndication Progress</span>
                            <span className="font-bold text-foreground">{fundingPercent}%</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${fundingPercent}%` }}
                            />
                          </div>
                          <p className="mt-1 font-mono text-[9px] text-muted-foreground text-right">
                            {prop.available_shares.toLocaleString()} of {prop.total_shares.toLocaleString()} shares open
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Button */}
                    <div className="border-t border-border p-4">
                      <Link
                        href={`/real-estate/${prop.id}`}
                        className="flex w-full items-center justify-center gap-2 bg-foreground py-2.5 text-xs font-bold uppercase tracking-wider text-background transition-all hover:bg-primary hover:text-primary-foreground active:scale-95"
                      >
                        <span>View Opportunity & Invest</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: USER HOLDINGS */}
      {activeTab === 'holdings' && (
        <div className="mt-6">
          {/* Portfolio Summary Bar */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="border border-border bg-card p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Real Estate Valuation</p>
              <p className="mt-2 text-2xl font-bold">{fmt(totalUserHoldingsValue)}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{totalSharesOwned} fractional shares owned</p>
            </div>
            <div className="border border-border bg-card p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total Invested</p>
              <p className="mt-2 text-2xl font-bold">{fmt(totalUserInvested)}</p>
              <p className="font-mono text-[10px] text-muted-foreground">Cost basis across {holdings.length} properties</p>
            </div>
            <div className="border border-border bg-card p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Estimated Distributions</p>
              <p className="mt-2 text-2xl font-bold text-emerald-500">
                {fmt(totalUserHoldingsValue * 0.088 / 12)} / mo
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">Based on ~8.8% average rental yield</p>
            </div>
          </div>

          {holdings.length === 0 ? (
            <div className="mt-8 border border-border bg-card p-12 text-center">
              <Building2 className="mx-auto size-12 text-muted-foreground/40" />
              <p className="mt-4 text-base font-bold">You do not hold any real estate positions yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Browse available clean energy and industrial properties to make your first fractional investment.
              </p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="mt-6 inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
              >
                <span>Browse Catalog</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {holdings.map(holding => {
                const prop = holding.property
                const shares = holding.shares
                const invested = Number(holding.amount_invested)
                const currentVal = Number(holding.current_value)
                const propTotalVal = prop ? Number(prop.total_value) : 0
                const equityPct = prop ? ((invested / propTotalVal) * 100).toFixed(3) : '0'

                return (
                  <div
                    key={holding.id}
                    className="flex flex-col justify-between gap-5 border border-border bg-card p-5 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden border border-border bg-muted">
                        {prop?.image_url ? (
                          <Image src={prop.image_url} alt={prop.title} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-muted-foreground">
                            RE
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">{prop?.title || 'Real Estate Asset'}</h4>
                          <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-primary">
                            {prop?.property_type || 'Property'}
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <MapPin size={12} className="text-primary" />
                          <span>{prop?.city || 'Location'}, {prop?.country || 'USA'}</span>
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                          {shares} Fractional Shares · {equityPct}% Total Property Equity
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-6 border-t border-border pt-4 sm:border-0 sm:pt-0 sm:text-right">
                      <div>
                        <p className="font-mono text-[10px] uppercase text-muted-foreground">Position Value</p>
                        <p className="text-base font-bold text-foreground">{fmt(currentVal)}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">Invested: {fmt(invested)}</p>
                      </div>

                      {prop && (
                        <Link
                          href={`/real-estate/${prop.id}`}
                          className="flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-bold hover:border-primary hover:text-primary"
                        >
                          <span>Manage</span>
                          <ArrowRight size={13} />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </PlatformShell>
  )
}

