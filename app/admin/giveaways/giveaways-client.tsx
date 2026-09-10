'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Gift,
  Users,
  DollarSign,
  UserPlus,
  Trash2,
  Trophy,
  ChevronDown,
  ChevronUp,
  Shield,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import type { Giveaway } from '@/types'

interface AdminUser {
  id: string
  full_name: string | null
  email: string | null
  vip_tier: string
}

interface GiveawayWithMeta extends Giveaway {
  entry_count?: number
}

interface ParticipantEntry {
  id: string
  giveaway_id: string
  user_id: string
  entered_at: string
  is_admin_selected: boolean
  paid_amount: number
  profiles?: {
    id: string
    full_name: string | null
    email: string | null
    vip_tier: string
  }
}

interface Props {
  giveaways: GiveawayWithMeta[]
  users: AdminUser[]
}

const VIP_TIERS = ['bronze', 'silver', 'gold', 'platinum']

export function AdminGiveawaysClient({ giveaways: initialGiveaways, users }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [giveaways, setGiveaways] = useState<GiveawayWithMeta[]>(initialGiveaways)
  const [showForm, setShowForm] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [days, setDays] = useState('30')
  const [entryFee, setEntryFee] = useState('0')
  const [maxEntries, setMaxEntries] = useState('')
  const [prizeDescription, setPrizeDescription] = useState('')
  const [prizeValue, setPrizeValue] = useState('')
  const [selectedTiers, setSelectedTiers] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Participant Management Drawer/State
  const [activeGiveawayId, setActiveGiveawayId] = useState<string | null>(null)
  const [participants, setParticipants] = useState<Record<string, ParticipantEntry[]>>({})
  const [loadingParticipants, setLoadingParticipants] = useState<string | null>(null)
  const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState('')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [addingUser, setAddingUser] = useState(false)

  // Load participants for a giveaway
  const toggleParticipants = async (giveawayId: string) => {
    if (activeGiveawayId === giveawayId) {
      setActiveGiveawayId(null)
      return
    }

    setActiveGiveawayId(giveawayId)
    if (!participants[giveawayId]) {
      setLoadingParticipants(giveawayId)
      try {
        const res = await fetch(`/api/admin/giveaways/participants?giveaway_id=${giveawayId}`)
        const data = await res.json()
        if (data.entries) {
          setParticipants(prev => ({ ...prev, [giveawayId]: data.entries }))
        }
      } catch (e) {
        toast('Error', 'Failed to load participants', 'error')
      } finally {
        setLoadingParticipants(null)
      }
    }
  }

  // Handle tier checkbox
  const toggleTier = (tier: string) => {
    setSelectedTiers(prev =>
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    )
  }

  // Create giveaway
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const supabase = createClient()
    const now = new Date()
    const end = new Date(now.getTime() + parseInt(days || '30') * 24 * 60 * 60 * 1000)

    const payload = {
      title,
      description: description || null,
      starts_at: now.toISOString(),
      ends_at: end.toISOString(),
      status: 'active' as const,
      entry_fee: parseFloat(entryFee) || 0,
      max_entries: maxEntries ? parseInt(maxEntries) : null,
      eligible_tiers: selectedTiers.length > 0 ? selectedTiers : null,
      prize_description: prizeDescription || null,
      prize_value: prizeValue ? parseFloat(prizeValue) : null,
    }

    const { data, error } = await supabase
      .from('giveaways')
      .insert(payload)
      .select()
      .single()

    if (error) {
      toast('Creation Failed', error.message, 'error')
    } else if (data) {
      setGiveaways(prev => [{ ...data, entry_count: 0 }, ...prev])
      setShowForm(false)
      setTitle('')
      setDescription('')
      setDays('30')
      setEntryFee('0')
      setMaxEntries('')
      setPrizeDescription('')
      setPrizeValue('')
      setSelectedTiers([])
      toast('Success', 'Giveaway created successfully!')
      router.refresh()
    }
    setSubmitting(false)
  }

  // Admin manually adds a user to giveaway
  const handleAddParticipant = async (giveawayId: string) => {
    if (!selectedUserIdToAdd) {
      toast('Select User', 'Please choose a user to add to the giveaway', 'error')
      return
    }

    setAddingUser(true)
    try {
      const res = await fetch('/api/admin/giveaways/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giveaway_id: giveawayId, user_id: selectedUserIdToAdd }),
      })
      const result = await res.json()

      if (!res.ok) {
        toast('Failed', result.error || 'Could not add user', 'error')
      } else {
        toast('Participant Added', 'User has been selected and enrolled in this giveaway!')
        setParticipants(prev => ({
          ...prev,
          [giveawayId]: [result.entry, ...(prev[giveawayId] || [])],
        }))
        // Increment giveaway count locally
        setGiveaways(prev =>
          prev.map(g => (g.id === giveawayId ? { ...g, entry_count: (g.entry_count || 0) + 1 } : g))
        )
        setSelectedUserIdToAdd('')
        setUserSearchQuery('')
      }
    } catch (e: any) {
      toast('Error', e.message || 'Error adding participant', 'error')
    } finally {
      setAddingUser(false)
    }
  }

  // Admin removes a participant
  const handleRemoveParticipant = async (giveawayId: string, entryId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) return

    try {
      const res = await fetch(`/api/admin/giveaways/participants?entry_id=${entryId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast('Removed', 'Participant removed from giveaway')
        setParticipants(prev => ({
          ...prev,
          [giveawayId]: (prev[giveawayId] || []).filter(e => e.id !== entryId),
        }))
        setGiveaways(prev =>
          prev.map(g => (g.id === giveawayId ? { ...g, entry_count: Math.max(0, (g.entry_count || 0) - 1) } : g))
        )
      } else {
        const d = await res.json()
        toast('Failed', d.error || 'Could not remove participant', 'error')
      }
    } catch (e: any) {
      toast('Error', e.message, 'error')
    }
  }

  // Pick random winner
  const handlePickWinner = async (giveawayId: string) => {
    const supabase = createClient()
    const { data: entries } = await supabase
      .from('giveaway_entries')
      .select('user_id')
      .eq('giveaway_id', giveawayId)

    if (!entries || entries.length === 0) {
      toast('No Entries', 'Cannot select a winner because there are no participants yet.', 'error')
      return
    }

    const randomWinner = entries[Math.floor(Math.random() * entries.length)].user_id
    const { error } = await supabase
      .from('giveaways')
      .update({ winner_id: randomWinner, status: 'ended' })
      .eq('id', giveawayId)

    if (error) {
      toast('Error', error.message, 'error')
      return
    }

    setGiveaways(prev =>
      prev.map(g => (g.id === giveawayId ? { ...g, winner_id: randomWinner, status: 'ended' } : g))
    )
    toast('Winner Selected!', `Winner assigned: ${randomWinner}`)
    router.refresh()
  }

  // Pick specific participant as winner
  const handleSelectSpecificWinner = async (giveawayId: string, winnerId: string, winnerName: string) => {
    if (!confirm(`Select ${winnerName} as the official winner of this giveaway?`)) return
    const supabase = createClient()
    const { error } = await supabase
      .from('giveaways')
      .update({ winner_id: winnerId, status: 'ended' })
      .eq('id', giveawayId)

    if (error) {
      toast('Error', error.message, 'error')
      return
    }

    setGiveaways(prev =>
      prev.map(g => (g.id === giveawayId ? { ...g, winner_id: winnerId, status: 'ended' } : g))
    )
    toast('Winner Declared', `${winnerName} has been declared the official winner!`)
    router.refresh()
  }

  // Filter users for picker
  const filteredUsers = users.filter(u => {
    const query = userSearchQuery.toLowerCase()
    return (
      (u.full_name && u.full_name.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query))
    )
  })

  return (
    <PlatformShell admin>
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Promotions & Rewards</span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Enhanced v2.0</span>
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Giveaways ({giveaways.length})</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure free or paid entry promotions, define VIP restrictions, and handpick participants.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 border border-primary bg-primary/10 px-5 py-3 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white"
        >
          <Plus size={16} /> {showForm ? 'Close Form' : 'Create New Giveaway'}
        </button>
      </div>

      {/* Creation Modal / Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mt-8 border border-border bg-card p-6 shadow-xl flex flex-col gap-5">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-primary flex items-center gap-2">
              <Gift size={16} /> New Giveaway Promotion Setup
            </p>
            <span className="text-[11px] text-muted-foreground">Supports Free & Fee-Based Giveaways</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-bold">
              Giveaway Title *
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder="e.g. Cybertruck Cyberquad VIP Drop"
                className="h-10 border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold">
              Duration (Days) *
              <input
                type="number"
                min="1"
                max="365"
                value={days}
                onChange={e => setDays(e.target.value)}
                required
                className="h-10 border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-xs font-bold">
              Entry Fee ($ USD)
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={entryFee}
                  onChange={e => setEntryFee(e.target.value)}
                  placeholder="0 for FREE"
                  className="h-10 w-full border border-border bg-background pl-8 pr-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <span className="text-[10px] font-normal text-muted-foreground">Set to 0 for completely free entry.</span>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold">
              Max Entries (Cap)
              <input
                type="number"
                min="1"
                value={maxEntries}
                onChange={e => setMaxEntries(e.target.value)}
                placeholder="Unlimited if blank"
                className="h-10 border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
              />
              <span className="text-[10px] font-normal text-muted-foreground">Leave empty for unlimited participants.</span>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold">
              Est. Prize Value ($ USD)
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={prizeValue}
                  onChange={e => setPrizeValue(e.target.value)}
                  placeholder="e.g. 15000"
                  className="h-10 w-full border border-border bg-background pl-8 pr-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <span className="text-[10px] font-normal text-muted-foreground">Optional approximate reward value.</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold">Eligible VIP Tiers (Leave all unchecked for open to all)</label>
            <div className="flex flex-wrap gap-3 pt-1">
              {VIP_TIERS.map(tier => {
                const checked = selectedTiers.includes(tier)
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => toggleTier(tier)}
                    className={`flex items-center gap-2 border px-3 py-1.5 text-xs font-semibold uppercase transition-all ${
                      checked
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-foreground'
                    }`}
                  >
                    <span className={`size-2 rounded-full ${checked ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    {tier}
                  </button>
                )
              })}
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-bold">
            Prize Headline / Details
            <input
              value={prizeDescription}
              onChange={e => setPrizeDescription(e.target.value)}
              placeholder="e.g. Tesla Model 3 Performance or $50,000 Cash Transfer"
              className="h-10 border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-bold">
            Description & Terms
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide participant instructions, drawing dates, delivery method, etc."
              className="border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary px-8 py-3 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Publish Giveaway'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-border px-6 py-3 text-xs font-bold hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Giveaways List */}
      <div className="mt-8 space-y-4">
        {giveaways.map(g => {
          const isExpanded = activeGiveawayId === g.id
          const currentParticipants = participants[g.id] || []
          const isLoadingThis = loadingParticipants === g.id
          const isFree = Number(g.entry_fee || 0) === 0
          const fee = Number(g.entry_fee || 0)

          return (
            <div key={g.id} className="border border-border bg-card transition-all">
              {/* Card Header */}
              <div className="p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-bold">{g.title}</h3>
                      {isFree ? (
                        <span className="rounded bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase text-emerald-500">
                          FREE ENTRY
                        </span>
                      ) : (
                        <span className="rounded bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase text-amber-500">
                          ${fee.toFixed(2)} ENTRY FEE
                        </span>
                      )}
                      <span
                        className={`rounded px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase ${
                          g.status === 'active'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {g.status}
                      </span>
                      {g.eligible_tiers && g.eligible_tiers.length > 0 && (
                        <span className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase">
                          Tiers: {g.eligible_tiers.join(', ')}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{g.description}</p>

                    <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-primary" />
                        <strong className="text-foreground">{g.entry_count ?? 0}</strong>
                        {g.max_entries ? ` / ${g.max_entries}` : ''} participants
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} /> Ends {new Date(g.ends_at).toLocaleDateString()}
                      </span>
                      {g.prize_value && (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <Trophy size={14} /> ${Number(g.prize_value).toLocaleString()} Value
                        </span>
                      )}
                      {g.winner_id && (
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <CheckCircle2 size={14} /> Winner: {g.winner_id.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => toggleParticipants(g.id)}
                      className={`flex items-center gap-1.5 border px-4 py-2.5 text-xs font-bold transition-all ${
                        isExpanded
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:border-primary'
                      }`}
                    >
                      <Users size={14} />
                      Manage Participants ({g.entry_count ?? 0})
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {g.status === 'active' && !g.winner_id && (
                      <button
                        onClick={() => handlePickWinner(g.id)}
                        className="flex items-center gap-1.5 bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90"
                      >
                        <Trophy size={14} />
                        Pick Random Winner
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Participant Management Drawer */}
              {isExpanded && (
                <div className="border-t border-border bg-background/50 p-6 space-y-6">
                  {/* Admin User Selection Bar */}
                  <div className="rounded border border-primary/20 bg-primary/5 p-4">
                    <p className="font-mono text-xs uppercase tracking-wider text-primary font-bold flex items-center gap-2">
                      <UserPlus size={16} /> Admin Participant Selection
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Manually select and enroll any registered user into this giveaway (bypasses fee, marked as Admin-Selected).
                    </p>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search registered user by name or email..."
                          value={userSearchQuery}
                          onChange={e => setUserSearchQuery(e.target.value)}
                          className="h-10 w-full border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                        />
                      </div>

                      <select
                        value={selectedUserIdToAdd}
                        onChange={e => setSelectedUserIdToAdd(e.target.value)}
                        className="h-10 flex-1 border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                      >
                        <option value="">-- Choose User ({filteredUsers.length} found) --</option>
                        {filteredUsers.slice(0, 50).map(u => (
                          <option key={u.id} value={u.id}>
                            {u.full_name || 'No Name'} ({u.email}) — [{u.vip_tier?.toUpperCase()}]
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleAddParticipant(g.id)}
                        disabled={addingUser || !selectedUserIdToAdd}
                        className="flex h-10 items-center justify-center gap-2 bg-primary px-5 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                      >
                        <UserPlus size={14} />
                        {addingUser ? 'Enrolling...' : 'Add to Giveaway'}
                      </button>
                    </div>
                  </div>

                  {/* Participants List */}
                  <div>
                    <div className="flex items-center justify-between pb-3">
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Enrolled Participants ({currentParticipants.length})
                      </h4>
                      <span className="text-[11px] text-muted-foreground">
                        Select a user below to crown directly as winner
                      </span>
                    </div>

                    {isLoadingThis ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">Loading participants...</div>
                    ) : currentParticipants.length === 0 ? (
                      <div className="rounded border border-dashed border-border py-8 text-center">
                        <Users size={24} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs font-bold">No participants yet</p>
                        <p className="text-[11px] text-muted-foreground">
                          Add users using the selection tool above or wait for users to enter.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border border border-border bg-card">
                        {currentParticipants.map(entry => {
                          const isWinner = g.winner_id === entry.user_id
                          const profile = entry.profiles

                          return (
                            <div
                              key={entry.id}
                              className={`flex flex-wrap items-center justify-between gap-3 p-3.5 transition-all ${
                                isWinner ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="grid size-8 place-items-center rounded bg-secondary font-mono text-xs font-bold">
                                  {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold">{profile?.full_name || 'Anonymous User'}</p>
                                    <span className="font-mono text-[10px] text-muted-foreground">
                                      ({profile?.email || entry.user_id.slice(0, 8)})
                                    </span>
                                    {entry.is_admin_selected && (
                                      <span className="rounded bg-purple-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-purple-400">
                                        Admin Selected
                                      </span>
                                    )}
                                    {Number(entry.paid_amount || 0) > 0 ? (
                                      <span className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-amber-500">
                                        Paid ${Number(entry.paid_amount).toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-emerald-500">
                                        Free Entry
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-mono text-[10px] text-muted-foreground">
                                    Tier: {profile?.vip_tier?.toUpperCase() || 'STANDARD'} · Entered:{' '}
                                    {new Date(entry.entered_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {isWinner ? (
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                                    <Trophy size={14} /> Official Winner
                                  </span>
                                ) : (
                                  g.status === 'active' && (
                                    <button
                                      onClick={() =>
                                        handleSelectSpecificWinner(
                                          g.id,
                                          entry.user_id,
                                          profile?.full_name || profile?.email || 'User'
                                        )
                                      }
                                      className="flex items-center gap-1 border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                                      title="Designate this user as the winner"
                                    >
                                      <Trophy size={12} /> Crown as Winner
                                    </button>
                                  )
                                )}

                                <button
                                  onClick={() => handleRemoveParticipant(g.id, entry.id)}
                                  className="text-muted-foreground hover:text-red-400 p-1 transition-all"
                                  title="Remove from giveaway"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </PlatformShell>
  )
}
