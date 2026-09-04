'use client'

import { Check, ShieldCheck, Crown, Star } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import type { VipTierData } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

const tierIcons: Record<string, React.ReactNode> = {
  Standard: <ShieldCheck size={28} />,
  VIP: <Star size={28} />,
  Platinum: <Crown size={28} />,
}

export function VipClient({ tiers, currentTier, expiresAt }: { tiers: VipTierData[]; currentTier: string; expiresAt: string | null }) {
  return (
    <PlatformShell>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">The inner circle</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">VIP Membership</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Unlock priority access, exclusive drops, and elevated benefits.
        </p>
      </div>

      {/* Current Status */}
      <div className="my-8 border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center bg-primary text-primary-foreground">
            {tierIcons[currentTier.charAt(0).toUpperCase() + currentTier.slice(1)] || <ShieldCheck size={20} />}
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Current membership</p>
            <p className="mt-1 text-lg font-bold capitalize">{currentTier}</p>
            {expiresAt && <p className="text-xs text-muted-foreground">Valid until {new Date(expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
          </div>
        </div>
      </div>

      {/* Tiers */}
      <div className="grid gap-5 md:grid-cols-3">
        {tiers.map(tier => {
          const isCurrent = tier.name.toLowerCase() === currentTier
          const benefits = Array.isArray(tier.benefits) ? tier.benefits : []
          return (
            <div key={tier.id} className={`flex flex-col border bg-card p-6 ${isCurrent ? 'border-primary' : 'border-border'}`}>
              <div className="flex items-center gap-3">
                <div className={`grid size-10 place-items-center ${isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {tierIcons[tier.name] || <ShieldCheck size={20} />}
                </div>
                {isCurrent && <span className="bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">CURRENT</span>}
              </div>
              <h3 className="mt-6 text-xl font-bold">{tier.name}</h3>
              <p className="mt-2 text-3xl font-bold">
                {Number(tier.price) === 0 ? 'Free' : `${fmt(Number(tier.price))}`}
                {Number(tier.price) > 0 && <span className="text-sm font-normal text-muted-foreground">/year</span>}
              </p>
              <div className="mt-6 flex-1 border-t border-border pt-6">
                {benefits.map((b, i) => (
                  <div key={i} className="mt-3 flex items-start gap-2 text-sm first:mt-0">
                    <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              {!isCurrent && Number(tier.price) > 0 && (
                <button className="mt-6 h-12 w-full bg-primary text-sm font-bold text-primary-foreground">
                  Upgrade to {tier.name}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </PlatformShell>
  )
}
