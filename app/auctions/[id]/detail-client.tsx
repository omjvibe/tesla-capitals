'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Gavel,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Wallet,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Zap,
  Info,
  Calendar,
} from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import { useToast } from '@/components/ui/toast'
import type { Auction, AuctionBid, Profile } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function maskEmail(email: string) {
  const parts = email.split('@')
  if (parts.length !== 2) return 'Investor'
  const name = parts[0]
  if (name.length <= 2) return `${name[0]}***@${parts[1]}`
  return `${name.slice(0, 2)}***${name.slice(-1)}@${parts[1]}`
}

interface Props {
  initialAuction: Auction
  initialBids: AuctionBid[]
  profile: Profile | null
}

export function AuctionDetailClient({ initialAuction, initialBids, profile }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  const [auction, setAuction] = useState<Auction>(initialAuction)
  const [bids, setBids] = useState<AuctionBid[]>(initialBids)
  const [activeImage, setActiveImage] = useState(auction.image_url || '')
  const [customBid, setCustomBid] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isUrgent: boolean; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isUrgent: false,
    isExpired: false,
  })

  const balance = profile?.wallet_balance || 0
  const currentBid = auction.current_bid > 0 ? auction.current_bid : auction.starting_price
  const increment = auction.min_bid_increment || 500
  const minRequiredBid = auction.current_bid > 0 ? auction.current_bid + increment : auction.starting_price
  const reserveMet = auction.current_bid >= auction.reserve_price
  const isLive = auction.status === 'live'

  // Dynamic live countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const end = new Date(auction.ends_at).getTime()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isUrgent: false, isExpired: true })
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      const isUrgent = diff <= 120 * 1000 // Under 2 minutes

      setTimeLeft({ hours, minutes, seconds, isUrgent, isExpired: false })
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [auction.ends_at])

  const handlePlaceBid = async (amount: number) => {
    if (!profile) {
      toast('Authentication Required', 'Please sign in to place a bid.', 'error')
      router.push(`/login?redirect=/auctions/${auction.id}`)
      return
    }

    if (profile.is_kyc_mandated && profile.kyc_status !== 'approved') {
      toast('KYC Verification Required', 'Please complete identity verification to participate.', 'error')
      router.push('/account?kyc_required=true')
      return
    }

    if (balance < amount) {
      toast(
        'Insufficient Balance',
        `Your available liquid balance is ${fmt(balance)}, but this bid requires ${fmt(amount)}. Please deposit funds to qualify.`,
        'error'
      )
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/auctions/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId: auction.id,
          amount,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast('Bid Confirmed!', data.message)
        setAuction(prev => ({
          ...prev,
          current_bid: amount,
          total_bids: data.totalBids,
          ends_at: data.endsAt || prev.ends_at,
        }))
        // Add bid to local feed
        const newBid: AuctionBid = {
          id: crypto.randomUUID(),
          auction_id: auction.id,
          user_id: profile.id,
          amount,
          status: 'active',
          created_at: new Date().toISOString(),
          user: profile,
        }
        setBids(prev => [newBid, ...prev.map(b => ({ ...b, status: 'outbid' as const }))])
        setCustomBid('')
        if (data.extended) {
          toast('Anti-Snipe Protection Triggered', 'Auction clock extended by +2 minutes!', 'info')
        }
        router.refresh()
      } else {
        toast('Bid Rejected', data.error || 'Failed to place bid.', 'error')
      }
    } catch (err: any) {
      toast('Error', err.message || 'Network error while placing bid', 'error')
    }
    setSubmitting(false)
  }

  const gallery = [
    auction.image_url,
    ...(Array.isArray(auction.gallery_urls) ? auction.gallery_urls : []),
  ].filter(Boolean) as string[]

  return (
    <PlatformShell>
      {/* Back link & Category */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/auctions"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} /> Back to Auction Floor
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Lot Status:</span>
          {isLive ? (
            <span className="flex items-center gap-1.5 border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold uppercase text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-ping" /> Live Bidding
            </span>
          ) : (
            <span className="border border-border bg-card px-2.5 py-0.5 font-mono text-xs font-bold uppercase text-yellow-500">
              {auction.status}
            </span>
          )}
        </div>
      </div>

      {/* Main Lot Grid */}
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Left Column: Media & Specifications (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Active Featured Image */}
          <div className="relative aspect-[16/10] w-full overflow-hidden border border-border bg-background shadow-2xl">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={auction.title}
                fill
                priority
                className="object-cover transition-all duration-700 hover:scale-105"
              />
            ) : (
              <div className="grid size-full place-items-center bg-muted">
                <Gavel size={48} className="text-muted-foreground" />
              </div>
            )}

            {/* Floating Soft Close Warning */}
            {timeLeft.isUrgent && isLive && (
              <div className="absolute top-4 left-4 right-4 flex items-center justify-center gap-2 border border-primary bg-black/90 p-3 font-mono text-xs font-bold uppercase text-primary shadow-lg animate-pulse">
                <Zap size={16} /> Final 2 Minutes &bull; Soft Close Active (+2m on New Bids)
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-[16/10] overflow-hidden border transition-all ${
                    activeImage === img ? 'border-primary ring-1 ring-primary' : 'border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Lot Description */}
          <div className="border border-border bg-card p-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Lot Dossier & Provenance</h2>
            <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{auction.title}</h1>
            {auction.subtitle && (
              <p className="mt-1 text-sm text-muted-foreground font-mono">{auction.subtitle}</p>
            )}

            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {auction.description}
              </p>
            </div>

            {/* Vehicle Technical Specifications Grid */}
            {auction.specs && typeof auction.specs === 'object' && (
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="font-mono text-xs uppercase tracking-widest text-foreground font-bold mb-4">
                  Engineering Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(auction.specs as Record<string, string>).map(([k, v]) => (
                    <div key={k} className="border border-border/70 bg-background p-3">
                      <p className="font-mono text-[10px] uppercase text-muted-foreground">{k}</p>
                      <p className="mt-1 text-xs font-bold text-foreground truncate">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Terms & Escrow Disclosure Card */}
          <div className="border border-border bg-card p-5 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <ShieldCheck size={16} className="text-primary" /> Institutional Bidding Guarantee
            </div>
            <p>
              Bids submitted are legally binding and backed by your verified liquid balance. When placing a bid, the bid amount is held in automated platform escrow. If another member outbids you, your funds are instantaneously unlocked.
            </p>
          </div>
        </div>

        {/* Right Column: Live Bidding Arena Desk (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Live Countdown Clock Deck */}
          <div className={`border p-6 text-center transition-all ${
            timeLeft.isUrgent
              ? 'border-primary bg-primary/10 animate-pulse'
              : 'border-border bg-card'
          }`}>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {isLive ? (timeLeft.isExpired ? 'Bidding Concluded' : 'Live Clock Remaining') : 'Auction Concluded'}
            </p>

            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="border border-border bg-background px-4 py-3 min-w-[72px]">
                <p className="font-mono text-3xl font-bold text-foreground">
                  {String(timeLeft.hours).padStart(2, '0')}
                </p>
                <p className="font-mono text-[9px] uppercase text-muted-foreground mt-1">Hours</p>
              </div>
              <span className="font-mono text-2xl font-bold text-primary">:</span>
              <div className="border border-border bg-background px-4 py-3 min-w-[72px]">
                <p className="font-mono text-3xl font-bold text-foreground">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </p>
                <p className="font-mono text-[9px] uppercase text-muted-foreground mt-1">Minutes</p>
              </div>
              <span className="font-mono text-2xl font-bold text-primary">:</span>
              <div className="border border-border bg-background px-4 py-3 min-w-[72px]">
                <p className={`font-mono text-3xl font-bold ${timeLeft.isUrgent ? 'text-primary' : 'text-foreground'}`}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </p>
                <p className="font-mono text-[9px] uppercase text-muted-foreground mt-1">Seconds</p>
              </div>
            </div>

            <p className="mt-4 font-mono text-[10px] text-muted-foreground">
              Closes: {new Date(auction.ends_at).toLocaleString()}
            </p>
          </div>

          {/* Current Bid & Pricing Summary */}
          <div className="border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {isLive ? 'Current High Bid' : 'Final Hammer Price'}
                </p>
                <p className="mt-1 font-mono text-4xl font-bold text-foreground">
                  {fmt(Number(currentBid))}
                </p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-2.5 py-1 font-mono text-[10px] font-bold uppercase ${
                  reserveMet
                    ? 'border border-green-500/40 bg-green-500/10 text-green-400'
                    : 'border border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                }`}>
                  {reserveMet ? 'Reserve Met' : 'Reserve Pending'}
                </span>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {auction.total_bids || 0} Total Bids
                </p>
              </div>
            </div>

            {/* Balance Check Indicator */}
            <div className="mt-5 border-t border-border pt-4 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Wallet size={14} className="text-primary" /> Your Liquid Balance:
              </span>
              <span className="font-mono font-bold text-foreground">{fmt(balance)}</span>
            </div>

            {/* Quick Action Bid Deck */}
            {isLive && !timeLeft.isExpired && (
              <div className="mt-6 flex flex-col gap-3">
                <p className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                  Place One-Click Bid:
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handlePlaceBid(minRequiredBid)}
                    disabled={submitting || balance < minRequiredBid}
                    className="border border-border bg-background py-3 font-mono text-xs font-bold hover:border-primary active:scale-95 disabled:opacity-40"
                  >
                    +${increment.toLocaleString()}
                    <span className="block text-[10px] font-normal text-muted-foreground">({fmt(minRequiredBid)})</span>
                  </button>

                  <button
                    onClick={() => handlePlaceBid(minRequiredBid + increment)}
                    disabled={submitting || balance < (minRequiredBid + increment)}
                    className="border border-border bg-background py-3 font-mono text-xs font-bold hover:border-primary active:scale-95 disabled:opacity-40"
                  >
                    +${(increment * 2).toLocaleString()}
                    <span className="block text-[10px] font-normal text-muted-foreground">({fmt(minRequiredBid + increment)})</span>
                  </button>

                  <button
                    onClick={() => handlePlaceBid(minRequiredBid + increment * 4)}
                    disabled={submitting || balance < (minRequiredBid + increment * 4)}
                    className="border border-border bg-background py-3 font-mono text-xs font-bold hover:border-primary active:scale-95 disabled:opacity-40"
                  >
                    +${(increment * 5).toLocaleString()}
                    <span className="block text-[10px] font-normal text-muted-foreground">({fmt(minRequiredBid + increment * 4)})</span>
                  </button>
                </div>

                {/* Custom Bid Input Form */}
                <div className="mt-3 flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">$</span>
                    <input
                      type="number"
                      placeholder={`Min: ${minRequiredBid.toLocaleString()}`}
                      value={customBid}
                      onChange={e => setCustomBid(e.target.value)}
                      min={minRequiredBid}
                      step={increment}
                      className="h-11 w-full border border-border bg-background pl-8 pr-3 font-mono text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={() => customBid && handlePlaceBid(Number(customBid))}
                    disabled={submitting || !customBid || Number(customBid) < minRequiredBid || balance < Number(customBid)}
                    className="bg-primary px-6 font-mono text-xs font-bold uppercase text-primary-foreground hover:brightness-110 active:scale-95 disabled:opacity-40"
                  >
                    {submitting ? 'Placing...' : 'Submit Bid'}
                  </button>
                </div>

                {/* Buy It Now (Optional Instant Settlement) */}
                {auction.buy_now_price && (
                  <div className="mt-4 border-t border-border pt-4">
                    <button
                      onClick={() => handlePlaceBid(Number(auction.buy_now_price))}
                      disabled={submitting || balance < Number(auction.buy_now_price)}
                      className="w-full flex items-center justify-center gap-2 border border-primary bg-primary/10 py-3.5 font-mono text-xs font-bold uppercase text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40"
                    >
                      <Sparkles size={15} /> Buy It Now & End Auction ({fmt(Number(auction.buy_now_price))})
                    </button>
                  </div>
                )}
              </div>
            )}

            {(!isLive || timeLeft.isExpired) && (
              <div className="mt-6 border border-border bg-background p-4 text-center">
                <p className="font-mono text-xs uppercase font-bold text-yellow-500">Auction Concluded</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Final settlement is complete. No further bids can be accepted.
                </p>
              </div>
            )}
          </div>

          {/* Live Bid History Ledger */}
          <div className="border border-border bg-card p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                Bid History ({bids.length})
              </h3>
              <span className="font-mono text-[10px] text-muted-foreground">Transparent Ledger</span>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[320px] overflow-y-auto pr-2">
              {bids.length > 0 ? (
                bids.map((b, idx) => (
                  <div
                    key={b.id}
                    className={`flex items-center justify-between border p-3 text-xs ${
                      idx === 0
                        ? 'border-primary/50 bg-primary/5 font-bold'
                        : 'border-border/60 bg-background'
                    }`}
                  >
                    <div>
                      <p className="text-foreground">
                        {b.user?.email ? maskEmail(b.user.email) : 'Verified Bidder'}
                        {idx === 0 && (
                          <span className="ml-2 font-mono text-[9px] uppercase text-primary border border-primary/30 px-1 py-0.2">
                            High Bidder
                          </span>
                        )}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} &bull; {new Date(b.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <p className="font-mono text-sm font-bold text-foreground">
                      {fmt(Number(b.amount))}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No bids placed yet. Be the opening bidder at {fmt(auction.starting_price)}!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PlatformShell>
  )
}
