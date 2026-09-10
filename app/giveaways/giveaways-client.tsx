'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Gift,
  Clock,
  CheckCircle2,
  DollarSign,
  Users,
  Trophy,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Wallet
} from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { useToast } from '@/components/ui/toast'
import type { Giveaway } from '@/types'

function useCountdown(endDate: string) {
  const diff = Math.max(0, new Date(endDate).getTime() - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds, expired: diff === 0 }
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="border border-border bg-background/80 p-3 text-center backdrop-blur-sm">
      <p className="text-xl font-bold font-mono text-foreground">{String(value).padStart(2, '0')}</p>
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  )
}

interface GiveawayWithMeta extends Giveaway {
  entry_count?: number
}

interface UserProfile {
  id: string
  wallet_balance: number
  vip_tier: string
}

interface Props {
  giveaways: GiveawayWithMeta[]
  enteredIds: string[]
  userId: string
  userProfile: UserProfile
}

export function GiveawaysClient({ giveaways, enteredIds: initialEntered, userId, userProfile }: Props) {
  const [entered, setEntered] = useState<Set<string>>(new Set(initialEntered))
  const [loading, setLoading] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(Number(userProfile.wallet_balance || 0))
  const { toast } = useToast()

  const handleEnter = async (giveaway: GiveawayWithMeta) => {
    const fee = Number(giveaway.entry_fee || 0)

    // Quick client-side checks
    if (fee > 0 && balance < fee) {
      toast(
        'Insufficient Balance',
        `Entry fee is $${fee.toFixed(2)}. Your current balance is $${balance.toFixed(2)}. Please deposit funds first.`,
        'error'
      )
      return
    }

    if (
      giveaway.eligible_tiers &&
      giveaway.eligible_tiers.length > 0 &&
      !giveaway.eligible_tiers.includes(userProfile.vip_tier)
    ) {
      toast(
        'Tier Restriction',
        `This drop is exclusively reserved for ${giveaway.eligible_tiers.join(', ').toUpperCase()} members.`,
        'error'
      )
      return
    }

    setLoading(giveaway.id)
    try {
      const res = await fetch('/api/giveaways/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giveaway_id: giveaway.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast('Entry Failed', data.error || 'Unable to register entry', 'error')
      } else {
        setEntered(prev => new Set([...prev, giveaway.id]))
        if (data.fee_charged > 0) {
          setBalance(prev => Math.max(0, prev - data.fee_charged))
        }
        toast('Entry Confirmed! 🚀', data.message || `You are now entered into "${giveaway.title}".`)
      }
    } catch (err: any) {
      toast('Error', err.message || 'Something went wrong', 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <PlatformShell>
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Member Privileges</span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Exclusive Access</span>
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Giveaways & Drops</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Exclusive Tesla allocations, Cyberquad drops, and verified member giveaways. Enter free drawings or join high-stake fee-pools.
          </p>
        </div>

        {/* User Balance & Tier Badge */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 font-mono text-xs">
          <div className="flex items-center gap-2 border-r border-border pr-3">
            <Wallet size={16} className="text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Available Balance</p>
              <p className="text-sm font-bold text-foreground">${balance.toFixed(2)}</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">VIP Tier</p>
            <p className="text-sm font-bold text-primary uppercase">{userProfile.vip_tier || 'BRONZE'}</p>
          </div>
        </div>
      </div>

      {/* Giveaways Grid */}
      {giveaways.length > 0 ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {giveaways.map(g => {
            const countdown = useCountdown(g.ends_at)
            const isEntered = entered.has(g.id)
            const isActive = g.status === 'active' && !countdown.expired
            const fee = Number(g.entry_fee || 0)
            const isFree = fee === 0
            const isCapped = Boolean(g.max_entries)
            const isFull = isCapped && (g.entry_count || 0) >= (g.max_entries || 0)
            const tierRestricted =
              g.eligible_tiers &&
              g.eligible_tiers.length > 0 &&
              !g.eligible_tiers.includes(userProfile.vip_tier)

            return (
              <div
                key={g.id}
                className="group relative flex flex-col justify-between border border-border bg-card p-7 transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5"
              >
                <div>
                  {/* Top Bar: Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="grid size-9 place-items-center rounded bg-primary/10 text-primary">
                        <Gift size={18} />
                      </div>
                      {isFree ? (
                        <span className="rounded bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-500">
                          FREE ENTRY
                        </span>
                      ) : (
                        <span className="rounded bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-500">
                          ${fee.toFixed(2)} ENTRY FEE
                        </span>
                      )}
                    </div>

                    <span
                      className={`rounded px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isActive ? '● Live Entry' : 'Ended'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-5">
                    <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {g.title}
                    </h3>
                    {g.prize_description && (
                      <p className="mt-1 font-mono text-xs text-primary font-medium flex items-center gap-1.5">
                        <Sparkles size={13} /> {g.prize_description}
                      </p>
                    )}
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {g.description || 'Exclusive member giveaway opportunity verified on the platform.'}
                    </p>
                  </div>

                  {/* Highlights Bar */}
                  <div className="mt-5 flex flex-wrap items-center gap-4 rounded border border-border/60 bg-background/50 p-3 font-mono text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} className="text-primary" />
                      <strong className="text-foreground">{g.entry_count ?? 0}</strong>
                      {g.max_entries ? ` / ${g.max_entries} max` : ' entered'}
                    </span>

                    {g.prize_value && (
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Trophy size={14} /> ${Number(g.prize_value).toLocaleString()} Prize
                      </span>
                    )}

                    {g.eligible_tiers && g.eligible_tiers.length > 0 && (
                      <span className="flex items-center gap-1.5 text-blue-400 uppercase text-[11px]">
                        <ShieldCheck size={14} /> {g.eligible_tiers.join(', ')} only
                      </span>
                    )}
                  </div>

                  {/* Countdown Timer */}
                  {isActive && (
                    <div className="mt-6">
                      <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <Clock size={12} /> Entry Closes In
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        <CountdownBlock value={countdown.days} label="Days" />
                        <CountdownBlock value={countdown.hours} label="Hours" />
                        <CountdownBlock value={countdown.minutes} label="Mins" />
                        <CountdownBlock value={countdown.seconds} label="Secs" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Entry Action / Status */}
                <div className="mt-7 pt-4 border-t border-border/60">
                  {isEntered ? (
                    <div className="flex items-center justify-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm font-bold text-emerald-400">
                      <CheckCircle2 size={18} /> You are entered in this giveaway!
                    </div>
                  ) : !isActive ? (
                    <div className="rounded border border-border bg-muted/40 p-3 text-center text-xs font-mono text-muted-foreground">
                      {g.winner_id ? 'Winner Announced' : 'Giveaway Concluded'}
                    </div>
                  ) : isFull ? (
                    <div className="rounded border border-amber-500/30 bg-amber-500/10 p-3 text-center text-xs font-bold text-amber-400">
                      Maximum entry capacity reached ({g.max_entries})
                    </div>
                  ) : tierRestricted ? (
                    <div className="rounded border border-border bg-background p-3 text-center text-xs text-muted-foreground">
                      Upgrade to{' '}
                      <strong className="text-primary uppercase">
                        {g.eligible_tiers?.join(', ')}
                      </strong>{' '}
                      to participate.
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnter(g)}
                      disabled={loading === g.id}
                      className="group/btn relative flex h-12 w-full items-center justify-center gap-2 rounded bg-primary font-bold text-sm text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      {loading === g.id ? (
                        <span>Registering Entry...</span>
                      ) : isFree ? (
                        <span>Enter Giveaway (Free)</span>
                      ) : (
                        <span>
                          Enter Giveaway · ${fee.toFixed(2)} USD
                        </span>
                      )}
                    </button>
                  )}

                  {g.winner_id && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 font-mono text-xs text-emerald-400">
                      <Trophy size={14} /> Winner Verified · ID: {g.winner_id.slice(0, 8)}...
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-24 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-card border border-border text-muted-foreground">
            <Gift size={32} />
          </div>
          <h3 className="mt-4 text-xl font-bold">No active giveaways at this moment</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            New allocations and rewards drops are announced periodically. Check back soon!
          </p>
        </div>
      )}
    </PlatformShell>
  )
}
