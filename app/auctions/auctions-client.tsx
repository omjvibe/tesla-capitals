'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Gavel, Clock, ShieldCheck, ArrowUpRight, Flame, Sparkles, Wallet, AlertCircle, CheckCircle } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import type { Auction, Profile } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

interface Props {
  initialAuctions: Auction[]
  profile: Profile | null
}

export function AuctionsClient({ initialAuctions, profile }: Props) {
  const [auctions] = useState<Auction[]>(initialAuctions)
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'ended'>('live')

  const liveAuctions = auctions.filter(a => a.status === 'live')
  const upcomingAuctions = auctions.filter(a => a.status === 'upcoming')
  const endedAuctions = auctions.filter(a => a.status === 'ended')

  const filtered = filter === 'all'
    ? auctions
    : filter === 'live'
    ? liveAuctions
    : filter === 'upcoming'
    ? upcomingAuctions
    : endedAuctions

  const balance = profile?.wallet_balance || 0

  return (
    <PlatformShell>
      {/* Header Banner */}
      <div className="border-b border-border pb-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-primary animate-pulse" />
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Live Automotive Exchange</p>
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Tesla Premier Auctions</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Direct institutional bidding arena for rare collector builds, low-mileage factory prototypes, and high-performance Track Edition vehicles.
            </p>
          </div>

          {/* User Available Balance Deck */}
          <div className="border border-border bg-card p-4 min-w-[240px]">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Wallet size={14} /> Available Bidding Power</span>
              <Link href="/wallet" className="font-mono text-[10px] text-primary hover:underline">Deposit +</Link>
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-foreground">{fmt(balance)}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">Bids are backed by your liquid treasury balance</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('live')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              filter === 'live'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flame size={14} className={filter === 'live' ? 'text-primary' : ''} />
            <span>Live Lots ({liveAuctions.length})</span>
          </button>

          <button
            onClick={() => setFilter('upcoming')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              filter === 'upcoming'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock size={14} />
            <span>Upcoming Lots ({upcomingAuctions.length})</span>
          </button>

          <button
            onClick={() => setFilter('ended')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              filter === 'ended'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckCircle size={14} />
            <span>Past Results ({endedAuctions.length})</span>
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`border-b-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              filter === 'all'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            All Lots ({auctions.length})
          </button>
        </div>
      </div>

      {/* Auction Lots Grid */}
      <div className="mt-8">
        {filtered.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(auction => {
              const currentBid = auction.current_bid > 0 ? auction.current_bid : auction.starting_price
              const reserveMet = auction.current_bid >= auction.reserve_price
              const isLive = auction.status === 'live'

              return (
                <Link
                  key={auction.id}
                  href={`/auctions/${auction.id}`}
                  className="group flex flex-col justify-between border border-border bg-card p-5 transition-all duration-300 hover:border-primary hover:shadow-2xl hover:-translate-y-1"
                >
                  <div>
                    {/* Media Thumbnail */}
                    <div className="relative h-56 w-full overflow-hidden border border-border bg-background mb-4">
                      {auction.image_url ? (
                        <Image
                          src={auction.image_url}
                          alt={auction.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid size-full place-items-center bg-muted">
                          <Gavel size={32} className="text-muted-foreground" />
                        </div>
                      )}

                      {/* Status Badges Overlay */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {isLive && (
                          <span className="flex items-center gap-1.5 border border-primary/40 bg-black/80 backdrop-blur px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-primary">
                            <span className="size-1.5 rounded-full bg-primary animate-ping" />
                            Live Bidding
                          </span>
                        )}
                        {auction.status === 'upcoming' && (
                          <span className="border border-border bg-black/80 backdrop-blur px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                            Upcoming Lot
                          </span>
                        )}
                        {auction.status === 'ended' && (
                          <span className="border border-border bg-black/80 backdrop-blur px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-yellow-500">
                            Concluded
                          </span>
                        )}
                        {reserveMet && (
                          <span className="border border-green-500/40 bg-black/80 backdrop-blur px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-green-400">
                            Reserve Met
                          </span>
                        )}
                      </div>

                      {/* Buy It Now Pill if configured */}
                      {auction.buy_now_price && isLive && (
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur border border-border px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                          Buy Now: <strong className="text-foreground">{fmt(Number(auction.buy_now_price))}</strong>
                        </div>
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors leading-snug">
                      {auction.title}
                    </h3>
                    {auction.subtitle && (
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {auction.subtitle}
                      </p>
                    )}

                    {/* Specs Grid */}
                    {auction.specs && typeof auction.specs === 'object' && (
                      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
                        {Object.entries(auction.specs as Record<string, string>).slice(0, 4).map(([k, v]) => (
                          <div key={k}>
                            <p className="font-mono text-[9px] uppercase text-muted-foreground truncate">{k}</p>
                            <p className="font-bold text-xs truncate">{v}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Financial & Bid Bar */}
                  <div className="mt-5 border-t border-border pt-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="font-mono text-[10px] uppercase text-muted-foreground">
                          {isLive ? 'Current High Bid' : auction.status === 'ended' ? 'Winning Hammer Price' : 'Starting Price'}
                        </p>
                        <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                          {fmt(Number(currentBid))}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {auction.total_bids || 0} {auction.total_bids === 1 ? 'Bid' : 'Bids'} Placed
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 font-mono text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                          Enter Arena <ArrowUpRight size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Countdown / Ending Info */}
                    {isLive && (
                      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 font-mono text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock size={12} /> Time Remaining:</span>
                        <span className="font-bold text-foreground">
                          {new Date(auction.ends_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="border border-border bg-card py-20 text-center">
            <Gavel className="mx-auto text-muted-foreground" size={40} />
            <p className="mt-4 text-lg font-bold">No auction lots currently in this category</p>
            <p className="mt-2 text-xs text-muted-foreground">Check back soon for new collector drops or view past results.</p>
          </div>
        )}
      </div>
    </PlatformShell>
  )
}
