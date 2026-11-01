'use client'

import Link from 'next/link'
import { Crown, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

interface Props {
  title?: string
  description?: string
  returnUrl?: string
}

export function VipLockedCard({
  title = 'Tesla Roadster SpaceX — Premium VIP Allocation',
  description = 'Access to the next-generation flying Tesla Roadster deal (including private propulsion syndicates, Chassis #001 auction, and vehicle allocation) is exclusively reserved for Premium VIP members ($2,000+ / Platinum). Upgrade your membership to unlock access and enjoy an automatic 15% member discount.',
  returnUrl = '/vip',
}: Props) {
  return (
    <div className="mx-auto max-w-2xl py-12 px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-b from-card via-card to-background p-8 md:p-12 text-center shadow-2xl">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-72 rounded-full bg-primary/15 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="grid size-16 place-items-center rounded-2xl border border-primary/50 bg-primary/10 text-primary shadow-lg shadow-red-950/30">
            <Crown size={32} />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
            <Sparkles size={12} />
            <span>Premium VIP Exclusive • 15% Discount</span>
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            {title}
          </h2>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-md border-y border-border py-4 font-mono text-xs">
            <div className="border-r border-border pr-2">
              <p className="text-[10px] text-muted-foreground uppercase">Required Status</p>
              <p className="mt-1 font-bold text-foreground">Platinum / $2k+</p>
            </div>
            <div className="pl-2">
              <p className="text-[10px] text-muted-foreground uppercase">Included Privilege</p>
              <p className="mt-1 font-bold text-emerald-500">15% Flying Deal Discount</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/vip"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-mono text-xs font-bold text-primary-foreground shadow-lg shadow-red-950/40 hover:brightness-110 active:scale-95 transition-all"
            >
              <Zap size={15} />
              <span>Upgrade to Premium VIP</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href={returnUrl}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 font-mono text-xs font-bold text-foreground hover:border-primary active:scale-95 transition-all"
            >
              <span>Explore Other Opportunities</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
