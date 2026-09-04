'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CircleHelp, Plus, MessageSquare } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import type { SupportTicket } from '@/types'

const statusColors: Record<string, string> = {
  open: 'bg-green-500/10 text-green-600',
  in_progress: 'bg-blue-500/10 text-blue-600',
  waiting: 'bg-yellow-500/10 text-yellow-600',
  resolved: 'bg-muted text-muted-foreground',
}

const categories = ['Account', 'Investments', 'Orders', 'Payments', 'Membership', 'Technical']

export function SupportClient({ tickets, userId }: { tickets: SupportTicket[]; userId: string }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('Account')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({ user_id: userId, subject, category })
      .select()
      .single()

    if (ticketError) { setError(ticketError.message); setLoading(false); return }

    await supabase.from('support_messages').insert({
      ticket_id: ticket.id,
      sender_id: userId,
      message,
    })

    setLoading(false)
    setShowForm(false)
    router.refresh()
  }

  return (
    <PlatformShell>
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">We are here</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Support</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Get answers from the Tesla Capital team.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 self-start border border-border px-4 py-3 text-xs font-bold hover:border-primary sm:self-auto">
          <Plus size={16} /> New request
        </button>
      </div>

      {/* Create Ticket Form */}
      {showForm && (
        <div className="mt-8 border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">New support request</p>
          {error && <div className="mt-4 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-xs font-bold">
              Subject
              <input value={subject} onChange={e => setSubject(e.target.value)} required className="h-12 border border-border bg-background px-4 outline-none focus:border-primary" placeholder="Brief description of your issue" />
            </label>
            <label className="flex flex-col gap-2 text-xs font-bold">
              Category
              <select value={category} onChange={e => setCategory(e.target.value)} className="h-12 border border-border bg-background px-4 outline-none focus:border-primary">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs font-bold">
              Message
              <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} className="border border-border bg-background p-4 outline-none focus:border-primary" placeholder="Describe your issue in detail..." />
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="h-12 bg-primary px-6 text-sm font-bold text-primary-foreground disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit ticket'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="h-12 border border-border px-6 text-sm font-bold">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket List */}
      {tickets.length > 0 ? (
        <div className="mt-8 space-y-3">
          {tickets.map(t => (
            <div key={t.id} className="border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center bg-muted text-primary"><MessageSquare size={20} /></div>
                  <div>
                    <p className="text-sm font-bold">{t.subject}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{t.ticket_number} · {t.category}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase ${statusColors[t.status] || 'bg-muted text-muted-foreground'}`}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span>Created: {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="capitalize">Priority: {t.priority}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="py-20 text-center">
            <CircleHelp size={40} className="mx-auto text-muted-foreground" />
            <p className="mt-4 text-lg font-bold">No support tickets</p>
            <p className="mt-2 text-sm text-muted-foreground">Need help? Create a support request above.</p>
          </div>
        )
      )}
    </PlatformShell>
  )
}
