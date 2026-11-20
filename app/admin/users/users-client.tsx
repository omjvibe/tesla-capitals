'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Pencil, DollarSign, Users } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { useToast } from '@/components/ui/toast'
import type { Profile, VipTier, KycStatus, UserRole } from '@/types'

const VIP_TIERS: VipTier[] = ['standard', 'bronze', 'silver', 'gold', 'platinum']
const KYC_STATUSES: KycStatus[] = ['not_started', 'pending', 'approved', 'rejected']
const ROLES: UserRole[] = ['user', 'admin']

function kycBadgeClass(status: KycStatus) {
  switch (status) {
    case 'approved': return 'bg-green-500/10 text-green-500'
    case 'pending': return 'bg-yellow-500/10 text-yellow-500'
    case 'rejected': return 'bg-red-500/10 text-red-500'
    default: return 'bg-muted text-muted-foreground'
  }
}

function vipBadgeClass(tier: VipTier) {
  switch (tier) {
    case 'platinum': return 'text-purple-400'
    case 'gold': return 'text-yellow-400'
    case 'silver': return 'text-gray-300'
    case 'bronze': return 'text-orange-400'
    default: return 'text-muted-foreground'
  }
}

export function AdminUsersClient({ users: initial }: { users: Profile[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<Profile[]>(initial)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state for edit modal
  const [form, setForm] = useState({
    full_name: '',
    wallet_balance: 0,
    btc_balance: 0,
    eth_balance: 0,
    usdt_balance: 0,
    realized_pnl: 0,
    unrealized_pnl: 0,
    vip_tier: 'standard' as VipTier,
    vip_expires_at: '',
    kyc_status: 'not_started' as KycStatus,
    role: 'user' as UserRole,
    is_kyc_mandated: false,
  })

  const openEdit = (u: Profile) => {
    setForm({
      full_name: u.full_name || '',
      wallet_balance: u.wallet_balance || 0,
      btc_balance: u.btc_balance || 0,
      eth_balance: u.eth_balance || 0,
      usdt_balance: u.usdt_balance || 0,
      realized_pnl: u.realized_pnl || 0,
      unrealized_pnl: u.unrealized_pnl || 0,
      vip_tier: u.vip_tier,
      vip_expires_at: u.vip_expires_at ? u.vip_expires_at.split('T')[0] : '',
      kyc_status: u.kyc_status,
      role: u.role,
      is_kyc_mandated: !!u.is_kyc_mandated,
    })
    setEditing(u)
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          userId: editing.id,
          payload: {
            ...form,
            vip_expires_at: form.vip_expires_at || null,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')

      setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, ...data.profile } : u))
      toast('Profile Updated', `Successfully updated ${form.full_name || editing.email}.`)
      setEditing(null)
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      toast('Update Failed', message)
    } finally {
      setSaving(false)
    }
  }

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalBalance = users.reduce((sum, u) => sum + (u.wallet_balance || 0), 0)
  const adminCount = users.filter(u => u.role === 'admin').length

  return (
    <PlatformShell admin>
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">User management</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Users ({users.length})</h1>
        </div>
        <div className="flex items-center gap-2 border border-border bg-card px-3 py-2 text-xs">
          <Search size={15} className="text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="border border-border bg-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total Users</p>
          <p className="mt-1 text-2xl font-bold">{users.length}</p>
        </div>
        <div className="border border-border bg-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Admins</p>
          <p className="mt-1 text-2xl font-bold">{adminCount}</p>
        </div>
        <div className="border border-border bg-card p-4 col-span-2 sm:col-span-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total Balances</p>
          <p className="mt-1 text-2xl font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Users table */}
      <div className="mt-8 border border-border bg-card overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 border-b border-border p-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>User</span>
            <span>Balance</span>
            <span>KYC</span>
            <span>VIP</span>
            <span>Role</span>
            <span className="text-right">Actions</span>
          </div>

          {filtered.map(u => (
            <div key={u.id} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 border-b border-border p-4 last:border-0 hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center bg-foreground font-mono text-xs text-background">
                  {(u.full_name || u.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{u.full_name || 'Unnamed'}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
              </div>

              <span className="text-sm font-mono font-bold tabular-nums">
                ${(u.wallet_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>

              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${kycBadgeClass(u.kyc_status)}`}>
                {u.kyc_status.replace('_', ' ')}
              </span>

              <span className={`text-xs font-bold uppercase ${vipBadgeClass(u.vip_tier)}`}>
                {u.vip_tier}
              </span>

              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                {u.role}
              </span>

              <button
                onClick={() => openEdit(u)}
                className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-bold uppercase hover:border-primary hover:text-primary transition-colors"
              >
                <Pencil size={12} />
                Edit
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Users size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setEditing(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>

            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Edit User</p>
            <h2 className="mt-2 text-xl font-bold">{editing.full_name || editing.email}</h2>
            <p className="text-xs text-muted-foreground">{editing.email} &middot; ID: {editing.id.slice(0, 8)}...</p>

            <div className="mt-6 space-y-6">
              {/* Identity */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Identity</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Full Name</span>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Email</span>
                    <input
                      type="text"
                      value={editing.email}
                      disabled
                      className="mt-1 block w-full border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                    />
                  </label>
                </div>
              </div>

              {/* Balances */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <DollarSign size={12} /> Balances
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Wallet Balance (USD)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.wallet_balance}
                      onChange={e => setForm(f => ({ ...f, wallet_balance: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">BTC Balance</span>
                    <input
                      type="number"
                      step="0.00000001"
                      value={form.btc_balance}
                      onChange={e => setForm(f => ({ ...f, btc_balance: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">ETH Balance</span>
                    <input
                      type="number"
                      step="0.00000001"
                      value={form.eth_balance}
                      onChange={e => setForm(f => ({ ...f, eth_balance: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">USDT Balance</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.usdt_balance}
                      onChange={e => setForm(f => ({ ...f, usdt_balance: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:border-primary"
                    />
                  </label>
                </div>
              </div>

              {/* P&L */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Profit & Loss</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Realized PnL</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.realized_pnl}
                      onChange={e => setForm(f => ({ ...f, realized_pnl: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Unrealized PnL</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.unrealized_pnl}
                      onChange={e => setForm(f => ({ ...f, unrealized_pnl: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:border-primary"
                    />
                  </label>
                </div>
              </div>

              {/* Status & Tier */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Status & Access</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">VIP Tier</span>
                    <select
                      value={form.vip_tier}
                      onChange={e => setForm(f => ({ ...f, vip_tier: e.target.value as VipTier }))}
                      className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      {VIP_TIERS.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">VIP Expires At</span>
                    <input
                      type="date"
                      value={form.vip_expires_at}
                      onChange={e => setForm(f => ({ ...f, vip_expires_at: e.target.value }))}
                      className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">KYC Status</span>
                    <select
                      value={form.kyc_status}
                      onChange={e => setForm(f => ({ ...f, kyc_status: e.target.value as KycStatus }))}
                      className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      {KYC_STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Role</span>
                    <select
                      value={form.role}
                      onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                      className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r.toUpperCase()}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="mt-4 flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_kyc_mandated}
                    onChange={e => setForm(f => ({ ...f, is_kyc_mandated: e.target.checked }))}
                    className="size-4 accent-primary"
                  />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">KYC Mandated</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setEditing(null)}
                className="border border-border px-4 py-2 text-xs font-bold uppercase hover:border-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary px-6 py-2 text-xs font-bold uppercase text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PlatformShell>
  )
}
