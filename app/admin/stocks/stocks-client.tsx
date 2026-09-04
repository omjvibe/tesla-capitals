'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import type { Stock } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export function AdminStocksClient({ stocks: initial }: { stocks: Stock[] }) {
  const router = useRouter()
  const [stocks, setStocks] = useState<Stock[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [symbol, setSymbol] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [changePercent, setChangePercent] = useState('0')
  const [market, setMarket] = useState('NASDAQ')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('stocks').insert({
      symbol: symbol.toUpperCase(),
      name,
      price: parseFloat(price),
      change_percent: parseFloat(changePercent),
      market,
      description,
      is_published: true,
    }).select().single()

    if (!error && data) {
      setStocks(prev => [...prev, data])
      setShowForm(false)
      setSymbol('')
      setName('')
      setPrice('')
      router.refresh()
    }
    setLoading(false)
  }

  const handleUpdatePrice = async (id: string, newPrice: string, newChange: string) => {
    const p = parseFloat(newPrice)
    const c = parseFloat(newChange)
    if (isNaN(p)) return

    const supabase = createClient()
    await supabase.from('stocks').update({ price: p, change_percent: c }).eq('id', id)
    setStocks(prev => prev.map(s => s.id === id ? { ...s, price: p, change_percent: c } : s))
    router.refresh()
  }

  const handleTogglePublish = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('stocks').update({ is_published: !current }).eq('id', id)
    setStocks(prev => prev.map(s => s.id === id ? { ...s, is_published: !current } : s))
  }

  return (
    <PlatformShell admin>
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Market data</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Stocks ({stocks.length})</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 border border-border px-4 py-3 text-xs font-bold hover:border-primary">
          <Plus size={16} /> Add stock
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-8 border border-border bg-card p-6 flex flex-col gap-4">
          <p className="font-mono text-xs uppercase text-primary">Add market stock</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-bold">
              Symbol (e.g. TSLA)
              <input value={symbol} onChange={e => setSymbol(e.target.value)} required className="h-10 border border-border bg-background px-3 uppercase" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">
              Company Name
              <input value={name} onChange={e => setName(e.target.value)} required className="h-10 border border-border bg-background px-3" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">
              Price ($)
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="h-10 border border-border bg-background px-3" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">
              Change %
              <input type="number" step="0.01" value={changePercent} onChange={e => setChangePercent(e.target.value)} required className="h-10 border border-border bg-background px-3" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">
              Market Exchange
              <input value={market} onChange={e => setMarket(e.target.value)} required className="h-10 border border-border bg-background px-3" />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs font-bold">
            Description
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="border border-border bg-background p-3" />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="bg-primary px-6 py-3 text-xs font-bold text-primary-foreground">
              {loading ? 'Adding...' : 'Add stock'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border px-6 py-3 text-xs font-bold">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-8 border border-border bg-card">
        {stocks.map(s => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5 last:border-0">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center bg-foreground font-mono text-xs text-background">{s.symbol.slice(0, 2)}</div>
              <div>
                <p className="text-sm font-bold">{s.name} ({s.symbol})</p>
                <p className="font-mono text-[10px] text-muted-foreground">{s.market}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold">{fmt(Number(s.price))}</p>
                <p className={`text-xs ${Number(s.change_percent) >= 0 ? 'text-green-500' : 'text-primary'}`}>{Number(s.change_percent) >= 0 ? '+' : ''}{Number(s.change_percent)}%</p>
              </div>
              <button
                onClick={() => handleTogglePublish(s.id, s.is_published)}
                className={`px-3 py-1 text-xs font-bold ${s.is_published ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'}`}
              >
                {s.is_published ? 'Published' : 'Hidden'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </PlatformShell>
  )
}
