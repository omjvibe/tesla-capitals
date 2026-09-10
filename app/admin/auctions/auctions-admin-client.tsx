'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Gavel,
  Plus,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Edit2,
  Trash2,
  ChevronRight,
  Sparkles,
  DollarSign,
  User,
} from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import type { Auction, AuctionBid, Product } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

interface Props {
  initialAuctions: Auction[]
  initialBids: any[]
  products: Product[]
}

export function AdminAuctionsClient({ initialAuctions, initialBids, products }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  const [auctions, setAuctions] = useState<Auction[]>(initialAuctions)
  const [bids, setBids] = useState<any[]>(initialBids)
  const [activeTab, setActiveTab] = useState<'lots' | 'bids'>('lots')

  // Form Modal States
  const [showModal, setShowModal] = useState(false)
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null)
  const [loading, setLoading] = useState(false)

  // Fields
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [startingPrice, setStartingPrice] = useState('80000')
  const [reservePrice, setReservePrice] = useState('100000')
  const [minIncrement, setMinIncrement] = useState('1000')
  const [buyNowPrice, setBuyNowPrice] = useState('')
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 16))
  const [endsAt, setEndsAt] = useState(new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 16))
  const [status, setStatus] = useState<'draft' | 'upcoming' | 'live' | 'ended' | 'cancelled'>('live')
  const [selectedProductId, setSelectedProductId] = useState('')

  // Specs
  const [spec0to60, setSpec0to60] = useState('2.6s')
  const [specTopSpeed, setSpecTopSpeed] = useState('130 mph')
  const [specRange, setSpecRange] = useState('320 mi')
  const [specVin, setSpecVin] = useState('7G2CEBEA8RA' + Math.floor(100000 + Math.random() * 900000))

  // House Bid State
  const [houseBidAuction, setHouseBidAuction] = useState<Auction | null>(null)
  const [houseBidAmount, setHouseBidAmount] = useState('')

  const openCreate = () => {
    setEditingAuction(null)
    setTitle('')
    setSubtitle('')
    setDescription('')
    setImageUrl('')
    setStartingPrice('80000')
    setReservePrice('100000')
    setMinIncrement('1000')
    setBuyNowPrice('')
    setStartsAt(new Date().toISOString().slice(0, 16))
    setEndsAt(new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 16))
    setStatus('live')
    setSelectedProductId('')
    setShowModal(true)
  }

  const openEdit = (a: Auction) => {
    setEditingAuction(a)
    setTitle(a.title)
    setSubtitle(a.subtitle || '')
    setDescription(a.description || '')
    setImageUrl(a.image_url || '')
    setStartingPrice(String(a.starting_price))
    setReservePrice(String(a.reserve_price))
    setMinIncrement(String(a.min_bid_increment))
    setBuyNowPrice(a.buy_now_price ? String(a.buy_now_price) : '')
    setStartsAt(new Date(a.starts_at).toISOString().slice(0, 16))
    setEndsAt(new Date(a.ends_at).toISOString().slice(0, 16))
    setStatus(a.status)
    setSelectedProductId(a.product_id || '')
    setShowModal(true)
  }

  // Pre-fill from selected inventory vehicle
  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId)
    const p = products.find(prod => prod.id === prodId)
    if (p) {
      setTitle(`${p.name} — Exclusive Collector Edition`)
      setSubtitle(`Original MSRP ${fmt(Number(p.price))} &bull; Verified Factory Build`)
      setDescription(p.description || '')
      setImageUrl(p.image_url || '')
      setStartingPrice(String(Math.round(p.price * 0.8)))
      setReservePrice(String(p.price))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const specs = {
      '0-60 mph': spec0to60,
      'Top Speed': specTopSpeed,
      'Range': specRange,
      'VIN': specVin,
    }

    const payload = {
      title,
      subtitle: subtitle || null,
      description: description || null,
      image_url: imageUrl || null,
      product_id: selectedProductId || null,
      starting_price: parseFloat(startingPrice),
      reserve_price: parseFloat(reservePrice),
      min_bid_increment: parseFloat(minIncrement),
      buy_now_price: buyNowPrice ? parseFloat(buyNowPrice) : null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      status,
      specs,
    }

    if (editingAuction) {
      const { data, error } = await supabase
        .from('auctions')
        .update(payload)
        .eq('id', editingAuction.id)
        .select()
        .single()

      if (!error && data) {
        toast('Auction Updated', 'Lot specifications modified successfully.')
        setAuctions(prev => prev.map(a => a.id === data.id ? data : a))
        setShowModal(false)
        router.refresh()
      } else {
        toast('Update Error', error?.message || 'Failed to update auction lot.', 'error')
      }
    } else {
      const { data, error } = await supabase
        .from('auctions')
        .insert({
          ...payload,
          current_bid: 0,
          total_bids: 0,
        })
        .select()
        .single()

      if (!error && data) {
        toast('Auction Published', 'New vehicle lot is now active.')
        setAuctions(prev => [data, ...prev])
        setShowModal(false)
        router.refresh()
      } else {
        toast('Creation Error', error?.message || 'Failed to create auction lot.', 'error')
      }
    }
    setLoading(false)
  }

  // Admin Action Handler (Hammer Close, Extend, Cancel)
  const handleAdminAction = async (auctionId: string, action: string, payload?: any) => {
    if (action === 'hammer_close' && !confirm('Are you sure you want to end this auction and settle the order to the highest bidder?')) {
      return
    }

    try {
      const res = await fetch('/api/auctions/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId,
          action,
          payload,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast('Action Executed', data.message)
        router.refresh()
        // Refresh local status
        if (action === 'hammer_close') {
          setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, status: 'ended', winner_id: data.winnerId } : a))
        } else if (action === 'cancel_auction') {
          setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, status: 'cancelled' } : a))
        } else if (action === 'extend_time') {
          setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, ends_at: data.newEndTime } : a))
        }
      } else {
        toast('Action Failed', data.error || 'Failed to execute admin action.', 'error')
      }
    } catch (err: any) {
      toast('Error', err.message, 'error')
    }
  }

  const handleHouseBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!houseBidAuction || !houseBidAmount) return

    await handleAdminAction(houseBidAuction.id, 'house_bid', { amount: parseFloat(houseBidAmount) })
    setHouseBidAuction(null)
    setHouseBidAmount('')
  }

  // High-level KPIs
  const liveCount = auctions.filter(a => a.status === 'live').length
  const totalBidsCount = auctions.reduce((acc, a) => acc + (a.total_bids || 0), 0)
  const totalVolume = auctions.reduce((acc, a) => acc + Number(a.current_bid || 0), 0)

  return (
    <PlatformShell admin>
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Executive Operations Desk</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Auction Manager</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Complete management of collector automotive lots, live floor bidding, and settlement workflows.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary px-5 py-3 font-mono text-xs font-bold uppercase text-primary-foreground hover:brightness-110 active:scale-95"
        >
          <Plus size={16} /> Launch Auction Lot
        </button>
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-border bg-card p-5">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">Active Live Lots</p>
          <p className="mt-2 font-mono text-3xl font-bold text-foreground">{liveCount}</p>
          <p className="mt-1 font-mono text-[10px] text-green-500">Live floor accepting bids</p>
        </div>

        <div className="border border-border bg-card p-5">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">Total Bids Placed</p>
          <p className="mt-2 font-mono text-3xl font-bold text-foreground">{totalBidsCount}</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">Across all auctions</p>
        </div>

        <div className="border border-border bg-card p-5">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">Gross Auction Volume</p>
          <p className="mt-2 font-mono text-3xl font-bold text-foreground">{fmt(totalVolume)}</p>
          <p className="mt-1 font-mono text-[10px] text-primary">Active + settled capital</p>
        </div>

        <div className="border border-border bg-card p-5">
          <p className="font-mono text-[10px] uppercase text-muted-foreground">Total Catalogs</p>
          <p className="mt-2 font-mono text-3xl font-bold text-foreground">{auctions.length}</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">Published lots</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex border-b border-border pb-4 gap-4">
        <button
          onClick={() => setActiveTab('lots')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
            activeTab === 'lots'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Gavel size={15} /> Auction Lots ({auctions.length})
        </button>

        <button
          onClick={() => setActiveTab('bids')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
            activeTab === 'bids'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock size={15} /> Live Bids Ledger ({bids.length})
        </button>
      </div>

      {/* AUCTION LOTS TAB */}
      {activeTab === 'lots' && (
        <div className="mt-6 space-y-4">
          {auctions.map(auction => {
            const current = auction.current_bid > 0 ? auction.current_bid : auction.starting_price
            const reserveMet = auction.current_bid >= auction.reserve_price
            const isLive = auction.status === 'live'

            return (
              <div key={auction.id} className="border border-border bg-card p-5 transition-all hover:border-primary/50">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Left info & media */}
                  <div className="flex items-start gap-4">
                    <div className="relative size-20 shrink-0 overflow-hidden border border-border bg-background">
                      {auction.image_url ? (
                        <Image src={auction.image_url} alt={auction.title} fill className="object-cover" />
                      ) : (
                        <div className="grid size-full place-items-center"><Gavel size={24} className="text-muted-foreground" /></div>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-foreground text-base">{auction.title}</h3>
                        <span className={`px-2 py-0.5 font-mono text-[9px] uppercase font-bold ${
                          isLive
                            ? 'border border-primary/40 bg-primary/10 text-primary'
                            : auction.status === 'ended'
                            ? 'border border-green-500/40 bg-green-500/10 text-green-400'
                            : 'border border-border bg-muted text-muted-foreground'
                        }`}>
                          {auction.status}
                        </span>
                        {reserveMet && (
                          <span className="border border-green-500/30 bg-green-500/10 px-2 py-0.5 font-mono text-[9px] uppercase text-green-400 font-bold">
                            Reserve Met
                          </span>
                        )}
                      </div>

                      {auction.subtitle && (
                        <p className="mt-1 text-xs text-muted-foreground font-mono">{auction.subtitle}</p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-4 font-mono text-[11px] text-muted-foreground">
                        <span>Starting: <strong className="text-foreground">{fmt(auction.starting_price)}</strong></span>
                        <span>Reserve: <strong className="text-foreground">{fmt(auction.reserve_price)}</strong></span>
                        <span>Increment: <strong className="text-foreground">+{fmt(auction.min_bid_increment)}</strong></span>
                        <span>Closes: <strong className="text-foreground">{new Date(auction.ends_at).toLocaleDateString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Financial status & Controls */}
                  <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                    <div className="text-left lg:text-right">
                      <p className="font-mono text-[10px] uppercase text-muted-foreground">
                        {isLive ? 'Current High Bid' : 'Final Price'}
                      </p>
                      <p className="font-mono text-2xl font-bold text-foreground">{fmt(Number(current))}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{auction.total_bids || 0} Bids</p>
                    </div>

                    {/* Operational Triggers */}
                    <div className="flex flex-wrap items-center gap-2 border-l border-border pl-4">
                      {isLive && (
                        <>
                          <button
                            onClick={() => handleAdminAction(auction.id, 'hammer_close')}
                            title="Instant Hammer Close (Settle to Highest Bidder)"
                            className="flex items-center gap-1.5 bg-primary px-3 py-2 font-mono text-xs font-bold uppercase text-primary-foreground hover:brightness-110 active:scale-95"
                          >
                            <Gavel size={14} /> Settle Lot
                          </button>

                          <button
                            onClick={() => handleAdminAction(auction.id, 'extend_time', { minutes: 15 })}
                            title="Extend auction by +15 minutes"
                            className="border border-border bg-background px-3 py-2 font-mono text-xs hover:border-primary active:scale-95"
                          >
                            +15m
                          </button>

                          <button
                            onClick={() => {
                              setHouseBidAuction(auction)
                              setHouseBidAmount(String(current + (auction.min_bid_increment || 500)))
                            }}
                            title="Place House Bid"
                            className="border border-border bg-background px-3 py-2 font-mono text-xs hover:border-primary active:scale-95"
                          >
                            House Bid
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => openEdit(auction)}
                        className="border border-border bg-background p-2 text-muted-foreground hover:border-primary hover:text-foreground"
                      >
                        <Edit2 size={14} />
                      </button>

                      {isLive && (
                        <button
                          onClick={() => handleAdminAction(auction.id, 'cancel_auction')}
                          title="Cancel Auction"
                          className="border border-red-500/30 bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* LIVE BIDS LEDGER TAB */}
      {activeTab === 'bids' && (
        <div className="mt-6 border border-border bg-card">
          <div className="border-b border-border p-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              Complete Bidding Audit Log ({bids.length})
            </h3>
          </div>

          <div className="divide-y divide-border">
            {bids.length > 0 ? (
              bids.map(bid => (
                <div key={bid.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 text-xs gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-primary" />
                      <p className="font-bold text-foreground">
                        {bid.user?.full_name || bid.user?.email || 'Registered Member'}
                      </p>
                      <span className="font-mono text-[10px] text-muted-foreground">({bid.user?.email})</span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                      Lot: <strong className="text-foreground">{bid.auction?.title || 'Vehicle Lot'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-right">
                    <div>
                      <span className="text-[10px] text-muted-foreground">Liquid Balance: </span>
                      <strong className="text-green-500">{fmt(Number(bid.user?.wallet_balance || 0))}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground">Bid Placed: </span>
                      <strong className="text-foreground text-sm">{fmt(Number(bid.amount))}</strong>
                    </div>

                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                      bid.status === 'won'
                        ? 'bg-green-500/10 text-green-400'
                        : bid.status === 'active'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {bid.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-12 text-center text-xs text-muted-foreground">No bids recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Auction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="my-8 w-full max-w-2xl border border-border bg-card p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="font-mono text-xs uppercase text-primary">Auction Administration</p>
                <h3 className="text-xl font-bold">
                  {editingAuction ? `Edit Lot ${editingAuction.title}` : 'Launch New Vehicle Auction'}
                </h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {/* Quick prefill from inventory */}
            {!editingAuction && (
              <label className="flex flex-col gap-1 text-xs font-bold border border-primary/30 bg-primary/5 p-3">
                <span className="flex items-center gap-1.5 text-primary"><Sparkles size={14} /> Quick-Fill from Inventory Catalog:</span>
                <select
                  value={selectedProductId}
                  onChange={e => handleSelectProduct(e.target.value)}
                  className="h-10 border border-border bg-background px-3 font-mono text-xs outline-none focus:border-primary"
                >
                  <option value="">Select vehicle from inventory...</option>
                  {products.filter(p => p.category === 'vehicles').map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({fmt(Number(p.price))})</option>
                  ))}
                </select>
              </label>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-bold">
                Auction Title
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="2026 Cybertruck Cyberbeast #001"
                  required
                  className="h-10 border border-border bg-background px-3 outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold">
                Subtitle Tagline
                <input
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder="Tri-Motor AWD &bull; 845 HP &bull; Raw Steel"
                  className="h-10 border border-border bg-background px-3 outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-xs font-bold">
              Image URL
              <input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                required
                className="h-10 border border-border bg-background px-3 outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-bold">
              Detailed Dossier & Provenance
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Collector lot provenance, vehicle history, battery health, and factory packages..."
                className="border border-border bg-background p-3 text-xs outline-none focus:border-primary"
              />
            </label>

            {/* Financial Parameters */}
            <div className="grid gap-4 sm:grid-cols-4 border-t border-border pt-3">
              <label className="flex flex-col gap-1 text-xs font-bold">
                Starting Bid ($)
                <input
                  type="number"
                  value={startingPrice}
                  onChange={e => setStartingPrice(e.target.value)}
                  required
                  className="h-10 border border-border bg-background px-3 font-mono text-xs outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold">
                Reserve Price ($)
                <input
                  type="number"
                  value={reservePrice}
                  onChange={e => setReservePrice(e.target.value)}
                  required
                  className="h-10 border border-border bg-background px-3 font-mono text-xs outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold">
                Bid Increment ($)
                <input
                  type="number"
                  value={minIncrement}
                  onChange={e => setMinIncrement(e.target.value)}
                  required
                  className="h-10 border border-border bg-background px-3 font-mono text-xs outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold">
                Buy It Now ($)
                <input
                  type="number"
                  value={buyNowPrice}
                  onChange={e => setBuyNowPrice(e.target.value)}
                  placeholder="Optional"
                  className="h-10 border border-border bg-background px-3 font-mono text-xs outline-none focus:border-primary"
                />
              </label>
            </div>

            {/* Dates & Status */}
            <div className="grid gap-4 sm:grid-cols-3 border-t border-border pt-3">
              <label className="flex flex-col gap-1 text-xs font-bold">
                Starts At
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={e => setStartsAt(e.target.value)}
                  required
                  className="h-10 border border-border bg-background px-3 font-mono text-xs outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold">
                Ends At
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={e => setEndsAt(e.target.value)}
                  required
                  className="h-10 border border-border bg-background px-3 font-mono text-xs outline-none focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold">
                Lot Status
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="h-10 border border-border bg-background px-3 font-mono text-xs outline-none focus:border-primary"
                >
                  <option value="live">Live</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="draft">Draft</option>
                  <option value="ended">Ended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            {/* Specs Quick Input */}
            <div className="grid gap-4 sm:grid-cols-4 border-t border-border pt-3">
              <label className="flex flex-col gap-1 text-xs font-bold">
                0-60 mph
                <input
                  value={spec0to60}
                  onChange={e => setSpec0to60(e.target.value)}
                  className="h-9 border border-border bg-background px-3 font-mono text-xs outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold">
                Top Speed
                <input
                  value={specTopSpeed}
                  onChange={e => setSpecTopSpeed(e.target.value)}
                  className="h-9 border border-border bg-background px-3 font-mono text-xs outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold">
                Range
                <input
                  value={specRange}
                  onChange={e => setSpecRange(e.target.value)}
                  className="h-9 border border-border bg-background px-3 font-mono text-xs outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold">
                VIN #
                <input
                  value={specVin}
                  onChange={e => setSpecVin(e.target.value)}
                  className="h-9 border border-border bg-background px-3 font-mono text-xs outline-none"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="border border-border px-5 py-2.5 font-mono text-xs hover:border-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary px-6 py-2.5 font-mono text-xs font-bold uppercase text-primary-foreground hover:brightness-110 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingAuction ? 'Update Auction Lot' : 'Publish Auction Lot'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* House Bid Modal */}
      {houseBidAuction && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
          <form onSubmit={handleHouseBid} className="w-full max-w-md border border-border bg-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="font-mono text-xs uppercase text-primary">Official Floor Bid</p>
                <h3 className="text-lg font-bold">Place House Bid</h3>
              </div>
              <button type="button" onClick={() => setHouseBidAuction(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <p className="text-xs text-muted-foreground">
              Lot: <strong className="text-foreground">{houseBidAuction.title}</strong>
              <br />
              Current Bid: <strong className="text-foreground">{fmt(Number(houseBidAuction.current_bid))}</strong>
            </p>

            <label className="flex flex-col gap-1 text-xs font-bold">
              House Bid Amount ($)
              <input
                type="number"
                value={houseBidAmount}
                onChange={e => setHouseBidAmount(e.target.value)}
                min={houseBidAuction.current_bid + 1}
                required
                className="h-11 border border-border bg-background px-3 font-mono text-sm outline-none focus:border-primary"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setHouseBidAuction(null)}
                className="border border-border px-4 py-2 font-mono text-xs hover:border-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary px-5 py-2 font-mono text-xs font-bold uppercase text-primary-foreground hover:brightness-110"
              >
                Submit House Bid
              </button>
            </div>
          </form>
        </div>
      )}
    </PlatformShell>
  )
}
