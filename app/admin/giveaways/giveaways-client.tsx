'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Gift } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import type { Giveaway } from '@/types'

export function AdminGiveawaysClient({ giveaways: initial }: { giveaways: Giveaway[] }) {
  const router = useRouter()
  const [giveaways, setGiveaways] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [days, setDays] = useState('30')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const now = new Date()
    const end = new Date(now.getTime() + parseInt(days) * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase.from('giveaways').insert({
      title,
      description,
      starts_at: now.toISOString(),
      ends_at: end.toISOString(),
      status: 'active',
    }).select().single()

    if (!error && data) {
      setGiveaways(prev => [data, ...prev])
      setShowForm(false)
      setTitle('')
      setDescription('')
      router.refresh()
    }
    setLoading(false)
  }

  const handlePickWinner = async (giveawayId: string) => {
    const supabase = createClient()
    // Get entries for giveaway
    const { data: entries } = await supabase.from('giveaway_entries').select('user_id').eq('giveaway_id', giveawayId)
    if (!entries || entries.length === 0) return

    const randomWinner = entries[Math.floor(Math.random() * entries.length)].user_id
    await supabase.from('giveaways').update({ winner_id: randomWinner, status: 'ended' }).eq('id', giveawayId)

    setGiveaways(prev => prev.map(g => g.id === giveawayId ? { ...g, winner_id: randomWinner, status: 'ended' } : g))
    router.refresh()
  }

  return (
    <PlatformShell admin>
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Promotions</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Giveaways ({giveaways.length})</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 border border-border px-4 py-3 text-xs font-bold hover:border-primary">
          <Plus size={16} /> Create giveaway
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-8 border border-border bg-card p-6 flex flex-col gap-4">
          <p className="font-mono text-xs uppercase text-primary">New giveaway promotion</p>
          <label className="flex flex-col gap-1 text-xs font-bold">
            Title
            <input value={title} onChange={e => setTitle(e.target.value)} required className="h-10 border border-border bg-background px-3" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold">
            Duration (days)
            <input type="number" value={days} onChange={e => setDays(e.target.value)} required className="h-10 border border-border bg-background px-3" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold">
            Description
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="border border-border bg-background p-3" />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="bg-primary px-6 py-3 text-xs font-bold text-primary-foreground">
              {loading ? 'Creating...' : 'Create giveaway'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border px-6 py-3 text-xs font-bold">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-3">
        {giveaways.map(g => (
          <div key={g.id} className="flex flex-wrap items-center justify-between gap-4 border border-border bg-card p-5">
            <div>
              <p className="text-sm font-bold">{g.title}</p>
              <p className="font-mono text-[10px] text-muted-foreground">Ends: {new Date(g.ends_at).toLocaleDateString()} · Status: {g.status}</p>
              {g.winner_id && <p className="text-xs text-green-600 font-bold mt-1">Winner ID: {g.winner_id}</p>}
            </div>
            {g.status === 'active' && !g.winner_id && (
              <button onClick={() => handlePickWinner(g.id)} className="bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
                Pick random winner
              </button>
            )}
          </div>
        ))}
      </div>
    </PlatformShell>
  )
}
