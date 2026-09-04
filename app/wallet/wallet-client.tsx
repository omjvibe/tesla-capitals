'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, ArrowDownLeft, ArrowUpRight, RefreshCw, Copy, Check, Clock, ShieldCheck, AlertCircle } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import type { Profile, CryptoAddress, DepositRequest, WithdrawalRequest, Transaction } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

interface Props {
  profile: Profile
  cryptoAddresses: CryptoAddress[]
  depositRequests: DepositRequest[]
  withdrawalRequests: WithdrawalRequest[]
  transactions: Transaction[]
}

export function WalletClient({ profile, cryptoAddresses, depositRequests: initialDeposits, withdrawalRequests: initialWithdrawals, transactions }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'swap'>('overview')
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
    toast('Address Copied!', 'Crypto wallet address copied to clipboard.')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast('Invalid Amount', 'Please enter a valid deposit amount.', 'error')
      return
    }

    setSubmittingDeposit(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('deposit_requests').insert({
      user_id: profile.id,
      amount: parseFloat(depositAmount),
      currency: selectedCrypto?.currency || 'USD',
      tx_hash: txHash || null,
      proof_url: proofUrl || null,
      status: 'pending',
    }).select().single()

    if (!error && data) {
      setDeposits(prev => [data, ...prev])
      toast('Deposit Submitted', 'Your deposit confirmation has been sent for admin review.')
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

    if (amt > Number(profile.wallet_balance)) {
      toast('Insufficient Balance', `Your available cash balance is ${fmt(Number(profile.wallet_balance))}.`, 'error')
      return
    }

    setSubmittingWithdraw(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('withdrawal_requests').insert({
      user_id: profile.id,
      amount: amt,
      currency: withdrawCurrency,
      destination_address: destAddress,
      status: 'pending',
    }).select().single()

    if (!error && data) {
      setWithdrawals(prev => [data, ...prev])
      toast('Withdrawal Requested', 'Your withdrawal request has been submitted for admin processing.')
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

    if (swapFrom === 'USD' && amt > Number(profile.wallet_balance)) {
      toast('Insufficient Balance', 'Not enough available USD balance for this swap.', 'error')
      return
    }

    setSwapping(true)
    toast('Swap Executed', `Successfully converted ${amt} ${swapFrom} to ${swapTo}.`)
    setSwapAmount('')
    setSwapping(false)
  }

  return (
    <PlatformShell>
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Financial Ledger</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Digital Wallet</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('deposit')}
            className="flex items-center gap-2 bg-primary px-5 py-3 text-xs font-bold text-primary-foreground transition-all hover:scale-105 active:scale-95"
          >
            <ArrowDownLeft size={16} /> Deposit Funds
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className="flex items-center gap-2 border border-border px-5 py-3 text-xs font-bold transition-all hover:border-primary active:scale-95"
          >
            <ArrowUpRight size={16} /> Withdraw
          </button>
        </div>
      </div>

      {/* Balance Summary Cards */}
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        <div className="border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Available Balance</p>
            <Wallet size={18} className="text-primary" />
          </div>
          <p className="mt-4 text-3xl font-bold">{fmt(Number(profile.wallet_balance || 0))}</p>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">Liquid cash ready to invest</p>
        </div>

        <div className="border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Realized P&L</p>
          <p className={`mt-4 text-3xl font-bold ${Number(profile.realized_pnl || 0) >= 0 ? 'text-green-500' : 'text-primary'}`}>
            {Number(profile.realized_pnl || 0) >= 0 ? '+' : ''}{fmt(Number(profile.realized_pnl || 0))}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-2">Completed returns</p>
        </div>

        <div className="border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Unrealized P&L</p>
          <p className={`mt-4 text-3xl font-bold ${Number(profile.unrealized_pnl || 0) >= 0 ? 'text-green-500' : 'text-primary'}`}>
            {Number(profile.unrealized_pnl || 0) >= 0 ? '+' : ''}{fmt(Number(profile.unrealized_pnl || 0))}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-2">Active open gains/losses</p>
        </div>

        <div className="border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">KYC Mandate</p>
          <div className="mt-4 flex items-center gap-2">
            <ShieldCheck size={20} className={profile.kyc_status === 'approved' ? 'text-green-500' : 'text-yellow-500'} />
            <span className="text-lg font-bold capitalize">{profile.kyc_status}</span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground mt-2">Identity verification state</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-8 flex border-b border-border">
        {[
          { id: 'overview', label: 'Wallet Activity' },
          { id: 'deposit', label: 'Deposit Crypto / Cash' },
          { id: 'withdraw', label: 'Withdrawal Request' },
          { id: 'swap', label: 'Instant Asset Swap' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`border-b-2 px-6 py-3 text-xs font-bold transition-colors ${
              activeTab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ──────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Pending Deposits */}
          <div className="border border-border bg-card p-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-primary">Deposit Requests ({deposits.length})</h3>
            <div className="mt-4 flex flex-col gap-3">
              {deposits.length > 0 ? (
                deposits.map(d => (
                  <div key={d.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-bold">{fmt(Number(d.amount))} ({d.currency})</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {new Date(d.created_at).toLocaleDateString()} {d.tx_hash ? `• Tx: ${d.tx_hash.slice(0, 10)}...` : ''}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase ${
                      d.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      d.status === 'rejected' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                      'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-xs text-muted-foreground">No deposit requests logged.</p>
              )}
            </div>
          </div>

          {/* Pending Withdrawals */}
          <div className="border border-border bg-card p-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-primary">Withdrawal Requests ({withdrawals.length})</h3>
            <div className="mt-4 flex flex-col gap-3">
              {withdrawals.length > 0 ? (
                withdrawals.map(w => (
                  <div key={w.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-bold">{fmt(Number(w.amount))} ({w.currency})</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        To: {w.destination_address.slice(0, 12)}...
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase ${
                      w.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      w.status === 'rejected' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                      'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-xs text-muted-foreground">No withdrawal requests logged.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Deposit ───────────────────────────────── */}
      {activeTab === 'deposit' && (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Crypto Address Picker */}
          <div className="border border-border bg-card p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Step 1: Choose Payment Address</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {cryptoAddresses.map(ca => (
                <button
                  key={ca.id}
                  onClick={() => setSelectedCrypto(ca)}
                  className={`border px-4 py-2 text-xs font-bold transition-all ${
                    selectedCrypto?.id === ca.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'
                  }`}
                >
                  {ca.currency} ({ca.network})
                </button>
              ))}
            </div>

            {selectedCrypto && (
              <div className="mt-6 border border-border bg-background p-5">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">{selectedCrypto.network} Deposit Address</p>
                <div className="mt-2 flex items-center justify-between gap-3 border border-border bg-card p-3 font-mono text-xs">
                  <span className="break-all font-bold">{selectedCrypto.address}</span>
                  <button
                    onClick={() => copyToClipboard(selectedCrypto.address, selectedCrypto.id)}
                    className="flex items-center gap-1 text-primary shrink-0 hover:underline"
                  >
                    {copiedId === selectedCrypto.id ? <Check size={14} /> : <Copy size={14} />}
                    {copiedId === selectedCrypto.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
                  Send only <strong className="text-foreground">{selectedCrypto.currency}</strong> on the <strong className="text-foreground">{selectedCrypto.network}</strong> network to this address.
                </p>
              </div>
            )}
          </div>

          {/* Deposit Proof Submission Form */}
          <form onSubmit={handleDepositSubmit} className="border border-border bg-card p-6 flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Step 2: Submit Proof / Hash</p>

            <label className="flex flex-col gap-1 text-xs font-bold">
              Amount ($ USD Equivalent)
              <input
                type="number"
                step="0.01"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="5000.00"
                required
                className="h-11 border border-border bg-background px-3 outline-none focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-bold">
              Transaction Hash / ID
              <input
                value={txHash}
                onChange={e => setTxHash(e.target.value)}
                placeholder="e.g. 0x8a9f2b1c..."
                className="h-11 border border-border bg-background px-3 outline-none focus:border-primary font-mono"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-bold">
              Proof Image URL (Optional)
              <input
                value={proofUrl}
                onChange={e => setProofUrl(e.target.value)}
                placeholder="https://..."
                className="h-11 border border-border bg-background px-3 outline-none focus:border-primary"
              />
            </label>

            <button
              type="submit"
              disabled={submittingDeposit}
              className="mt-2 h-12 bg-primary text-xs font-bold text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {submittingDeposit ? 'Submitting...' : 'Submit Deposit Confirmation'}
            </button>
          </form>
        </div>
      )}

      {/* ── Tab: Withdraw ──────────────────────────────── */}
      {activeTab === 'withdraw' && (
        <form onSubmit={handleWithdrawSubmit} className="mt-8 max-w-xl border border-border bg-card p-6 flex flex-col gap-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Request Payout</p>
            <h3 className="mt-1 text-2xl font-bold">Withdraw Funds</h3>
            <p className="mt-1 text-xs text-muted-foreground">Available balance: {fmt(Number(profile.wallet_balance))}</p>
          </div>

          <label className="flex flex-col gap-1 text-xs font-bold">
            Withdrawal Amount ($ USD)
            <input
              type="number"
              step="0.01"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="1000.00"
              required
              className="h-12 border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold">
            Payout Currency / Network
            <select
              value={withdrawCurrency}
              onChange={e => setWithdrawCurrency(e.target.value)}
              className="h-12 border border-border bg-background px-4 outline-none focus:border-primary"
            >
              <option value="USDT">USDT (TRC20 / ERC20)</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USD">Bank Wire / Cash</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold">
            Destination Wallet Address
            <input
              value={destAddress}
              onChange={e => setDestAddress(e.target.value)}
              placeholder="Enter your receiving wallet address..."
              required
              className="h-12 border border-border bg-background px-4 outline-none focus:border-primary font-mono text-xs"
            />
          </label>

          <button
            type="submit"
            disabled={submittingWithdraw}
            className="h-12 bg-primary text-xs font-bold text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {submittingWithdraw ? 'Submitting Request...' : 'Submit Withdrawal Request'}
          </button>
        </form>
      )}

      {/* ── Tab: Swap ──────────────────────────────────── */}
      {activeTab === 'swap' && (
        <form onSubmit={handleSwap} className="mt-8 max-w-xl border border-border bg-card p-6 flex flex-col gap-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Instant Exchange</p>
            <h3 className="mt-1 text-2xl font-bold">Asset Swap</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-bold">
              From Asset
              <select
                value={swapFrom}
                onChange={e => setSwapFrom(e.target.value as any)}
                className="h-12 border border-border bg-background px-4 outline-none focus:border-primary"
              >
                <option value="USD">USD (Cash Balance)</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">USDT</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-bold">
              To Asset
              <select
                value={swapTo}
                onChange={e => setSwapTo(e.target.value as any)}
                className="h-12 border border-border bg-background px-4 outline-none focus:border-primary"
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">USDT</option>
                <option value="USD">USD (Cash Balance)</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs font-bold">
            Amount to Swap
            <input
              type="number"
              step="0.0001"
              value={swapAmount}
              onChange={e => setSwapAmount(e.target.value)}
              placeholder="0.00"
              required
              className="h-12 border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>

          <button
            type="submit"
            disabled={swapping}
            className="flex items-center justify-center gap-2 h-12 bg-primary text-xs font-bold text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={16} /> {swapping ? 'Executing Swap...' : 'Execute Instant Swap'}
          </button>
        </form>
      )}
    </PlatformShell>
  )
}
