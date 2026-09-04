'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import type { SupportTicket } from '@/types'

const ticketStatuses = ['open', 'in_progress', 'waiting', 'resolved']

export function AdminSupportClient({ tickets: initial }: { tickets: SupportTicket[] }) {
  const router = useRouter()
  const [tickets, setTickets] = useState(initial)

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const supabase = createClient()
    await supabase.from('support_tickets').update({ status: newStatus as any }).eq('id', id)
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as any } : t))
    router.refresh()
  }

  return (
    <PlatformShell admin>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Customer service</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Support Tickets ({tickets.length})</h1>
      </div>

      <div className="mt-8 space-y-3">
        {tickets.map(t => (
          <div key={t.id} className="flex flex-wrap items-center justify-between gap-4 border border-border bg-card p-5">
            <div>
              <p className="text-sm font-bold">{t.subject}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{t.ticket_number} · Category: {t.category} · Priority: {t.priority}</p>
            </div>
            <select
              value={t.status}
              onChange={e => handleUpdateStatus(t.id, e.target.value)}
              className="h-9 border border-border bg-background px-3 text-xs font-bold capitalize outline-none focus:border-primary"
            >
              {ticketStatuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        ))}
      </div>
    </PlatformShell>
  )
}
