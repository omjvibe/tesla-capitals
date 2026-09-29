'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertCircle,
  Bell,
  CreditCard,
  ChevronRight,
  ArrowLeft,
  Send,
  Download,
  Receipt,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Gift,
  ExternalLink,
} from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import type { Profile, CryptoAddress, DepositRequest, WithdrawalRequest, Transaction } from '@/types'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

/* ── EMV Gold Chip SVG ──────────────────────────────────── */
function ChipSvg({ className = 'w-10 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 34" className={className} fill="none">
      <rect width="48" height="34" rx="6" fill="url(#chipGold)" />
      <rect x="2" y="2" width="44" height="30" rx="4" stroke="#9A7B2C" strokeWidth="1" strokeOpacity="0.6" fill="none" />
      <path d="M0 12h14m0 10H0m34-10h14m-14 10h14M14 0v34m20-34v34M14 12c4 0 6 2 6 5s-2 5-6 5m20-10c-4 0-6 2-6 5s2 5 6 5" stroke="#785B17" strokeWidth="1.2" strokeLinecap="round" />
      <defs>
        <linearGradient id="chipGold" x1="0" y1="0" x2="48" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9E29D" />
          <stop offset="0.5" stopColor="#D8AC4E" />
          <stop offset="1" stopColor="#B6872B" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Mastercard Dual Circles ────────────────────────────── */
function MastercardLogo({ className = 'w-10 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 28" className={className} fill="none">
      <circle cx="14" cy="14" r="14" fill="#EB001B" />
      <circle cx="30" cy="14" r="14" fill="#F79E1B" fillOpacity="0.9" />
      <path d="M22 4.67a14 14 0 0 1 0 18.66 14 14 0 0 1 0-18.66z" fill="#FF5F00" />
    </svg>
  )
}

/* ── Contactless Wave Icon ─────────────────────────────── */
function ContactlessIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8.5 16.5a5 5 0 0 1 0-9" />
      <path d="M12 19a8.5 8.5 0 0 0 0-14" />
      <path d="M15.5 21.5a12 12 0 0 0 0-19" />
    </svg>
  )
}

interface Props {
  profile: Profile
  cryptoAddresses: CryptoAddress[]
  depositRequests: DepositRequest[]
  withdrawalRequests: WithdrawalRequest[]
  transactions: Transaction[]
}

