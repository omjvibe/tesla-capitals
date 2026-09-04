'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, TrendingUp } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import type { Investment } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export function AdminInvestmentsClient({ investments: initial }: { investments: Investment[] }) {
  const router = useRouter()
  const [items, setItems] = useState<Investment[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('technology')
  const [minAmount, setMinAmount] = useState('5000')
  const [duration, setDuration] = useState('12')
  const [targetReturn, setTargetReturn] = useState('15')
  const [riskLevel, setRiskLevel] = useState<'low' | 'moderate' | 'high'>('moderate')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('investments').insert({
      name,
      description,
      category,
      min_amount: parseFloat(minAmount),
      duration_months: parseInt(duration),
      target_return: parseFloat(targetReturn),
      risk_level: riskLevel,
      status: 'active',
    }).select().single()

    if (!error && data) {
      setItems(prev => [data, ...prev])
      setShowForm(false)
      setName('')
      setDescription('')
      router.refresh()
    }
    setLoading(false)
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active'
    const supabase = createClient()
    await supabase.from('investments').update({ status: newStatus }).eq('id', id)
    setItems(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus as 'active' | 'draft' } : inv))
  }

  return (
    <PlatformShell admin>
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Catalog management</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Investments ({items.length})</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 border border-border px-4 py-3 text-xs font-bold hover:border-primary">
          <Plus size={16} /> New investment
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-8 border border-border bg-card p-6 flex flex-col gap-4">
          <p className="font-mono text-xs uppercase text-primary">Create investment opportunity</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-bold">
              Name
              <input value={name} onChange={e => setName(e.target.value)} required className="h-10 border border-border bg-background px-3" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">
              Category
              <input value={category} onChange={e => setCategory(e.target.value)} required className="h-10 border border-border bg-background px-3" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">
              Min Amount ($)
              <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} required className="h-10 border border-border bg-background px-3" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">
              Duration (months)
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} required className="h-10 border border-border bg-background px-3" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">
              Target Return (%)
              <input type="number" step="0.1" value={targetReturn} onChange={e => setTargetReturn(e.target.value)} required className="h-10 border border-border bg-background px-3" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">
              Risk Level
              <select value={riskLevel} onChange={e => setRiskLevel(e.target.value as any)} className="h-10 border border-border bg-background px-3">
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs font-bold">
            Description
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="border border-border bg-background p-3" />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="bg-primary px-6 py-3 text-xs font-bold text-primary-foreground">
              {loading ? 'Creating...' : 'Create investment'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border px-6 py-3 text-xs font-bold">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-3">
        {items.map(inv => (
          <div key={inv.id} className="flex items-center justify-between border border-border bg-card p-5">
            <div>
              <p className="text-sm font-bold">{inv.name}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{inv.category} · Min: {fmt(Number(inv.min_amount))} · Target: {inv.target_return}%</p>
            </div>
            <button
              onClick={() => handleToggleStatus(inv.id, inv.status)}
              className={`px-3 py-1 text-xs font-bold uppercase ${inv.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}
            >
              {inv.status}
            </button>
          </div>
        ))}
      </div>
    </PlatformShell>
  )
}
