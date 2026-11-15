'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Building2,
  MapPin,
  TrendingUp,
  Percent,
  DollarSign,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Calendar,
  Wallet,
  Check,
  ChevronRight,
  Info,
  Maximize2,
  Home,
  Sliders,
  ExternalLink
} from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { useToast } from '@/components/ui/toast'
import type { RealEstateProperty, RealEstateInvestment, Profile } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtDec(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

interface RealEstateDetailClientProps {
  property: RealEstateProperty
  holding: RealEstateInvestment | null
  profile: Profile
  userId: string
}

export function RealEstateDetailClient({ property, holding, profile, userId }: RealEstateDetailClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  const pricePerShare = Number(property.price_per_share)
  const minSharesNeeded = Math.ceil(Number(property.min_investment) / pricePerShare)

  const [shares, setShares] = useState<number>(minSharesNeeded)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Wallet
  const userBalance = Number(profile?.wallet_balance || 0)

  // Calculations
  const totalCost = shares * pricePerShare
  const ownershipPercentage = ((totalCost / Number(property.total_value)) * 100).toFixed(3)
  const annualRentalReturn = totalCost * ((Number(property.rental_yield) || 8) / 100)
  const monthlyRentalReturn = annualRentalReturn / 12
  const projectedAppreciation3Yr = totalCost * (Math.pow(1 + (Number(property.projected_annual_return) || 12) / 100, 3) - 1)

  const images = [
    property.image_url,
    ...(Array.isArray(property.gallery_urls) ? property.gallery_urls : [])
  ].filter(Boolean) as string[]

  const handleSharesChange = (val: number) => {
    setError('')
    const clamped = Math.max(1, Math.min(property.available_shares, val))
    setShares(clamped)
  }

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (shares <= 0) {
      setError('Please specify at least 1 fractional share.')
      return
    }

    if (totalCost < Number(property.min_investment)) {
      setError(`Minimum investment is ${fmt(Number(property.min_investment))}.`)
      return
    }

    if (shares > property.available_shares) {
      setError(`Only ${property.available_shares} shares remaining.`)
      return
    }

    if (totalCost > userBalance) {
      setError(`Insufficient digital wallet balance. You need ${fmtDec(totalCost)} but have ${fmtDec(userBalance)}. Please deposit funds.`)
      toast('Insufficient Balance', 'Please deposit funds into your digital wallet.', 'error')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/real-estate/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          shares: shares
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setSuccess(true)
      toast(
        'Allocation Confirmed!',
        `Purchased ${shares} fractional shares in ${property.title} for ${fmtDec(totalCost)}.`
      )
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Investment transaction failed'
      setError(msg)
      toast('Transaction Error', msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const allocatedShares = property.total_shares - property.available_shares
  const fundingPercent = Math.min(100, Math.round((allocatedShares / property.total_shares) * 100))

  return (
    <PlatformShell>
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/real-estate" className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft size={14} />
          <span>Real Estate</span>
        </Link>
        <span>/</span>
        <span className="truncate font-bold text-foreground">{property.title}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Left Column: Property Showcase & Thesis */}
        <div>
          {/* Main Hero Image */}
          <div className="relative aspect-[16/9] w-full overflow-hidden border border-border bg-muted">
            {images.length > 0 ? (
              <Image
                src={images[activeImageIndex] || images[0]}
                alt={property.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-sm text-muted-foreground">
                TESLA ASSET MEDIA
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-2 text-white">
              <div>
                <span className="rounded bg-black/80 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur">
                  {property.property_type} Asset
                </span>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl text-white drop-shadow-md">
                  {property.title}
                </h1>
                <p className="flex items-center gap-1.5 font-mono text-xs text-white/90 drop-shadow">
                  <MapPin size={13} className="text-primary" />
                  <span>{property.location}, {property.city}, {property.country}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono text-[10px] uppercase text-white/80">Total Valuation</span>
                <p className="text-xl font-bold text-white drop-shadow">{fmt(Number(property.total_value))}</p>
              </div>
            </div>
          </div>

          {/* Gallery Thumbnails */}
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-primary' : 'border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 border border-border bg-card p-5 sm:grid-cols-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Price / Share</p>
              <p className="mt-1 text-xl font-bold text-foreground">{fmtDec(pricePerShare)}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Projected ARR</p>
              <p className="mt-1 text-xl font-bold text-emerald-500">{property.projected_annual_return}%</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Rental Yield</p>
              <p className="mt-1 text-xl font-bold text-primary">{property.rental_yield}%</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Occupancy</p>
              <p className="mt-1 text-xl font-bold text-foreground">{property.occupancy_rate || 100}%</p>
            </div>
          </div>

          {/* User's Current Position Banner (if already invested) */}
          {holding && (
            <div className="mt-6 border border-emerald-500/40 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                <CheckCircle2 size={14} />
                <span>Active Position in this Asset</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Shares Owned</p>
                  <p className="text-lg font-bold text-foreground">{holding.shares} shares</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Invested</p>
                  <p className="text-lg font-bold text-foreground">{fmt(Number(holding.amount_invested))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Valuation</p>
                  <p className="text-lg font-bold text-emerald-500">{fmt(Number(holding.current_value))}</p>
                </div>
              </div>
            </div>
          )}

          {/* Description & Thesis */}
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-primary">Syndication Thesis</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Property Specifications */}
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-primary">Asset Specifications</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
              <div className="border border-border bg-card p-3">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Gross Area</p>
                <p className="mt-1 font-bold">{property.size_sqft ? `${property.size_sqft.toLocaleString()} Sq Ft` : 'Industrial Plot'}</p>
              </div>
              <div className="border border-border bg-card p-3">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Risk Rating</p>
                <p className="mt-1 font-bold capitalize text-primary">{property.risk_level} Risk</p>
              </div>
              <div className="border border-border bg-card p-3">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Hold Horizon</p>
                <p className="mt-1 font-bold">{property.holding_period_months ? `${property.holding_period_months} Months` : 'Open-Ended'}</p>
              </div>
              <div className="border border-border bg-card p-3">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Asset Class</p>
                <p className="mt-1 font-bold capitalize">{property.property_type}</p>
              </div>
            </div>
          </div>

          {/* Amenities & Infrastructure */}
          {Array.isArray(property.amenities) && property.amenities.length > 0 && (
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="font-mono text-xs uppercase tracking-widest text-primary">Infrastructure & Highlights</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {property.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs text-foreground"
                  >
                    <Check size={12} className="text-primary" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projected Cashflow & Appreciation Calculator */}
          <div className="mt-8 border border-border bg-card p-6">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
              <Sliders size={14} />
              <span>Yield & Compounding Projection</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Simulated financial return for allocating {shares} fractional shares ({fmt(totalCost)}).
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="border border-border bg-background p-4">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Monthly Distribution</p>
                <p className="mt-1 text-xl font-bold text-emerald-500">+{fmtDec(monthlyRentalReturn)}</p>
                <p className="text-[10px] text-muted-foreground">Paid directly to wallet cash</p>
              </div>
              <div className="border border-border bg-background p-4">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Annual Net Yield</p>
                <p className="mt-1 text-xl font-bold text-primary">+{fmtDec(annualRentalReturn)}</p>
                <p className="text-[10px] text-muted-foreground">Based on {property.rental_yield}% yield</p>
              </div>
              <div className="border border-border bg-background p-4">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">3-Year Projected Gain</p>
                <p className="mt-1 text-xl font-bold text-foreground">+{fmt(projectedAppreciation3Yr)}</p>
                <p className="text-[10px] text-muted-foreground">Cap-appreciation + distributions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fractional Investment Ticket */}
        <div>
          <div className="sticky top-24 border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Allocation Desk</p>
                <h2 className="text-xl font-bold">Invest in this Asset</h2>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-primary">
                  <Wallet size={14} />
                  <span>{fmt(userBalance)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Available Cash</p>
              </div>
            </div>

            {/* Syndication Progress */}
            <div className="mt-5">
              <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                <span>Total Syndicated</span>
                <span className="font-bold text-foreground">{fundingPercent}% Funded</span>
              </div>
              <div className="mt-1.5 h-2 w-full bg-muted">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${fundingPercent}%` }} />
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                {property.available_shares.toLocaleString()} of {property.total_shares.toLocaleString()} shares open
              </p>
            </div>

            {success ? (
              <div className="mt-6 border border-emerald-500/40 bg-emerald-500/10 p-5 text-center">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                <h4 className="mt-3 text-base font-bold text-emerald-500">Allocation Successful!</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your fractional shares are now active in your portfolio. Monthly distributions will automatically credit your digital wallet.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <Link
                    href="/portfolio"
                    className="bg-primary py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
                  >
                    View Portfolio
                  </Link>
                  <button
                    onClick={() => setSuccess(false)}
                    className="border border-border py-2 text-xs font-bold hover:bg-muted"
                  >
                    Invest More
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInvest} className="mt-6 space-y-5">
                {error && (
                  <div className="border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                    {error}
                  </div>
                )}

                {/* Shares Counter */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs font-bold uppercase text-foreground">
                      Fractional Shares
                    </label>
                    <span className="font-mono text-xs text-muted-foreground">
                      {fmtDec(pricePerShare)} / share
                    </span>
                  </div>

                  <div className="mt-2 flex items-center border border-border bg-background">
                    <button
                      type="button"
                      onClick={() => handleSharesChange(shares - 1)}
                      className="px-4 py-3 text-base font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={property.available_shares}
                      value={shares}
                      onChange={e => handleSharesChange(parseInt(e.target.value, 10) || 1)}
                      className="h-12 w-full bg-transparent text-center font-mono text-lg font-bold outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSharesChange(shares + 1)}
                      className="px-4 py-3 text-base font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="mt-2 flex gap-1.5">
                    {[1, 5, 10, 25, 50].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSharesChange(s)}
                        className={`flex-1 border py-1 font-mono text-[10px] transition-colors ${
                          shares === s
                            ? 'border-primary bg-primary text-primary-foreground font-bold'
                            : 'border-border bg-background text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        +{s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total Cost Breakdown */}
                <div className="space-y-2 border-y border-border py-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({shares} shares)</span>
                    <span className="font-bold">{fmtDec(totalCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Syndication Fee (0%)</span>
                    <span className="font-mono text-emerald-500 font-bold">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset Equity Share</span>
                    <span className="font-mono text-primary font-bold">{ownershipPercentage}%</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                    <span>Total Required</span>
                    <span className="text-primary">{fmtDec(totalCost)}</span>
                  </div>
                </div>

                {/* Action Button */}
                {userBalance < totalCost ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      className="w-full bg-muted py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-60"
                    >
                      Insufficient Wallet Balance
                    </button>
                    <Link
                      href="/wallet"
                      className="flex w-full items-center justify-center gap-1.5 border border-primary bg-primary/10 py-3 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <Wallet size={14} />
                      <span>Deposit Funds ({fmtDec(totalCost - userBalance)} needed)</span>
                    </Link>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || property.available_shares <= 0}
                    className="w-full bg-primary py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Processing Allocation...' : `Confirm Investment (${fmt(totalCost)})`}
                  </button>
                )}

                <p className="text-center font-mono text-[9px] text-muted-foreground">
                  Secured by Tesla Capital Asset Custody · Instant settlement from wallet balance.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </PlatformShell>
  )
}