export function WalletClient({
  profile,
  cryptoAddresses,
  depositRequests: initialDeposits,
  withdrawalRequests: initialWithdrawals,
  transactions,
}: Props) {
  const router = useRouter()
  const { toast } = useToast()

  // UI Modes
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'swap'>('overview')
  const [expandedCards, setExpandedCards] = useState(false)
  const [showFullCardNumber, setShowFullCardNumber] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Real balances & user values
  const walletBalance = Number(profile.wallet_balance || 0)
  const realizedPnl = Number(profile.realized_pnl || 0)
  const unrealizedPnl = Number(profile.unrealized_pnl || 0)
  const cardHolderName = (profile.full_name || 'Valued Member').toUpperCase()
  const maskedCardLast4 = profile.id.replace(/-/g, '').slice(0, 4).toUpperCase() || '3123'
  const virtualCardNumber = showFullCardNumber
    ? `5292 8410 9324 ${maskedCardLast4}`
    : `5292 •••• •••• ${maskedCardLast4}`

  // Expiration calculation: derived from user creation year + 3
  const cardExpYear = useMemo(() => {
    const d = profile.created_at ? new Date(profile.created_at) : new Date()
    return String((d.getFullYear() + 3) % 100).padStart(2, '0')
  }, [profile.created_at])

  // Deposit state
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoAddress | null>(cryptoAddresses[0] || null)
  const [depositAmount, setDepositAmount] = useState('')
  const [txHash, setTxHash] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [submittingDeposit, setSubmittingDeposit] = useState(false)
  const [deposits, setDeposits] = useState<DepositRequest[]>(initialDeposits)

  // Withdrawal state
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDT')
  const [destAddress, setDestAddress] = useState('')
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false)
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(initialWithdrawals)

  // Swap state
  const [swapFrom, setSwapFrom] = useState<'USD' | 'BTC' | 'ETH' | 'USDT'>('USD')
  const [swapTo, setSwapTo] = useState<'USD' | 'BTC' | 'ETH' | 'USDT'>('BTC')
  const [swapAmount, setSwapAmount] = useState('')
  const [swapping, setSwapping] = useState(false)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast('Copied to Clipboard', text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(depositAmount)
    if (isNaN(amt) || amt <= 0) {
      toast('Invalid Amount', 'Please enter a valid deposit amount.', 'error')
      return
    }

    setSubmittingDeposit(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('deposit_requests')
      .insert({
        user_id: profile.id,
        amount: amt,
        currency: selectedCrypto?.currency || 'USD',
        tx_hash: txHash.trim() || null,
        proof_url: proofUrl.trim() || null,
        status: 'pending',
      })
      .select()
      .single()

    if (!error && data) {
      setDeposits(prev => [data, ...prev])
      toast('Deposit Submitted', 'Your deposit confirmation has been logged for institutional credit verification.')
      setDepositAmount('')
      setTxHash('')
      setProofUrl('')
      setActiveTab('overview')
      router.refresh()
    } else {
      toast('Submission Failed', error?.message || 'Error submitting deposit.', 'error')
    }
    setSubmittingDeposit(false)
  }

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(withdrawAmount)
    if (isNaN(amt) || amt <= 0) {
      toast('Invalid Amount', 'Please enter a valid withdrawal amount.', 'error')
      return
    }

    if (amt > walletBalance) {
      toast('Insufficient Balance', `Your available liquid balance is ${fmt(walletBalance)}.`, 'error')
      return
    }

    if (!destAddress.trim()) {
      toast('Address Required', 'Please enter a valid recipient destination address.', 'error')
      return
    }

    setSubmittingWithdraw(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: profile.id,
        amount: amt,
        currency: withdrawCurrency,
        destination_address: destAddress.trim(),
        status: 'pending',
      })
      .select()
      .single()

    if (!error && data) {
      setWithdrawals(prev => [data, ...prev])
      toast('Withdrawal Requested', 'Your withdrawal request has been submitted for review.')
      setWithdrawAmount('')
      setDestAddress('')
      setActiveTab('overview')
      router.refresh()
    } else {
      toast('Request Failed', error?.message || 'Error submitting withdrawal.', 'error')
    }
    setSubmittingWithdraw(false)
  }

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(swapAmount)
    if (isNaN(amt) || amt <= 0) {
      toast('Invalid Amount', 'Please enter a valid swap amount.', 'error')
      return
    }

    if (swapFrom === 'USD' && amt > walletBalance) {
      toast('Insufficient Balance', 'Not enough available USD balance for this swap.', 'error')
      return
    }

    setSwapping(true)
    toast('Swap Executed', `Successfully converted ${amt} ${swapFrom} to ${swapTo}.`)
    setSwapAmount('')
    setSwapping(false)
    setActiveTab('overview')
  }

  // Get icon for transaction
  const getTxIcon = (type: string) => {
    const t = type.toLowerCase()
    if (t.includes('deposit')) return <Download size={18} className="text-emerald-500" />
    if (t.includes('withdraw')) return <UploadIcon size={18} className="text-amber-500" />
    if (t.includes('invest') || t.includes('stock')) return <TrendingUp size={18} className="text-blue-500" />
    if (t.includes('dividend') || t.includes('yield')) return <Gift size={18} className="text-purple-500" />
    return <Receipt size={18} className="text-foreground" />
  }

  function UploadIcon(props: any) {
    return <Send {...props} />
  }

  return (
    <PlatformShell>
      <div className="space-y-6">
        {/* ── User Header (Matches Reference: Avatar + Greeting + Bell) ─ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-full bg-gradient-to-tr from-primary/30 to-primary/10 text-primary font-bold shadow-sm ring-2 ring-primary/20">
              {profile.full_name
                ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                : 'TC'}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Hello,</p>
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl text-foreground">
                {profile.full_name || 'Institutional Member'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {expandedCards && (
              <button
                onClick={() => setExpandedCards(false)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-all hover:bg-muted active:scale-95"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <Link
              href="/notifications"
              className="relative grid size-10 place-items-center rounded-2xl border border-border bg-card text-muted-foreground transition-all hover:border-primary hover:text-primary active:scale-95"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
            </Link>
          </div>
        </div>

        {/* ── Responsive Layout: Left (Cards & Actions) + Right (Details & Feed) ─ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ── LEFT SECTION (7 Cols on Desktop) ─────────────── */}
          <div className="space-y-6 lg:col-span-7">
            {/* Hero Card & Quick Actions Box */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                {/* Vertical Action Column (Matches Reference: Send, Request, Pay Bills/Swap) */}
                <div className="flex flex-row justify-around gap-4 sm:flex-col sm:justify-start">
                  <button
                    onClick={() => setActiveTab('deposit')}
                    className="group flex flex-col items-center gap-1.5 transition-transform active:scale-95"
                    title="Deposit Crypto/Cash"
                  >
                    <div className="grid size-12 place-items-center rounded-2xl border border-border bg-background shadow-sm transition-colors group-hover:border-primary group-hover:bg-primary/5">
                      <Download size={20} className="text-foreground transition-colors group-hover:text-primary" />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground">
                      Send
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="group flex flex-col items-center gap-1.5 transition-transform active:scale-95"
                    title="Withdrawal Request"
                  >
                    <div className="grid size-12 place-items-center rounded-2xl border border-border bg-background shadow-sm transition-colors group-hover:border-primary group-hover:bg-primary/5">
                      <Send size={20} className="text-foreground transition-colors group-hover:text-primary" />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground">
                      Request
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('swap')}
                    className="group flex flex-col items-center gap-1.5 transition-transform active:scale-95"
                    title="Instant Asset Swap"
                  >
                    <div className="grid size-12 place-items-center rounded-2xl border border-border bg-background shadow-sm transition-colors group-hover:border-primary group-hover:bg-primary/5">
                      <RefreshCw size={19} className="text-foreground transition-colors group-hover:text-primary" />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground">
                      Swap
                    </span>
                  </button>
                </div>

                {/* ── 3D Stacked Cards Deck (Matches Reference Design) ── */}
                <div
                  className="relative flex-1 cursor-pointer select-none py-2"
                  onClick={() => setExpandedCards(!expandedCards)}
                  title="Click to toggle card detail view"
                >
                  {/* Card Layer 3 (Deep Background Card) */}
                  <div
                    className={`pointer-events-none absolute right-2 top-0 h-48 w-[88%] rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 p-5 shadow-md transition-all duration-500 dark:border-white/5 ${
                      expandedCards
                        ? '-translate-y-12 translate-x-4 rotate-6 opacity-70'
                        : '-translate-y-3 translate-x-4 -rotate-3 opacity-40'
                    }`}
                  >
                    <div className="flex justify-between text-white/50 text-[10px] font-mono">
                      <span>SECONDARY ESCROW</span>
                      <span className="font-bold">{fmt(realizedPnl)}</span>
                    </div>
                  </div>

                  {/* Card Layer 2 (Middle Background Card) */}
                  <div
                    className={`pointer-events-none absolute right-1 top-2 h-48 w-[92%] rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 shadow-lg transition-all duration-500 dark:border-white/5 ${
                      expandedCards
                        ? '-translate-y-6 translate-x-2 rotate-3 opacity-90'
                        : '-translate-y-1.5 translate-x-2 -rotate-1.5 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between text-white/60 text-[10px] font-mono">
                      <span>EQUITY SETTLEMENT</span>
                      <span className="font-bold">{fmt(walletBalance + unrealizedPnl)}</span>
                    </div>
                  </div>

                  {/* Card Layer 1 (Front Featured Metallic Institutional Card) */}
                  <div className="relative z-10 flex h-52 flex-col justify-between rounded-3xl border border-white/15 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 p-6 text-white shadow-2xl transition-all duration-500 hover:shadow-primary/10">
                    {/* Top Row: Chip, Contactless, Issuer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <ChipSvg />
                        <ContactlessIcon className="text-white/60" />
                      </div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                        Institutional Wealth
                      </span>
                    </div>

                    {/* Middle: Big Real Balance */}
                    <div className="my-auto pt-2">
                      <p className="font-mono text-xs uppercase tracking-widest text-white/60">Available Cash</p>
                      <p className="font-mono text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                        {fmt(walletBalance)}
                      </p>
                    </div>

                    {/* Bottom Row: Bank Name, Masked Card Number, Brand Logo */}
                    <div className="flex items-end justify-between border-t border-white/10 pt-3">
                      <div>
                        <p className="text-[11px] font-medium text-white/80">Tesla Capital Institutional</p>
                        <p className="font-mono text-xs tracking-wider text-white/60 mt-0.5">
                          {virtualCardNumber}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <MastercardLogo />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Meta Row (Expiration, Cardholder, Reveal Toggle) */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground uppercase text-[10px]">Card Holder: </span>
                  <span className="font-bold text-foreground">{cardHolderName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase text-[10px]">Expires: </span>
                  <span className="font-bold text-foreground">12/{cardExpYear}</span>
                </div>
                <button
                  onClick={() => setShowFullCardNumber(!showFullCardNumber)}
                  className="flex items-center gap-1.5 text-primary hover:underline text-[11px]"
                >
                  {showFullCardNumber ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showFullCardNumber ? 'Mask Number' : 'Reveal Number'}
                </button>
              </div>
            </div>

            {/* ── Action Workspace Tabs (Deposit, Withdraw, Swap, Overview) ── */}
            <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="flex border-b border-border bg-muted/30">
                {[
                  { id: 'overview', label: 'Wallet Ledger' },
                  { id: 'deposit', label: 'Deposit Crypto' },
                  { id: 'withdraw', label: 'Withdrawal' },
                  { id: 'swap', label: 'Asset Swap' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3.5 text-center text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'border-b-2 border-primary bg-card text-primary font-bold shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* ── Tab: Overview Activity ─────────────────── */}
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* Pending Deposits */}
                      <div className="rounded-2xl border border-border bg-background p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Deposit Requests ({deposits.length})
                          </p>
                          <span className="text-[10px] text-muted-foreground font-mono">In Review</span>
                        </div>
                        <div className="divide-y divide-border">
                          {deposits.length > 0 ? (
                            deposits.slice(0, 4).map(d => (
                              <div key={d.id} className="py-2.5 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-bold text-foreground font-mono">
                                    {fmt(Number(d.amount))} ({d.currency})
                                  </p>
                                  <p className="font-mono text-[10px] text-muted-foreground">
                                    {new Date(d.created_at).toLocaleDateString()} {d.tx_hash ? `• ${d.tx_hash.slice(0, 8)}...` : ''}
                                  </p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  d.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                  d.status === 'rejected' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                                  'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                }`}>
                                  {d.status}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="py-6 text-center text-xs text-muted-foreground">No deposit requests logged.</p>
                          )}
                        </div>
                      </div>

                      {/* Pending Withdrawals */}
                      <div className="rounded-2xl border border-border bg-background p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Withdrawals ({withdrawals.length})
                          </p>
                          <span className="text-[10px] text-muted-foreground font-mono">Processing</span>
                        </div>
                        <div className="divide-y divide-border">
                          {withdrawals.length > 0 ? (
                            withdrawals.slice(0, 4).map(w => (
                              <div key={w.id} className="py-2.5 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-bold text-foreground font-mono">
                                    {fmt(Number(w.amount))} ({w.currency})
                                  </p>
                                  <p className="font-mono text-[10px] text-muted-foreground truncate max-w-[120px]">
                                    To: {w.destination_address.slice(0, 10)}...
                                  </p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  w.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                  w.status === 'rejected' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                                  'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                }`}>
                                  {w.status}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="py-6 text-center text-xs text-muted-foreground">No withdrawal requests logged.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Tab: Deposit Crypto ────────────────────── */}
                {activeTab === 'deposit' && (
                  <div className="space-y-6">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                        Step 1: Select Deposit Currency
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {cryptoAddresses.map(ca => (
                          <button
                            key={ca.id}
                            onClick={() => setSelectedCrypto(ca)}
                            className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                              selectedCrypto?.id === ca.id
                                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                : 'border-border bg-background hover:border-primary/50'
                            }`}
                          >
                            {ca.currency} ({ca.network})
                          </button>
                        ))}
                      </div>

                      {selectedCrypto && (
                        <div className="mt-4 rounded-2xl border border-border bg-background p-4 font-mono text-xs">
                          <p className="text-[10px] uppercase text-muted-foreground">
                            Official {selectedCrypto.network} Deposit Address
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                            <span className="break-all font-bold text-foreground text-[11px] sm:text-xs">
                              {selectedCrypto.address}
                            </span>
                            <button
                              onClick={() => copyToClipboard(selectedCrypto.address, selectedCrypto.id)}
                              className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-primary hover:underline"
                            >
                              {copiedId === selectedCrypto.id ? <Check size={14} /> : <Copy size={14} />}
                              {copiedId === selectedCrypto.id ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <p className="mt-2.5 text-[11px] text-muted-foreground">
                            Send only <strong className="text-foreground">{selectedCrypto.currency}</strong> on the{' '}
                            <strong className="text-foreground">{selectedCrypto.network}</strong> network.
                          </p>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleDepositSubmit} className="space-y-4 border-t border-border pt-5">
                      <p className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                        Step 2: Submit On-Chain Confirmation
                      </p>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1 text-xs font-bold text-foreground">
                          Amount ($ USD Equivalent) *
                          <input
                            type="number"
                            step="0.01"
                            value={depositAmount}
                            onChange={e => setDepositAmount(e.target.value)}
                            placeholder="5000.00"
                            required
                            className="h-11 rounded-xl border border-border bg-background px-3 font-mono outline-none focus:border-primary"
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-bold text-foreground">
                          Transaction Hash / ID *
                          <input
                            value={txHash}
                            onChange={e => setTxHash(e.target.value)}
                            placeholder="e.g. 0x8a9f..."
                            required
                            className="h-11 rounded-xl border border-border bg-background px-3 font-mono outline-none focus:border-primary"
                          />
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingDeposit}
                        className="h-12 w-full rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                      >
                        {submittingDeposit ? 'Logging Confirmation...' : 'Confirm Deposit Transaction'}
                      </button>
                    </form>
                  </div>
                )}

                {/* ── Tab: Withdraw ─────────────────────────── */}
                {activeTab === 'withdraw' && (
                  <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                        Request Liquid Payout
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground font-mono">
                        Available to withdraw: <strong className="text-foreground">{fmt(walletBalance)}</strong>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-1 text-xs font-bold text-foreground">
                        Withdrawal Amount ($ USD) *
                        <input
                          type="number"
                          step="0.01"
                          max={walletBalance}
                          value={withdrawAmount}
                          onChange={e => setWithdrawAmount(e.target.value)}
                          placeholder="1000.00"
                          required
                          className="h-11 rounded-xl border border-border bg-background px-3 font-mono outline-none focus:border-primary"
                        />
                      </label>

                      <label className="flex flex-col gap-1 text-xs font-bold text-foreground">
                        Payout Currency / Network
                        <select
                          value={withdrawCurrency}
                          onChange={e => setWithdrawCurrency(e.target.value)}
                          className="h-11 rounded-xl border border-border bg-background px-3 font-mono outline-none focus:border-primary"
                        >
                          <option value="USDT">USDT (TRC-20 / ERC-20)</option>
                          <option value="USDC">USDC (ERC-20)</option>
                          <option value="BTC">Bitcoin (BTC)</option>
                          <option value="ETH">Ethereum (ETH)</option>
                        </select>
                      </label>
                    </div>

                    <label className="flex flex-col gap-1 text-xs font-bold text-foreground">
                      Destination Wallet Address *
                      <input
                        value={destAddress}
                        onChange={e => setDestAddress(e.target.value)}
                        placeholder="Enter your external crypto wallet address"
                        required
                        className="h-11 rounded-xl border border-border bg-background px-3 font-mono text-xs outline-none focus:border-primary"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={submittingWithdraw || walletBalance <= 0}
                      className="h-12 w-full rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                    >
                      {submittingWithdraw ? 'Submitting Request...' : 'Submit Withdrawal Request'}
                    </button>
                  </form>
                )}

                {/* ── Tab: Swap ─────────────────────────────── */}
                {activeTab === 'swap' && (
                  <form onSubmit={handleSwap} className="space-y-5">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                        Instant Asset Swap
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Zero slippage conversion across institutional treasury reserves.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-1 text-xs font-bold">
                        Convert From
                        <select
                          value={swapFrom}
                          onChange={e => setSwapFrom(e.target.value as any)}
                          className="h-11 rounded-xl border border-border bg-background px-3 font-mono outline-none focus:border-primary"
                        >
                          <option value="USD">USD (Liquid Balance)</option>
                          <option value="USDT">USDT</option>
                          <option value="BTC">Bitcoin (BTC)</option>
                          <option value="ETH">Ethereum (ETH)</option>
                        </select>
                      </label>

                      <label className="flex flex-col gap-1 text-xs font-bold">
                        Convert To
                        <select
                          value={swapTo}
                          onChange={e => setSwapTo(e.target.value as any)}
                          className="h-11 rounded-xl border border-border bg-background px-3 font-mono outline-none focus:border-primary"
                        >
                          <option value="BTC">Bitcoin (BTC)</option>
                          <option value="ETH">Ethereum (ETH)</option>
                          <option value="USDT">USDT</option>
                          <option value="USD">USD (Liquid Balance)</option>
                        </select>
                      </label>
                    </div>

                    <label className="flex flex-col gap-1 text-xs font-bold">
                      Swap Amount
                      <input
                        type="number"
                        step="0.0001"
                        value={swapAmount}
                        onChange={e => setSwapAmount(e.target.value)}
                        placeholder="100.00"
                        required
                        className="h-11 rounded-xl border border-border bg-background px-3 font-mono outline-none focus:border-primary"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={swapping}
                      className="h-12 w-full rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                    >
                      {swapping ? 'Executing Conversion...' : `Execute Swap (${swapFrom} → ${swapTo})`}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT SECTION (5 Cols on Desktop) ────────────── */}
          <div className="space-y-6 lg:col-span-5">
            {/* Financial Ledger Metrics Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Realized P&L
                </p>
                <p className={`mt-2 font-mono text-2xl font-extrabold ${realizedPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {realizedPnl >= 0 ? '+' : ''}{fmt(realizedPnl)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Completed payouts</p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Unrealized P&L
                </p>
                <p className={`mt-2 font-mono text-2xl font-extrabold ${unrealizedPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {unrealizedPnl >= 0 ? '+' : ''}{fmt(unrealizedPnl)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Active holdings delta</p>
              </div>
            </div>

            {/* KYC & Verification Badge */}
            <div className="flex items-center justify-between rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`grid size-11 place-items-center rounded-2xl ${
                  profile.kyc_status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">KYC Identity Mandate</p>
                  <p className="font-mono text-[11px] text-muted-foreground capitalize">
                    Status: {profile.kyc_status || 'Pending'}
                  </p>
                </div>
              </div>

              <Link
                href="/account"
                className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                Review
              </Link>
            </div>

            {/* ── Recent Transactions (Matches Reference Layout) ── */}
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  Recent Transactions
                </h3>
                <Link
                  href="/wallet"
                  className="font-mono text-xs font-semibold text-primary hover:underline"
                >
                  See all
                </Link>
              </div>

              <div className="divide-y divide-border">
                {transactions.length > 0 ? (
                  transactions.slice(0, 6).map(tx => {
                    const amt = Number(tx.amount)
                    const isPositive = amt >= 0

                    return (
                      <div key={tx.id} className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-muted/30">
                        <div className="flex items-center gap-3.5">
                          {/* Circular Category Icon matching reference */}
                          <div className="grid size-10 place-items-center rounded-full bg-muted shadow-sm">
                            {getTxIcon(tx.type)}
                          </div>

                          <div>
                            <p className="text-sm font-bold capitalize text-foreground">
                              {tx.type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[140px] sm:max-w-[200px]">
                              {tx.description || tx.type}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`font-mono text-sm font-bold ${
                            isPositive ? 'text-emerald-500' : 'text-foreground'
                          }`}>
                            {isPositive ? '+' : ''}{fmt(amt)}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="py-10 text-center text-xs text-muted-foreground">
                    <Wallet size={24} className="mx-auto mb-2 text-muted-foreground/60" />
                    No recent transactions found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PlatformShell>
  )
}
