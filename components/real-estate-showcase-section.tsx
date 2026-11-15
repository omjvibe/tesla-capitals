'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Building2, MapPin, Percent, ShieldCheck, TrendingUp, Wallet, Zap } from 'lucide-react'

interface PropertyPreview {
  id: string
  title: string
  location: string
  type: string
  returnRate: string
  yieldRate: string
  minAmount: string
  imageUrl: string
}

const FEATURED_PROPERTIES: PropertyPreview[] = [
  {
    id: 'e1a10001-0000-0000-0000-000000000001',
    title: 'Tesla Gigafactory District Luxury Lofts',
    location: 'Austin, TX',
    type: 'Residential',
    returnRate: '14.2%',
    yieldRate: '9.4%',
    minAmount: '$500',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'e1a10001-0000-0000-0000-000000000002',
    title: 'Fremont Advanced Mobility Tech Center',
    location: 'Fremont, CA',
    type: 'Commercial',
    returnRate: '16.8%',
    yieldRate: '10.2%',
    minAmount: '$1,000',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'e1a10001-0000-0000-0000-000000000003',
    title: 'Nevada Gigawatt Solar & Lithium Reserve',
    location: 'Reno / Tahoe, NV',
    type: 'Renewable Land',
    returnRate: '18.5%',
    yieldRate: '7.8%',
    minAmount: '$750',
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
  },
]

export function RealEstateShowcaseSection() {
  return (
    <section className="border-b border-border bg-card/40 px-5 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-primary">
              <Building2 size={15} />
              <span>Asset-Backed Real Estate</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
              Fractional Clean-Tech Infrastructure.
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
              Co-own institutional-grade real estate assets powering the future of transportation and energy. 
              Earn monthly rental distributions backed by long-term corporate leases and capital appreciation.
            </p>
          </div>

          <Link
            href="/real-estate"
            className="inline-flex items-center gap-2 self-start md:self-auto border border-border bg-background px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-foreground transition-all hover:border-primary hover:text-primary active:scale-95"
          >
            <span>Explore All Properties</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* 3 Core Minimalist Pillars */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3 border-y border-border py-8">
          <div className="flex flex-col gap-2 p-2">
            <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider font-bold">
              <Zap size={14} />
              <span>Fractional From $500</span>
            </div>
            <p className="text-sm font-bold text-foreground">Democratized Institutional Access</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No multi-million dollar capital requirements. Own equity shares in premier industrial campuses and tech lofts with complete liquidity.
            </p>
          </div>

          <div className="flex flex-col gap-2 p-2 border-t sm:border-t-0 sm:border-l border-border sm:pl-6">
            <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs uppercase tracking-wider font-bold">
              <Percent size={14} />
              <span>8% – 18% Projected ARR</span>
            </div>
            <p className="text-sm font-bold text-foreground">Direct Monthly Rental Cashflow</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Earn regular distributions paid automatically into your digital wallet, plus participate in property value appreciation.
            </p>
          </div>

          <div className="flex flex-col gap-2 p-2 border-t sm:border-t-0 sm:border-l border-border sm:pl-6">
            <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider font-bold">
              <ShieldCheck size={14} />
              <span>100% Asset-Backed</span>
            </div>
            <p className="text-sm font-bold text-foreground">Tangible Physical Collateral</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every fractional share is tied to recorded title deeds, backed by triple-net (NNN) commercial and residential covenants.
            </p>
          </div>
        </div>

        {/* Property Preview Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FEATURED_PROPERTIES.map(prop => (
            <Link
              key={prop.id}
              href={`/real-estate/${prop.id}`}
              className="group flex flex-col justify-between border border-border bg-card transition-all duration-300 hover:border-primary/60 hover:shadow-lg"
            >
              <div>
                {/* Photo */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    src={prop.imageUrl}
                    alt={prop.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute left-3 top-3 rounded bg-black/75 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur">
                    {prop.type}
                  </span>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 font-mono text-xs text-white drop-shadow">
                    <MapPin size={12} className="text-primary" />
                    <span>{prop.location}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {prop.title}
                  </h3>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-3">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Target ARR</p>
                      <p className="mt-0.5 text-sm font-bold text-emerald-500">{prop.returnRate}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Rental Yield</p>
                      <p className="mt-0.5 text-sm font-bold text-primary">{prop.yieldRate}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Min Entry</p>
                      <p className="mt-0.5 text-sm font-bold text-foreground">{prop.minAmount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t border-border px-5 py-3 flex items-center justify-between text-xs font-bold text-muted-foreground group-hover:text-foreground">
                <span className="font-mono text-[10px] uppercase tracking-wider">View Asset & Invest</span>
                <ArrowUpRight size={14} className="text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-border bg-background p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center bg-primary/10 text-primary">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Ready to allocate into institutional real estate?</p>
              <p className="text-xs text-muted-foreground">Browse current openings or deposit funds to secure your fractional shares.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/real-estate"
              className="bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

