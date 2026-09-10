'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Send,
  Inbox,
  CheckCircle,
  Clock,
  AlertTriangle,
  Reply,
  User,
  ShieldCheck,
  Wallet,
  Eye,
  Plus,
  RefreshCw,
  FileText,
  Sparkles,
  Search,
} from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { useToast } from '@/components/ui/toast'
import type { ResendEmail, Profile } from '@/types'

interface UserSummary {
  id: string
  email: string
  full_name: string | null
  role: string
  vip_tier?: string
  kyc_status?: string
  wallet_balance?: number
}

interface Props {
  initialEmails: ResendEmail[]
  users: UserSummary[]
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function AdminEmailsClient({ initialEmails, users }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'inbox' | 'outbox' | 'compose'>('inbox')
  const [emails, setEmails] = useState<ResendEmail[]>(initialEmails)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmail, setSelectedEmail] = useState<ResendEmail | null>(null)

  // Compose State
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [template, setTemplate] = useState('custom')
  const [inReplyTo, setInReplyTo] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  // Simulate Inbound State
  const [showSimulateModal, setShowSimulateModal] = useState(false)
  const [simSender, setSimSender] = useState(users[0]?.email || 'investor@example.com')
  const [simSubject, setSimSubject] = useState('Question regarding Cybertruck Cyberbeast auction')
  const [simBody, setSimBody] = useState('Hello Tesla Capital team,\n\nI would like to verify the escrow rules for bidding on the Cybertruck Foundation Series auction lot. Does my full bid get held from my available liquid balance?\n\nThank you,\nMember')
  const [simulating, setSimulating] = useState(false)

  // Separate inbound and outbound
  const inboundEmails = emails.filter(e => e.direction === 'inbound')
  const outboundEmails = emails.filter(e => e.direction !== 'inbound')
  const unreadCount = inboundEmails.filter(e => !e.is_read).length

