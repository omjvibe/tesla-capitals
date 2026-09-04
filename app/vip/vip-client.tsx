'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ShieldCheck, Crown, Star, Zap, Award, Wallet } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import type { VipTierData, Profile } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

const default5Tiers: Partial<VipTierData>[] = [
  {
    name: 'Standard',
    price: 0,
    discount_percent: 0,
    benefits: ['Standard access to public markets', 'Basic portfolio tracking', 'Community support'],
  },
  {
    name: 'Bronze',
    price: 122,
    discount_percent: 5,
    benefits: ['5% off all investments & inventory', 'Priority trade execution', 'Monthly market digest'],
  },
  {
    name: 'Silver',
    price: 499,
    discount_percent: 10,
    benefits: ['10% off all investments & inventory', 'Direct analyst chat', 'Early giveaway entries'],
  },
  {
    name: 'Gold',
    price: 1499,
    discount_percent: 18,
    benefits: ['18% off all investments & inventory', 'Exclusive private deal flow', 'Dedicated wealth manager'],
  },
  {
    name: 'Platinum',
    price: 5000,
    discount_percent: 25,
    benefits: ['25% off all investments & inventory', '0% trading fee surcharge', 'Annual Tesla executive retreat invite', '24/7 Apex support'],
  },
]

const tierIcons: Record<string, React.ReactNode> = {
  Standard: <ShieldCheck size={24} />,
  Bronze: <Zap size={24} />,
  Silver: <Star size={24} />,
  Gold: <Award size={24} />,
  Platinum: <Crown size={24} />,
}

export function VipClient({ tiers: dbTiers, profile }: { tiers: VipTierData[]; profile: Profile }) {
  const router = useRouter()
  const { toast } = useToast()
  const [upgrading, setUpgrading] = useState<string | null>(null)

  const currentTier = (profile.vip_tier || 'standard').toLowerCase()
  const userBalance = Number(profile.wallet_balance || 0)

  // Merge DB tiers or fallback to 5 tiers
  const activeTiers = dbTiers.length >= 5 ? dbTiers : (default5Tiers as VipTierData[])

  const handleUpgrade = async (tierName: string, price: number) => {
    if (price > userBalance) {
      toast('Insufficient Balance', `Upgrade costs ${fmt(price)}, but you have ${fmt(userBalance)} in available cash. Deposit funds first.`, 'error')
      return
    }

    setUpgrading(tierName)
    const supabase = createClient()

    // 1. Deduct wallet balance
    const newBal = userBalance - price
    await supabase.from('profiles').update({
      wallet_balance: newBal,
      vip_tier: tierName.toLowerCase() as any,
      vip_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).eq('id', profile.id)

    // 2. Log transaction
    await supabase.from('transactions').insert({
      user_id: profile.id,
      type: 'vip_payment',
      amount: -price,
      description: `Upgraded to ${tierName} VIP Membership`,
    })

    toast('Membership Upgraded!', `Congratulations! You are now a ${tierName} tier member.`)
    setUpgrading(null)
    router.refresh()
  }

  return (
    <PlatformShell>
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">The inner circle</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">VIP Membership</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Unlock percentage discounts on investments & store inventory, priority deal access, and executive perks.
          </p>
        </div>
        <div className="flex items-center gap-2 border border-border bg-card px-4 py-3 font-mono text-xs">
          <Wallet size={16} className="text-primary" /> Available Cash: <span className="font-bold">{fmt(userBalance)}</span>
        </div>
      </div>

      {/* Current Status */}
      <div className="my-8 border border-primary/30 bg-primary/5 p-6">
        <div className="flex items-center gap-4">
          <div className="grid size-12 place-items-center bg-primary text-primary-foreground">
            {tierIcons[currentTier.charAt(0).toUpperCase() + currentTier.slice(1)] || <ShieldCheck size={24} />}
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Your active membership</p>
            <p className="mt-1 text-2xl font-bold capitalize">{currentTier} Tier</p>
            {profile.vip_expires_at && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Active through {new Date(profile.vip_expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 5 Tiers Grid */}
      <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
        {activeTiers.map(t => {
          const isCurrent = t.name.toLowerCase() === currentTier
          const benefits = Array.isArray(t.benefits) ? t.benefits : []
          return (
            <div
              key={t.name}
              className={`flex flex-col border bg-card p-5 transition-all ${
                isCurrent ? 'border-primary shadow-xl ring-1 ring-primary' : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`grid size-9 place-items-center ${isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {tierIcons[t.name] || <ShieldCheck size={18} />}
                </div>
                {isCurrent && <span className="bg-primary px-2 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">Active</span>}
              </div>

              <h3 className="mt-4 text-lg font-bold">{t.name}</h3>
              <p className="mt-2 text-2xl font-bold">
                {Number(t.price) === 0 ? 'Free' : `${fmt(Number(t.price))}`}
                {Number(t.price) > 0 && <span className="text-[11px] font-normal text-muted-foreground">/mo</span>}
              </p>

              {Number(t.discount_percent || 0) > 0 && (
                <div className="mt-3 border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-center font-mono text-[10px] font-bold text-green-500">
                  {t.discount_percent}% OFF ALL DEALS
                </div>
              )}

              <div className="mt-5 flex-1 border-t border-border pt-4">
                {benefits.map((b, i) => (
                  <div key={i} className="mt-2.5 flex items-start gap-2 text-xs text-muted-foreground first:mt-0">
                    <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {!isCurrent && (
                <button
                  onClick={() => handleUpgrade(t.name, Number(t.price))}
                  disabled={upgrading === t.name}
                  className="mt-6 h-11 w-full bg-primary text-xs font-bold text-primary-foreground transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {upgrading === t.name ? 'Processing...' : Number(t.price) === 0 ? 'Switch' : `Upgrade (${fmt(Number(t.price))})`}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </PlatformShell>
  )
}
