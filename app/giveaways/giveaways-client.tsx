'use client'

import { useState } from 'react'
import { Gift, Clock } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
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
    <div className="border border-border bg-background p-3 text-center">
      <p className="text-2xl font-bold">{String(value).padStart(2, '0')}</p>
      <p className="font-mono text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}

interface Props {
  giveaways: Giveaway[]
  enteredIds: Set<string>
  userId: string
}

export function GiveawaysClient({ giveaways, enteredIds, userId }: Props) {
  const [entered, setEntered] = useState<Set<string>>(enteredIds)
  const [loading, setLoading] = useState<string | null>(null)

  const handleEnter = async (giveawayId: string) => {
    setLoading(giveawayId)
    const supabase = createClient()
    const { error } = await supabase.from('giveaway_entries').insert({
      giveaway_id: giveawayId,
      user_id: userId,
    })
    if (!error) {
      setEntered(prev => new Set([...prev, giveawayId]))
    }
    setLoading(null)
  }

  return (
    <PlatformShell>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Member rewards</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Giveaways</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Enter exclusive drops and experiences.</p>
      </div>

      {giveaways.length > 0 ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {giveaways.map(g => {
            const countdown = useCountdown(g.ends_at)
            const isEntered = entered.has(g.id)
            const isActive = g.status === 'active' && !countdown.expired
            return (
              <div key={g.id} className="border border-border bg-card p-6">
                <div className="flex items-start justify-between">
                  <div className="grid size-10 place-items-center bg-primary/10 text-primary"><Gift size={20} /></div>
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase ${isActive ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                    {isActive ? 'Active' : 'Ended'}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold">{g.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{g.description}</p>

                {isActive && (
                  <>
                    <div className="mt-6">
                      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <Clock size={12} /> Entry closes in
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        <CountdownBlock value={countdown.days} label="Days" />
                        <CountdownBlock value={countdown.hours} label="Hours" />
                        <CountdownBlock value={countdown.minutes} label="Mins" />
                        <CountdownBlock value={countdown.seconds} label="Secs" />
                      </div>
                    </div>
                    {isEntered ? (
                      <div className="mt-6 border border-primary/30 bg-primary/5 p-3 text-center text-sm font-bold text-primary">
                        You have entered this giveaway
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnter(g.id)}
                        disabled={loading === g.id}
                        className="mt-6 h-12 w-full bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50"
                      >
                        {loading === g.id ? 'Entering...' : 'Enter giveaway'}
                      </button>
                    )}
                  </>
                )}

                {g.winner_id && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">Winner has been selected</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-20 text-center">
          <Gift size={40} className="mx-auto text-muted-foreground" />
          <p className="mt-4 text-lg font-bold">No giveaways right now</p>
          <p className="mt-2 text-sm text-muted-foreground">Check back soon for new opportunities.</p>
        </div>
      )}
    </PlatformShell>
  )
}