  // Filtered lists
  const filteredInbound = inboundEmails.filter(e =>
    e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.from_email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredOutbound = outboundEmails.filter(e =>
    e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.to_email || e.recipient || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const applyTemplate = (t: string) => {
    setTemplate(t)
    if (t === 'welcome') {
      setSubject('Welcome to Tesla Capital Wealth Platform')
      setBody(`
        <h2>Welcome to Tesla Capital</h2>
        <p>Your institutional wealth account is active. You can now participate in curated clean energy funds, stock equity markets, exclusive vehicle auctions, and VIP privileges.</p>
        <p>If you require dedicated assistance, reply directly to this email or access your Member Support desk.</p>
        <p>Best regards,<br/><strong>Tesla Capital Executive Desk</strong></p>
      `)
    } else if (t === 'deposit_received') {
      setSubject('Deposit Transaction Confirmed & Credited')
      setBody(`
        <h2>Deposit Credited Successfully</h2>
        <p>Your cryptocurrency deposit has completed on-chain confirmations and is now credited to your liquid wallet balance.</p>
        <p>You may immediately allocate capital towards investment portfolios or participate in live vehicle auctions.</p>
      `)
    } else if (t === 'kyc_reminder') {
      setSubject('Compliance Notice: Identity Verification Required')
      setBody(`
        <h2>Action Required: Account Verification</h2>
        <p>In accordance with financial compliance requirements, please complete identity verification under Account Settings to enable uninhibited transactions.</p>
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
          inReplyTo,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast('Email Dispatched', data.message)
        setTo('')
        setSubject('')
        setBody('')
        setInReplyTo(null)
        setActiveTab('outbox')
        router.refresh()
      } else {
        toast('Send Failed', data.error || 'Failed to dispatch email.', 'error')
      }
    } catch (err: any) {
      toast('Error', err.message, 'error')
    }
    setSending(false)
  }

  const handleReply = (email: ResendEmail) => {
    setTo(email.from_email)
    setSubject(email.subject.startsWith('Re: ') ? email.subject : `Re: ${email.subject}`)
    setInReplyTo(email.id)
    setBody(`
      <br/><br/>
      <div style="border-left: 2px solid #e82127; padding-left: 12px; margin-top: 20px; color: #888;">
        <p><strong>On ${new Date(email.created_at).toLocaleString()}, ${email.from_email} wrote:</strong></p>
        <div>${email.body_html || email.body_text || ''}</div>
      </div>
    `)
    setActiveTab('compose')
    setSelectedEmail(null)
  }

  const handleSimulateInbound = async (e: React.FormEvent) => {
    e.preventDefault()
    setSimulating(true)

    try {
      const res = await fetch('/api/webhooks/resend-inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: simSender,
          to: 'support@teslacapitals.app',
          subject: simSubject,
          text: simBody,
          html: `<p>${simBody.replace(/\n/g, '<br/>')}</p>`,
          simulated: true,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast('Inbound Email Received', 'Simulated customer inquiry stored in Inbox.')
        setShowSimulateModal(false)
        router.refresh()
        // Optimistically prepend to list
        const newEmail: ResendEmail = {
          id: data.id || crypto.randomUUID(),
          direction: 'inbound',
          from_email: simSender,
          to_email: 'support@teslacapitals.app',
          subject: simSubject,
          body_text: simBody,
          body_html: `<p>${simBody.replace(/\n/g, '<br/>')}</p>`,
          status: 'received',
          is_read: false,
          created_at: new Date().toISOString(),
        }
        setEmails(prev => [newEmail, ...prev])
        setActiveTab('inbox')
      } else {
        toast('Simulation Failed', data.error || 'Failed to simulate email.', 'error')
      }
    } catch (err: any) {
      toast('Error', err.message, 'error')
    }
    setSimulating(false)
  }

  // Find member info if sender matches a registered user
  const getSenderProfile = (emailAddr: string) => {
    return users.find(u => u.email.toLowerCase() === emailAddr.toLowerCase())
  }

  return (
    <PlatformShell admin>
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Communications Gateway</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Resend Email Center</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Official communications desk connected to <span className="font-mono text-foreground font-bold">support@teslacapitals.app</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-2 border border-border bg-card px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-foreground active:scale-95"
          >
            <Sparkles size={15} className="text-primary" /> Simulate Inbound
          </button>
          <button
            onClick={() => {
              setTo('')
              setSubject('')
              setBody('')
              setInReplyTo(null)
              setActiveTab('compose')
            }}
            className="flex items-center gap-2 bg-primary px-5 py-3 font-mono text-xs uppercase font-bold text-primary-foreground hover:brightness-110 active:scale-95"
          >
            <Plus size={15} /> Compose Email
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="mt-8 flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              activeTab === 'inbox'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Inbox size={15} />
            <span>Inbox ({inboundEmails.length})</span>
            {unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.2 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('outbox')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              activeTab === 'outbox'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Send size={15} />
            <span>Outbox / Sent ({outboundEmails.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('compose')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              activeTab === 'compose'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText size={15} />
            <span>Compose</span>
          </button>
        </div>

        {activeTab !== 'compose' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input
              type="text"
              placeholder="Search sender or subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-9 w-full sm:w-64 border border-border bg-background pl-9 pr-3 text-xs outline-none focus:border-primary"
            />
          </div>
        )}
      </div>

      {/* Main Content Areas */}
      <div className="mt-6">
        {/* INBOX TAB */}
        {activeTab === 'inbox' && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Inbox List */}
            <div className={`${selectedEmail ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3`}>
              {filteredInbound.length > 0 ? (
                filteredInbound.map(email => {
                  const senderProfile = getSenderProfile(email.from_email)
                  const isSelected = selectedEmail?.id === email.id
                  return (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`cursor-pointer border p-4 transition-all hover:border-primary/50 ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : email.is_read
                          ? 'border-border bg-card'
                          : 'border-border bg-card/80 font-bold border-l-4 border-l-primary'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-xs text-foreground font-semibold">{email.from_email}</p>
                            {senderProfile && (
                              <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] uppercase text-primary">
                                {senderProfile.vip_tier || 'Member'}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs text-foreground">{email.subject}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                            {email.body_text || email.body_html?.replace(/<[^>]*>?/gm, '') || '(No preview content)'}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                          {new Date(email.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="border border-border bg-card py-16 text-center">
                  <Inbox className="mx-auto text-muted-foreground" size={32} />
                  <p className="mt-3 text-xs text-muted-foreground">No inbound emails found.</p>
                  <button
                    onClick={() => setShowSimulateModal(true)}
                    className="mt-4 border border-border px-3 py-2 font-mono text-[11px] uppercase hover:border-primary"
                  >
                    Simulate test incoming email
                  </button>
                </div>
              )}
            </div>

            {/* Inbound Email Reader Pane */}
            {selectedEmail && (
              <div className="lg:col-span-7 border border-border bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h2 className="text-lg font-bold">{selectedEmail.subject}</h2>
                    <div className="mt-1 flex items-center gap-3 font-mono text-xs text-muted-foreground">
                      <span>From: <strong className="text-foreground">{selectedEmail.from_email}</strong></span>
                      <span>&bull;</span>
                      <span>{new Date(selectedEmail.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReply(selectedEmail)}
                      className="flex items-center gap-1.5 bg-primary px-3 py-2 font-mono text-xs font-bold uppercase text-primary-foreground hover:brightness-110 active:scale-95"
                    >
                      <Reply size={14} /> Reply
                    </button>
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="border border-border px-3 py-2 font-mono text-xs hover:border-primary"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Member Context Card if recognized */}
                {(() => {
                  const p = getSenderProfile(selectedEmail.from_email)
                  if (!p) return null
                  return (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border border-border bg-background p-3 text-xs">
                      <div className="flex items-center gap-2">
                        <User size={15} className="text-primary" />
                        <div>
                          <p className="font-bold">{p.full_name || 'Registered Member'}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{p.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-[11px]">
                        <div>
                          <span className="text-muted-foreground">VIP Tier: </span>
                          <span className="font-bold uppercase text-primary">{p.vip_tier || 'Standard'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">KYC: </span>
                          <span className="font-bold capitalize">{p.kyc_status || 'Unverified'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Balance: </span>
                          <span className="font-bold text-green-500">{fmt(p.wallet_balance || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Body Content */}
                <div className="mt-6 min-h-[260px] border border-border bg-background p-5 text-sm">
                  {selectedEmail.body_html ? (
                    <div
                      className="prose prose-invert max-w-none text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-xs text-foreground">
                      {selectedEmail.body_text || '(No body content)'}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* OUTBOX TAB */}
        {activeTab === 'outbox' && (
          <div className="space-y-3">
            {filteredOutbound.length > 0 ? (
              filteredOutbound.map(log => (
                <div key={log.id} className="border border-border bg-card p-4 text-xs transition-colors hover:border-primary/50">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-bold text-foreground text-sm">{log.subject}</p>
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                        Recipient: <span className="text-foreground">{log.to_email || log.recipient}</span>
                      </p>
                    </div>
                    <span className={`self-start px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                      log.status === 'sent'
                        ? 'border border-green-500/30 bg-green-500/10 text-green-500'
                        : 'border border-yellow-500/30 bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-border/50 pt-2 font-mono text-[10px] text-muted-foreground">
                    <span>Template: {((log.metadata as Record<string, unknown>)?.template as string) || log.template || 'Custom'}</span>
                    <span>Dispatched: {new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-border bg-card py-16 text-center text-xs text-muted-foreground">
                No outbound communications recorded.
              </div>
            )}
          </div>
        )}

        {/* COMPOSE TAB */}
        {activeTab === 'compose' && (
          <form onSubmit={handleSend} className="border border-border bg-card p-6 flex flex-col gap-4 max-w-3xl">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-border pb-4">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-primary">Outbound Message Composer</h3>
                {inReplyTo && (
                  <p className="mt-1 font-mono text-[10px] text-green-500">Thread reply linked</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
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
                placeholder="investor@example.com"
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
                rows={10}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="<p>Enter HTML email content...</p>"
                required
                className="border border-border bg-background p-3 font-mono text-xs outline-none focus:border-primary"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={sending}
                className="flex items-center justify-center gap-2 h-12 flex-1 bg-primary text-xs font-bold text-primary-foreground transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                <Send size={15} /> {sending ? 'Dispatching...' : 'Send via Resend API'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inbox')}
                className="border border-border px-6 text-xs font-bold hover:border-primary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
          <form onSubmit={handleSimulateInbound} className="w-full max-w-lg border border-border bg-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="font-mono text-xs uppercase text-primary">Testing & Verification</p>
                <h3 className="text-lg font-bold">Simulate Inbound Customer Email</h3>
              </div>
              <button type="button" onClick={() => setShowSimulateModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <label className="flex flex-col gap-1 text-xs font-bold">
              Sender Email (From)
              <input
                type="email"
                value={simSender}
                onChange={e => setSimSender(e.target.value)}
                list="user-emails-sim"
                required
                className="h-10 border border-border bg-background px-3 outline-none focus:border-primary"
              />
              <datalist id="user-emails-sim">
                {users.map(u => (
                  <option key={u.email} value={u.email}>{u.full_name || u.email} (Registered Member)</option>
                ))}
              </datalist>
            </label>

            <label className="flex flex-col gap-1 text-xs font-bold">
              Subject
              <input
                value={simSubject}
                onChange={e => setSimSubject(e.target.value)}
                required
                className="h-10 border border-border bg-background px-3 outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-bold">
              Email Body
              <textarea
                rows={5}
                value={simBody}
                onChange={e => setSimBody(e.target.value)}
                required
                className="border border-border bg-background p-3 text-xs outline-none focus:border-primary"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="border border-border px-4 py-2 font-mono text-xs hover:border-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={simulating}
                className="bg-primary px-5 py-2 font-mono text-xs font-bold text-primary-foreground hover:brightness-110 disabled:opacity-50"
              >
                {simulating ? 'Simulating...' : 'Submit Test Webhook'}
              </button>
            </div>
          </form>
        </div>
      )}
    </PlatformShell>
  )
}
