'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRound, Search, ShieldCheck, AlertCircle } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import type { Profile } from '@/types'

export function AdminUsersClient({ users: initial }: { users: Profile[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<Profile[]>(initial)
  const [search, setSearch] = useState('')

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as 'admin' | 'user' } : u))
      toast('Role Updated', `Changed user role to ${newRole}.`)
      router.refresh()
    }
  }

  const handleToggleKycMandated = async (userId: string, currentMandated: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ is_kyc_mandated: !currentMandated }).eq('id', userId)
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_kyc_mandated: !currentMandated } : u))
      toast('KYC Mandate Updated', `Mandatory KYC is now ${!currentMandated ? 'ENFORCED' : 'OFF'} for this user.`)
      router.refresh()
    }
  }

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

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

      <div className="mt-8 border border-border bg-card">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-border p-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>User</span>
          <span>KYC Status</span>
          <span>KYC Mandate</span>
          <span>VIP Tier</span>
          <span className="text-right">Role</span>
        </div>

        {filtered.map(u => (
          <div key={u.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border p-4 last:border-0 hover:bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center bg-foreground font-mono text-xs text-background">
                {(u.full_name || u.email).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold">{u.full_name || 'Unnamed'}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${u.kyc_status === 'approved' ? 'bg-green-500/10 text-green-600' : u.kyc_status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-muted text-muted-foreground'}`}>
              {u.kyc_status.replace('_', ' ')}
            </span>
            <button
              onClick={() => handleToggleKycMandated(u.id, !!u.is_kyc_mandated)}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase border ${u.is_kyc_mandated ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground'}`}
            >
              {u.is_kyc_mandated ? 'MANDATED' : 'OPTIONAL'}
            </button>
            <span className="text-xs font-bold capitalize">{u.vip_tier}</span>
            <button
              onClick={() => handleToggleRole(u.id, u.role)}
              className={`px-3 py-1 text-xs font-bold ${u.role === 'admin' ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary'}`}
            >
              {u.role}
            </button>
          </div>
        ))}
      </div>
    </PlatformShell>
  )
}
