'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export function AdminOrdersClient({ orders: initial }: { orders: (Order & { product?: { name: string } })[] }) {
  const router = useRouter()
  const [orders, setOrders] = useState(initial)

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const supabase = createClient()
    await supabase.from('orders').update({ status: newStatus as any }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o))
    router.refresh()
  }

  return (
    <PlatformShell admin>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Order management</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Orders ({orders.length})</h1>
      </div>

      <div className="mt-8 space-y-3">
        {orders.map(o => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-4 border border-border bg-card p-5">
            <div>
              <p className="text-sm font-bold">{o.product?.name || o.order_number}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{o.order_number} · Total: {fmt(Number(o.total))} · {new Date(o.created_at).toLocaleDateString()}</p>
            </div>
            <select
              value={o.status}
              onChange={e => handleUpdateStatus(o.id, e.target.value)}
              className="h-9 border border-border bg-background px-3 text-xs font-bold capitalize outline-none focus:border-primary"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </PlatformShell>
  )
}
