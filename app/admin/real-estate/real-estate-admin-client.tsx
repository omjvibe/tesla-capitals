'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Users,
  Search,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Maximize2
} from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { useToast } from '@/components/ui/toast'
import type { RealEstateProperty, RealEstateInvestment, RealEstatePropertyType, RealEstateStatus } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtDec(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

interface AdminRealEstateClientProps {
  initialProperties: RealEstateProperty[]
  initialInvestments: RealEstateInvestment[]
}

export function AdminRealEstateClient({ initialProperties, initialInvestments }: AdminRealEstateClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [properties, setProperties] = useState<RealEstateProperty[]>(initialProperties)
  const [investments, setInvestments] = useState<RealEstateInvestment[]>(initialInvestments)

  // Filter / Search states
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | RealEstateStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | RealEstatePropertyType>('all')

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProp, setEditingProp] = useState<RealEstateProperty | null>(null)
  const [investorModalProp, setInvestorModalProp] = useState<RealEstateProperty | null>(null)
  const [deletingProp, setDeletingProp] = useState<RealEstateProperty | null>(null)
  const [loading, setLoading] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'residential' as RealEstatePropertyType,
    location: '',
    city: '',
    country: 'USA',
    total_value: '1000000',
    min_investment: '500',
    total_shares: '2000',
    projected_annual_return: '12.5',
    rental_yield: '8.0',
    occupancy_rate: '100',
    size_sqft: '',
    bedrooms: '',
    bathrooms: '',
    image_url: '',
    amenities: '',
    risk_level: 'moderate' as 'low' | 'moderate' | 'high',
    holding_period_months: '36',
    status: 'active' as RealEstateStatus
  })

  // KPIs
  const totalValue = properties.reduce((acc, p) => acc + Number(p.total_value || 0), 0)
  const activeCount = properties.filter(p => p.status === 'active').length
  const totalCapitalRaised = investments.reduce((acc, inv) => acc + Number(inv.amount_invested || 0), 0)
  const uniqueInvestors = new Set(investments.map(i => i.user_id)).size

  // Filtered properties
  const filteredProperties = properties.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesType = typeFilter === 'all' || p.property_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const openCreate = () => {
    setFormData({
      title: '',
      description: '',
      property_type: 'residential',
      location: '',
      city: '',
      country: 'USA',
      total_value: '2500000',
      min_investment: '500',
      total_shares: '5000',
      projected_annual_return: '14.0',
      rental_yield: '8.5',
      occupancy_rate: '100',
      size_sqft: '32000',
      bedrooms: '12',
      bathrooms: '14',
      image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      amenities: 'Tesla Solar Roof, Megapack Backup, 8x V4 Superchargers, Biometric Entry',
      risk_level: 'low',
      holding_period_months: '36',
      status: 'active'
    })
    setShowCreateModal(true)
  }

  const openEdit = (p: RealEstateProperty) => {
    setEditingProp(p)
    setFormData({
      title: p.title,
      description: p.description || '',
      property_type: p.property_type,
      location: p.location,
      city: p.city,
      country: p.country,
      total_value: String(p.total_value),
      min_investment: String(p.min_investment),
      total_shares: String(p.total_shares),
      projected_annual_return: String(p.projected_annual_return || 12),
      rental_yield: String(p.rental_yield || 8),
      occupancy_rate: String(p.occupancy_rate || 100),
      size_sqft: p.size_sqft ? String(p.size_sqft) : '',
      bedrooms: p.bedrooms ? String(p.bedrooms) : '',
      bathrooms: p.bathrooms ? String(p.bathrooms) : '',
      image_url: p.image_url || '',
      amenities: Array.isArray(p.amenities) ? p.amenities.join(', ') : '',
      risk_level: p.risk_level,
      holding_period_months: String(p.holding_period_months || 24),
      status: p.status
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const amenitiesArray = formData.amenities
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const payload = {
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type,
        location: formData.location,
        city: formData.city,
        country: formData.country,
        total_value: formData.total_value,
        min_investment: formData.min_investment,
        total_shares: formData.total_shares,
        projected_annual_return: formData.projected_annual_return,
        rental_yield: formData.rental_yield,
        occupancy_rate: formData.occupancy_rate,
        size_sqft: formData.size_sqft || null,
        bedrooms: formData.bedrooms || null,
        bathrooms: formData.bathrooms || null,
        image_url: formData.image_url,
        amenities: amenitiesArray,
        risk_level: formData.risk_level,
        holding_period_months: formData.holding_period_months,
        status: formData.status
      }

      if (editingProp) {
        const res = await fetch('/api/admin/real-estate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update', payload: { id: editingProp.id, ...payload } })
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)

        setProperties(prev => prev.map(item => (item.id === data.property.id ? data.property : item)))
        toast('Property Updated', `Successfully updated ${data.property.title}.`)
        setEditingProp(null)
      } else {
        const res = await fetch('/api/admin/real-estate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', payload })
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)

        setProperties(prev => [data.property, ...prev])
        toast('Property Listed', `Added ${data.property.title} to real estate catalog.`)
        setShowCreateModal(false)
      }
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed'
      toast('Error', msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingProp) return
    setLoading(true)

    try {
      const res = await fetch('/api/admin/real-estate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', payload: { id: deletingProp.id } })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setProperties(prev => prev.filter(p => p.id !== deletingProp.id))
      toast('Property Removed', `Successfully deleted ${deletingProp.title}.`)
      setDeletingProp(null)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed'
      toast('Error', msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (prop: RealEstateProperty, newStatus: RealEstateStatus) => {
    try {
      const res = await fetch('/api/admin/real-estate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_status', payload: { id: prop.id, status: newStatus } })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setProperties(prev => prev.map(p => (p.id === prop.id ? data.property : p)))
      toast('Status Changed', `${prop.title} is now ${newStatus}.`)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed'
      toast('Error', msg, 'error')
    }
  }

  // Investors for modal
  const propertyInvestors = investorModalProp
    ? investments.filter(inv => inv.property_id === investorModalProp.id)
    : []

  return (
    <PlatformShell admin>
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-primary">
            <Building2 size={15} />
            <span>Syndication & Asset Management</span>
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Real Estate ({properties.length})</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage fractionalized industrial campuses, executive lofts, clean energy parcels, and commercial hubs.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow transition hover:opacity-90 active:scale-95"
        >
          <Plus size={16} /> New Asset Listing
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="font-mono text-[10px] uppercase tracking-widest">Total Asset Valuation</p>
            <DollarSign size={16} className="text-primary" />
          </div>
          <p className="mt-3 text-2xl font-bold">{fmt(totalValue)}</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">Sum of listed real estate assets</p>
        </div>

        <div className="border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="font-mono text-[10px] uppercase tracking-widest">Capital Syndicated</p>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-500">{fmt(totalCapitalRaised)}</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">Fractional shares purchased</p>
        </div>

        <div className="border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="font-mono text-[10px] uppercase tracking-widest">Active Listings</p>
            <Building2 size={16} className="text-blue-500" />
          </div>
          <p className="mt-3 text-2xl font-bold">{activeCount} / {properties.length}</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">Open for investor participation</p>
        </div>

        <div className="border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="font-mono text-[10px] uppercase tracking-widest">Fractional Investors</p>
            <Users size={16} className="text-yellow-500" />
          </div>
          <p className="mt-3 text-2xl font-bold">{uniqueInvestors}</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">{investments.length} total position allocations</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by property title, city, or address..."
            className="h-10 w-full border border-border bg-background pl-10 pr-4 text-xs outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex border border-border bg-background p-0.5">
            {(['all', 'active', 'funded', 'draft', 'archived'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase transition-colors ${
                  statusFilter === st ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Property Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="h-9 border border-border bg-background px-3 font-mono text-xs uppercase text-muted-foreground outline-none focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="land">Land</option>
          </select>
        </div>
      </div>

      {/* Properties Catalog */}
      <div className="mt-6 space-y-4">
        {filteredProperties.length === 0 ? (
          <div className="border border-border bg-card p-12 text-center">
            <Building2 className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-bold">No real estate properties found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or click New Asset Listing.</p>
          </div>
        ) : (
          filteredProperties.map(prop => {
            const propInvestments = investments.filter(i => i.property_id === prop.id)
            const allocatedShares = prop.total_shares - prop.available_shares
            const fundingPercent = Math.min(100, Math.round((allocatedShares / prop.total_shares) * 100))

            return (
              <div
                key={prop.id}
                className="group flex flex-col gap-5 border border-border bg-card p-5 transition-all hover:border-primary/50 lg:flex-row lg:items-center lg:justify-between"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative h-28 w-full shrink-0 overflow-hidden border border-border bg-muted sm:w-40">
                    {prop.image_url ? (
                      <Image
                        src={prop.image_url}
                        alt={prop.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted-foreground">
                        NO IMAGE
                      </div>
                    )}
                    <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white">
                      {prop.property_type}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">{prop.title}</h3>
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                          prop.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : prop.status === 'funded'
                            ? 'bg-blue-500/10 text-blue-500'
                            : prop.status === 'draft'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {prop.status}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      <MapPin size={13} className="text-primary" />
                      <span>{prop.location}, {prop.city}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                      <div>
                        <span className="font-mono text-[10px] uppercase text-muted-foreground">Valuation: </span>
                        <span className="font-bold">{fmt(Number(prop.total_value))}</span>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase text-muted-foreground">Share Price: </span>
                        <span className="font-bold">{fmtDec(Number(prop.price_per_share))}</span>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase text-muted-foreground">Est. ARR: </span>
                        <span className="font-bold text-emerald-500">{prop.projected_annual_return}%</span>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] uppercase text-muted-foreground">Yield: </span>
                        <span className="font-bold text-primary">{prop.rental_yield}%</span>
                      </div>
                    </div>

                    {/* Funding Progress Bar */}
                    <div className="mt-3 max-w-md">
                      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                        <span>Funded: {fundingPercent}%</span>
                        <span>{prop.available_shares.toLocaleString()} / {prop.total_shares.toLocaleString()} shares open</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${fundingPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
                  {/* View Investors Button */}
                  <button
                    onClick={() => setInvestorModalProp(prop)}
                    className="flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:border-primary hover:text-foreground"
                    title="View fractional investors"
                  >
                    <Users size={14} />
                    <span>Investors ({propInvestments.length})</span>
                  </button>

                  {/* Public Link */}
                  <a
                    href={`/real-estate/${prop.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 border border-border p-2 text-muted-foreground hover:border-primary hover:text-foreground"
                    title="Preview public property page"
                  >
                    <ExternalLink size={14} />
                  </a>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEdit(prop)}
                    className="flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-bold hover:border-primary"
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>

                  {/* Status Toggle Dropdown */}
                  <select
                    value={prop.status}
                    onChange={e => handleToggleStatus(prop, e.target.value as RealEstateStatus)}
                    className="h-8 border border-border bg-background px-2 font-mono text-[10px] font-bold uppercase outline-none focus:border-primary"
                  >
                    <option value="active">Active</option>
                    <option value="funded">Funded</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeletingProp(prop)}
                    className="border border-border p-2 text-muted-foreground hover:border-destructive hover:text-destructive"
                    title="Delete property"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {(showCreateModal || editingProp) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {editingProp ? 'Update Asset Specs' : 'Syndication Intake'}
                </p>
                <h2 className="text-xl font-bold">
                  {editingProp ? `Edit: ${editingProp.title}` : 'Add New Real Estate Property'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingProp(null)
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-4">
              {/* Row 1: Title & Type */}
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1 text-xs font-bold sm:col-span-2">
                  Property Title *
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g. Austin Gigafactory Lofts"
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Property Type *
                  <select
                    value={formData.property_type}
                    onChange={e => setFormData({ ...formData, property_type: e.target.value as any })}
                    className="h-10 border border-border bg-background px-3 font-mono text-xs uppercase outline-none focus:border-primary"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="land">Land</option>
                  </select>
                </label>
              </div>

              {/* Row 2: Location & City & Country */}
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Address / Location *
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    required
                    placeholder="13101 Harold Green Rd"
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold">
                  City / State *
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    required
                    placeholder="Austin, TX"
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Country
                  <input
                    type="text"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
              </div>

              {/* Row 3: Financials */}
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Total Valuation ($) *
                  <input
                    type="number"
                    step="1000"
                    value={formData.total_value}
                    onChange={e => setFormData({ ...formData, total_value: e.target.value })}
                    required
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Total Fractional Shares *
                  <input
                    type="number"
                    value={formData.total_shares}
                    onChange={e => setFormData({ ...formData, total_shares: e.target.value })}
                    required
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Minimum Investment ($) *
                  <input
                    type="number"
                    value={formData.min_investment}
                    onChange={e => setFormData({ ...formData, min_investment: e.target.value })}
                    required
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
              </div>

              {/* Row 4: Returns & Risk */}
              <div className="grid gap-4 sm:grid-cols-4">
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Projected Return (%/yr)
                  <input
                    type="number"
                    step="0.1"
                    value={formData.projected_annual_return}
                    onChange={e => setFormData({ ...formData, projected_annual_return: e.target.value })}
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Rental Yield (%/yr)
                  <input
                    type="number"
                    step="0.1"
                    value={formData.rental_yield}
                    onChange={e => setFormData({ ...formData, rental_yield: e.target.value })}
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Occupancy Rate (%)
                  <input
                    type="number"
                    step="0.1"
                    value={formData.occupancy_rate}
                    onChange={e => setFormData({ ...formData, occupancy_rate: e.target.value })}
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Risk Level
                  <select
                    value={formData.risk_level}
                    onChange={e => setFormData({ ...formData, risk_level: e.target.value as any })}
                    className="h-10 border border-border bg-background px-3 font-mono text-xs uppercase outline-none focus:border-primary"
                  >
                    <option value="low">Low Risk</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High Risk</option>
                  </select>
                </label>
              </div>

              {/* Row 5: Specs & Hold Period */}
              <div className="grid gap-4 sm:grid-cols-4">
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Size (Sq. Ft)
                  <input
                    type="number"
                    value={formData.size_sqft}
                    onChange={e => setFormData({ ...formData, size_sqft: e.target.value })}
                    placeholder="42000"
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Bedrooms
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={e => setFormData({ ...formData, bedrooms: e.target.value })}
                    placeholder="24"
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Bathrooms
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={e => setFormData({ ...formData, bathrooms: e.target.value })}
                    placeholder="28"
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Holding Period (Mo)
                  <input
                    type="number"
                    value={formData.holding_period_months}
                    onChange={e => setFormData({ ...formData, holding_period_months: e.target.value })}
                    placeholder="36"
                    className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </label>
              </div>

              {/* Row 6: Image URL */}
              <label className="flex flex-col gap-1 text-xs font-bold">
                Hero Image URL
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                />
              </label>

              {/* Row 7: Amenities */}
              <label className="flex flex-col gap-1 text-xs font-bold">
                Key Amenities (comma separated)
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={e => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Tesla Solar Roof, Megapack Storage, Superchargers, 24/7 Security"
                  className="h-10 border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                />
              </label>

              {/* Row 8: Description */}
              <label className="flex flex-col gap-1 text-xs font-bold">
                Property Description & Investment Thesis
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the asset, master zoning, tenant roster, and long-term capital appreciation strategy..."
                  className="border border-border bg-background p-3 text-xs outline-none focus:border-primary"
                />
              </label>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingProp(null)
                  }}
                  className="border border-border px-5 py-2.5 text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingProp ? 'Save Changes' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW INVESTORS MODAL */}
      {investorModalProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Cap Table Allocation</p>
                <h2 className="text-xl font-bold">{investorModalProp.title}</h2>
              </div>
              <button onClick={() => setInvestorModalProp(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="mt-4">
              {propertyInvestors.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p className="text-sm">No fractional investors yet for this property.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-border pb-2 font-mono text-[10px] uppercase text-muted-foreground">
                    <span>Investor</span>
                    <span>Shares / Amount</span>
                  </div>
                  {propertyInvestors.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between border-b border-border py-2 text-xs">
                      <div>
                        <p className="font-bold">{inv.user?.full_name || inv.user?.email || 'Anonymous Investor'}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{inv.user?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{inv.shares} shares ({fmt(Number(inv.amount_invested))})</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {new Date(inv.invested_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setInvestorModalProp(null)}
                className="bg-primary px-5 py-2 text-xs font-bold text-primary-foreground"
              >
                Close Cap Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-destructive/50 bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold">Delete Real Estate Listing</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Are you sure you want to permanently remove <strong className="text-foreground">{deletingProp.title}</strong>?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeletingProp(null)}
                className="border border-border px-4 py-2 text-xs font-bold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-destructive px-5 py-2 text-xs font-bold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PlatformShell>
  )
}

