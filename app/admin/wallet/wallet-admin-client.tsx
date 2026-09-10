'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Plus, Edit2, Wallet, Lock, ShieldAlert } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import type { DepositRequest, WithdrawalRequest, CryptoAddress, Profile } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

interface Props {
  depositRequests: DepositRequest[]
  withdrawalRequests: WithdrawalRequest[]
  cryptoAddresses: CryptoAddress[]
  profiles: Partial<Profile>[]
}

export function AdminWalletClient({ depositRequests: initialDeposits, withdrawalRequests: initialWithdrawals, cryptoAddresses: initialCrypto, profiles: initialProfiles }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'crypto' | 'balances'>('deposits')

  const [deposits, setDeposits] = useState<DepositRequest[]>(initialDeposits)
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(initialWithdrawals)
  const [cryptoAddresses, setCryptoAddresses] = useState<CryptoAddress[]>(initialCrypto)
  const [profiles, setProfiles] = useState<Partial<Profile>[]>(initialProfiles)

  // Crypto address form & PIN state
  const [currency, setCurrency] = useState('')
  const [network, setNetwork] = useState('')
  const [address, setAddress] = useState('')
  const [editingCryptoId, setEditingCryptoId] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  
  // Admin PIN Authorization
  const [showPinModal, setShowPinModal] = useState(false)
  const [adminPin, setAdminPin] = useState('')
  const [pinError, setPinError] = useState('')

  // User balance modal
  const [selectedUser, setSelectedUser] = useState<Partial<Profile> | null>(null)
  const [editBalance, setEditBalance] = useState('')
  const [editRealizedPnl, setEditRealizedPnl] = useState('')
  const [editUnrealizedPnl, setEditUnrealizedPnl] = useState('')
  const [savingBalance, setSavingBalance] = useState(false)

  // Deposit Actions
  const handleApproveDeposit = async (dep: DepositRequest) => {
    const supabase = createClient()
    const { error } = await supabase.from('deposit_requests').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', dep.id)
    if (!error) {
      const { data: userProf } = await supabase.from('profiles').select('wallet_balance').eq('id', dep.user_id).single()
      const current = Number(userProf?.wallet_balance || 0)
      const newBal = current + Number(dep.amount)

      await supabase.from('profiles').update({ wallet_balance: newBal }).eq('id', dep.user_id)
      await supabase.from('transactions').insert({
        user_id: dep.user_id,
        type: 'deposit',
        amount: dep.amount,
        description: `Approved deposit (${dep.currency})`,
      })

      setDeposits(prev => prev.map(d => d.id === dep.id ? { ...d, status: 'approved' } : d))
      toast('Deposit Approved!', `Credited ${fmt(Number(dep.amount))} to user wallet balance.`)
      router.refresh()
    }
  }

  const handleRejectDeposit = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('deposit_requests').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', id)
    if (!error) {
      setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected' } : d))
      toast('Deposit Rejected', 'Deposit request marked as rejected.', 'error')
    }
  }

  // Withdrawal Actions
  const handleApproveWithdrawal = async (w: WithdrawalRequest) => {
    const supabase = createClient()
    const { error } = await supabase.from('withdrawal_requests').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', w.id)
    if (!error) {
      const { data: userProf } = await supabase.from('profiles').select('wallet_balance').eq('id', w.user_id).single()
      const current = Number(userProf?.wallet_balance || 0)
      const newBal = Math.max(0, current - Number(w.amount))

      await supabase.from('profiles').update({ wallet_balance: newBal }).eq('id', w.user_id)
      await supabase.from('transactions').insert({
        user_id: w.user_id,
        type: 'withdrawal',
        amount: -Number(w.amount),
        description: `Approved withdrawal to ${w.destination_address.slice(0, 10)}...`,
      })

      setWithdrawals(prev => prev.map(item => item.id === w.id ? { ...item, status: 'approved' } : item))
      toast('Withdrawal Approved!', `Processed payout of ${fmt(Number(w.amount))}.`)
      router.refresh()
    }
  }

  const handleRejectWithdrawal = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('withdrawal_requests').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', id)
    if (!error) {
      setWithdrawals(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item))
      toast('Withdrawal Rejected', 'Withdrawal request marked as rejected.', 'error')
    }
  }

  // Initiate Crypto Address Save (Triggers PIN Verification Modal)
  const handleInitiateCryptoSave = (e: React.FormEvent) => {
    e.preventDefault()
    setAdminPin('')
    setPinError('')
    setShowPinModal(true)
  }

  // Execute Confirmed Crypto Address Save After Admin PIN Check
  const handleConfirmPinAndSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminPin || adminPin.trim().length < 4) {
      setPinError('Please enter a valid 4-digit Admin Security PIN.')
      return
    }

    const supabase = createClient()
    let query = supabase.from('crypto_addresses')
    
    let result
    if (editingCryptoId) {
      result = await query.update({
        currency: currency.toUpperCase(),
        network,
        address,
        is_active: true,
        updated_at: new Date().toISOString()
      }).eq('id', editingCryptoId).select().single()
    } else {
      result = await query.upsert({
        currency: currency.toUpperCase(),
        network,
        address,
        is_active: true,
      }).select().single()
    }

    const { data, error } = result

    if (!error && data) {
      setCryptoAddresses(prev => {
        const filtered = prev.filter(c => c.id !== data.id && c.currency !== data.currency)
        return [...filtered, data]
      })
      setShowAddressForm(false)
      setShowPinModal(false)
      setEditingCryptoId(null)
      setCurrency('')
      setNetwork('')
      setAddress('')
      toast('Deposit Address Saved', `Successfully updated ${data.currency} deposit wallet.`)
      router.refresh()
    } else if (error) {
      setPinError(error.message)
    }
  }

  // User Balance Actions
  const handleSaveUserBalance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser?.id) return
    setSavingBalance(true)

    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({
      wallet_balance: parseFloat(editBalance || '0'),
      realized_pnl: parseFloat(editRealizedPnl || '0'),
      unrealized_pnl: parseFloat(editUnrealizedPnl || '0'),
    }).eq('id', selectedUser.id)

    if (!error) {
      setProfiles(prev => prev.map(p => p.id === selectedUser.id ? {
        ...p,
        wallet_balance: parseFloat(editBalance || '0'),
        realized_pnl: parseFloat(editRealizedPnl || '0'),
        unrealized_pnl: parseFloat(editUnrealizedPnl || '0'),
      } : p))
      setSelectedUser(null)
      toast('User Balance Updated', 'Saved new balance and P&L for user.')
      router.refresh()
    }
    setSavingBalance(false)
  }

  return (
    <PlatformShell admin>
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Financial Operations</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Wallet Command Center</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex border-b border-border overflow-x-auto">
        {[
          { id: 'deposits', label: `Pending Deposits (${deposits.filter(d => d.status === 'pending').length})` },
          { id: 'withdrawals', label: `Pending Withdrawals (${withdrawals.filter(w => w.status === 'pending').length})` },
          { id: 'crypto', label: 'Crypto Deposit Addresses' },
          { id: 'balances', label: 'User Balances & P&L' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`border-b-2 px-6 py-3 text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Deposits ──────────────────────────────── */}
      {activeTab === 'deposits' && (
        <div className="mt-8 border border-border bg-card">
          {deposits.length > 0 ? (
            deposits.map(d => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5 last:border-0">
                <div>
                  <p className="text-sm font-bold">{d.user?.full_name || d.user?.email || 'User'} ({fmt(Number(d.amount))})</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Currency: {d.currency} • Date: {new Date(d.created_at).toLocaleString()}
                  </p>
                  {d.tx_hash && <p className="font-mono text-[10px] text-primary mt-1">Hash: {d.tx_hash}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase ${
                    d.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                    d.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {d.status}
                  </span>
                  {d.status === 'pending' && (
                    <>
                      <button onClick={() => handleApproveDeposit(d)} className="flex items-center gap-1 bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700">
                        <Check size={14} /> Approve & Credit
                      </button>
                      <button onClick={() => handleRejectDeposit(d.id)} className="flex items-center gap-1 border border-border px-3 py-1.5 text-xs font-bold hover:border-destructive hover:text-destructive">
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="py-12 text-center text-xs text-muted-foreground">No deposit requests pending.</p>
          )}
        </div>
      )}

      {/* ── Tab: Withdrawals ───────────────────────────── */}
      {activeTab === 'withdrawals' && (
        <div className="mt-8 border border-border bg-card">
          {withdrawals.length > 0 ? (
            withdrawals.map(w => (
              <div key={w.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5 last:border-0">
                <div>
                  <p className="text-sm font-bold">{w.user?.full_name || w.user?.email || 'User'} ({fmt(Number(w.amount))})</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Destination: {w.destination_address} • Payout: {w.currency}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase ${
                    w.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                    w.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {w.status}
                  </span>
                  {w.status === 'pending' && (
                    <>
                      <button onClick={() => handleApproveWithdrawal(w)} className="flex items-center gap-1 bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700">
                        <Check size={14} /> Approve & Debit
                      </button>
                      <button onClick={() => handleRejectWithdrawal(w.id)} className="flex items-center gap-1 border border-border px-3 py-1.5 text-xs font-bold hover:border-destructive hover:text-destructive">
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="py-12 text-center text-xs text-muted-foreground">No withdrawal requests pending.</p>
          )}
        </div>
      )}

      {/* ── Tab: Crypto Deposit Addresses ───────────────── */}
      {activeTab === 'crypto' && (
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-mono text-xs uppercase tracking-widest text-primary">Global Deposit Wallets</h3>
            <button
              onClick={() => {
                setEditingCryptoId(null)
                setCurrency('')
                setNetwork('')
                setAddress('')
                setShowAddressForm(!showAddressForm)
              }}
              className="flex items-center gap-2 border border-border px-4 py-2 text-xs font-bold hover:border-primary"
            >
              <Plus size={15} /> Add New Address
            </button>
          </div>

          {showAddressForm && (
            <form onSubmit={handleInitiateCryptoSave} className="border border-border bg-card p-6 grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3 flex justify-between items-center border-b border-border pb-3">
                <h4 className="text-sm font-bold">{editingCryptoId ? 'Edit Deposit Address' : 'Add Deposit Address'}</h4>
                <button type="button" onClick={() => setShowAddressForm(false)}><X size={16} /></button>
              </div>

              <label className="flex flex-col gap-1 text-xs font-bold">
                Currency (e.g. BTC, ETH, USDT)
                <input value={currency} onChange={e => setCurrency(e.target.value)} required className="h-10 border border-border bg-background px-3 uppercase" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold">
                Network Name (e.g. TRC20, ERC20, Bitcoin)
                <input value={network} onChange={e => setNetwork(e.target.value)} required className="h-10 border border-border bg-background px-3" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold sm:col-span-3">
                Deposit Wallet Address
                <input value={address} onChange={e => setAddress(e.target.value)} required className="h-10 border border-border bg-background px-3 font-mono text-xs" />
              </label>
              
              <div className="sm:col-span-3 flex gap-3">
                <button type="submit" className="bg-primary px-6 py-3 text-xs font-bold text-primary-foreground">
                  {editingCryptoId ? 'Update Address' : 'Save Address'}
                </button>
                <button type="button" onClick={() => setShowAddressForm(false)} className="border border-border px-4 py-3 text-xs font-bold">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {cryptoAddresses.map(ca => (
              <div key={ca.id} className="border border-border bg-card p-5 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-primary">{ca.currency}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{ca.network}</span>
                  </div>
                  <p className="mt-3 font-mono text-xs break-all bg-background border border-border p-3">{ca.address}</p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setEditingCryptoId(ca.id)
                      setCurrency(ca.currency)
                      setNetwork(ca.network)
                      setAddress(ca.address)
                      setShowAddressForm(true)
                    }}
                    className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-bold hover:border-primary hover:text-primary"
                  >
                    <Edit2 size={13} /> Edit / Update Address
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Admin PIN Verification Modal */}
          {showPinModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <form onSubmit={handleConfirmPinAndSaveAddress} className="w-full max-w-sm border border-border bg-card p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Lock size={18} className="text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Admin PIN Required</h3>
                  </div>
                  <button type="button" onClick={() => setShowPinModal(false)}><X size={18} /></button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Enter your Admin Security PIN to authorize updating the public deposit address for <strong style={{ color: '#ffffff' }}>{currency}</strong>.
                </p>

                <label className="flex flex-col gap-1 text-xs font-bold">
                  Security PIN
                  <input
                    type="password"
                    maxLength={6}
                    value={adminPin}
                    onChange={e => setAdminPin(e.target.value)}
                    placeholder="Enter 4-digit Admin PIN"
                    required
                    autoFocus
                    className="h-11 border border-border bg-background px-3 font-mono text-center text-lg tracking-[0.5em] outline-none focus:border-primary"
                  />
                </label>

                {pinError && (
                  <p className="text-xs text-primary font-bold">{pinError}</p>
                )}

                <div className="flex gap-2 mt-2">
                  <button type="submit" className="bg-primary px-5 py-3 text-xs font-bold text-primary-foreground flex-1">
                    Authorize & Save
                  </button>
                  <button type="button" onClick={() => setShowPinModal(false)} className="border border-border px-4 py-3 text-xs font-bold">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: User Balances & P&L ───────────────────── */}
      {activeTab === 'balances' && (
        <div className="mt-8 border border-border bg-card">
          {profiles.map(p => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5 last:border-0">
              <div>
                <p className="text-sm font-bold">{p.full_name || p.email}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{p.email}</p>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">Balance</p>
                  <p className="text-sm font-bold">{fmt(Number(p.wallet_balance || 0))}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">Realized P&L</p>
                  <p className={`text-sm font-bold ${Number(p.realized_pnl || 0) >= 0 ? 'text-green-500' : 'text-primary'}`}>
                    {fmt(Number(p.realized_pnl || 0))}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(p)
                    setEditBalance(String(p.wallet_balance || 0))
                    setEditRealizedPnl(String(p.realized_pnl || 0))
                    setEditUnrealizedPnl(String(p.unrealized_pnl || 0))
                  }}
                  className="flex items-center gap-1 border border-border px-3 py-1 text-xs font-bold hover:border-primary"
                >
                  <Edit2 size={13} /> Edit Balances
                </button>
              </div>
            </div>
          ))}

          {/* Balance Edit Modal */}
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <form onSubmit={handleSaveUserBalance} className="w-full max-w-md border border-border bg-card p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Edit User Balance & P&L</h3>
                  <button type="button" onClick={() => setSelectedUser(null)}><X size={18} /></button>
                </div>
                <p className="text-xs text-muted-foreground">{selectedUser.full_name || selectedUser.email}</p>

                <label className="flex flex-col gap-1 text-xs font-bold">
                  Wallet Balance ($ USD)
                  <input type="number" step="0.01" value={editBalance} onChange={e => setEditBalance(e.target.value)} required className="h-10 border border-border bg-background px-3" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Realized P&L ($)
                  <input type="number" step="0.01" value={editRealizedPnl} onChange={e => setEditRealizedPnl(e.target.value)} required className="h-10 border border-border bg-background px-3" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold">
                  Unrealized P&L ($)
                  <input type="number" step="0.01" value={editUnrealizedPnl} onChange={e => setEditUnrealizedPnl(e.target.value)} required className="h-10 border border-border bg-background px-3" />
                </label>

                <div className="flex gap-2 mt-2">
                  <button type="submit" disabled={savingBalance} className="bg-primary px-6 py-3 text-xs font-bold text-primary-foreground flex-1">
                    {savingBalance ? 'Saving...' : 'Save Adjustments'}
                  </button>
                  <button type="button" onClick={() => setSelectedUser(null)} className="border border-border px-4 py-3 text-xs font-bold">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </PlatformShell>
  )
}
