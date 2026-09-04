'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { useToast } from '@/components/ui/toast'
import type { EmailLog } from '@/types'

interface Props {
  initialLogs: EmailLog[]
  users: { email: string; full_name: string | null }[]
}

export function AdminEmailsClient({ initialLogs, users }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [template, setTemplate] = useState('custom')
  const [sending, setSending] = useState(false)
  const [logs, setLogs] = useState<EmailLog[]>(initialLogs)

  const applyTemplate = (t: string) => {
    setTemplate(t)
    if (t === 'welcome') {
      setSubject('Welcome to Tesla Capital Platform')
      setBody(`
        <h2>Welcome to Tesla Capital!</h2>
        <p>Your account is fully activated. You can now access exclusive investment funds, stock trading, and luxury inventory.</p>
        <p>If you have any questions, reply directly to this email or visit our Help Center.</p>
        <p>Best regards,<br/><strong>Tesla Capital Executive Team</strong></p>
      `)
    } else if (t === 'deposit_received') {
      setSubject('Deposit Request Received')
      setBody(`
        <h2>Deposit Under Review</h2>
        <p>We have received your crypto deposit submission. Our compliance team is verifying the transaction hash on-chain.</p>
        <p>Your available balance will update as soon as confirmation completes.</p>
      `)
    } else if (t === 'kyc_reminder') {
      setSubject('Action Required: Complete Identity Verification')
      setBody(`
        <h2>Verify Your Identity</h2>
        <p>To comply with regulatory standards, please upload your verification documents under Account Settings.</p>
      `)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          html: body,
          template,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast('Email Dispatched', data.message)
        setTo('')
        setSubject('')
        setBody('')
        router.refresh()
      } else {
        toast('Send Failed', data.error || 'Failed to dispatch email.', 'error')
      }
    } catch (err: any) {
      toast('Error', err.message, 'error')
    }
    setSending(false)
  }

  return (
    <PlatformShell admin>
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Outbound Communications</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Resend Email Center</h1>
          <p className="mt-2 text-xs text-muted-foreground">Dispatches official communications via support@teslacapitals.app</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Email Composer */}
        <form onSubmit={handleSend} className="border border-border bg-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-mono text-xs uppercase tracking-widest text-primary">Compose Email</h3>
            <div className="flex gap-2">
              {['welcome', 'deposit_received', 'kyc_reminder'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="border border-border px-2.5 py-1 font-mono text-[10px] uppercase hover:border-primary"
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-xs font-bold">
            Recipient Email
            <input
              type="email"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="user@example.com"
              list="user-emails"
              required
              className="h-11 border border-border bg-background px-3 outline-none focus:border-primary"
            />
            <datalist id="user-emails">
              {users.map(u => (
                <option key={u.email} value={u.email}>{u.full_name || u.email}</option>
              ))}
            </datalist>
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold">
            Subject Line
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject..."
              required
              className="h-11 border border-border bg-background px-3 outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold">
            HTML Body Content
            <textarea
              rows={8}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="<p>Enter HTML email content...</p>"
              required
              className="border border-border bg-background p-3 font-mono text-xs outline-none focus:border-primary"
            />
          </label>

          <button
            type="submit"
            disabled={sending}
            className="flex items-center justify-center gap-2 h-12 bg-primary text-xs font-bold text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <Send size={15} /> {sending ? 'Dispatching...' : 'Send via Resend API'}
          </button>
        </form>

        {/* Email Dispatch Logs */}
        <div className="border border-border bg-card p-6 flex flex-col">
          <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Email Logs ({logs.length})</h3>

          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
            {logs.length > 0 ? (
              logs.map(log => (
                <div key={log.id} className="border border-border bg-background p-4 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{log.subject}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">To: {log.recipient}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase ${
                      log.status === 'sent' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
                    <span>Template: {log.template}</span>
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-12 text-center text-xs text-muted-foreground">No email logs found.</p>
            )}
          </div>
        </div>
      </div>
    </PlatformShell>
  )
}
