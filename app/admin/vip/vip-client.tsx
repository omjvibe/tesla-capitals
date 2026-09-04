'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import type { VipTierData } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export function AdminVipClient({ tiers: initial }: { tiers: VipTierData[] }) {
  const router = useRouter()
  const [tiers, setTiers] = useState(initial)

  const handleToggleActive = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('vip_tiers').update({ is_active: !current }).eq('id', id)
    setTiers(prev => prev.map(t => t.id === id ? { ...t, is_active: !current } : t))
    router.refresh()
  }

  return (
    <PlatformShell admin>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Membership management</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">VIP Tiers ({tiers.length})</h1>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {tiers.map(t => (
          <div key={t.id} className="border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <p className="text-xl font-bold">{t.name}</p>
              <p className="mt-2 text-2xl font-bold">{Number(t.price) === 0 ? 'Free' : fmt(Number(t.price))}</p>
              <div className="mt-4 space-y-1 text-xs text-muted-foreground border-t border-border pt-4">
                {(Array.isArray(t.benefits) ? t.benefits : []).map((b, i) => <p key={i}>• {b}</p>)}
              </div>
            </div>
            <button
              onClick={() => handleToggleActive(t.id, t.is_active)}
              className={`mt-6 h-10 w-full text-xs font-bold ${t.is_active ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'}`}
            >
              {t.is_active ? 'Active' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </PlatformShell>
  )
}
