'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, ShieldCheck, X, Check } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import type { VipTierData } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export function AdminVipClient({ tiers: initial }: { tiers: VipTierData[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [tiers, setTiers] = useState(initial)

  // Modal / Form state
  const [showModal, setShowModal] = useState(false)
  const [editingTier, setEditingTier] = useState<VipTierData | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [benefitsText, setBenefitsText] = useState('')
  const [saving, setSaving] = useState(false)

  const handleOpenAdd = () => {
    setEditingTier(null)
    setName('')
    setPrice('')
    setDiscountPercent('0')
    setBenefitsText('')
    setShowModal(true)
  }

  const handleOpenEdit = (tier: VipTierData) => {
    setEditingTier(tier)
    setName(tier.name)
    setPrice(String(tier.price))
    setDiscountPercent(String(tier.discount_percent || 0))
    setBenefitsText(Array.isArray(tier.benefits) ? tier.benefits.join('\n') : '')
    setShowModal(true)
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('vip_tiers').update({ is_active: !current }).eq('id', id)
    setTiers(prev => prev.map(t => t.id === id ? { ...t, is_active: !current } : t))
    toast('VIP Tier Status Updated', `Tier is now ${!current ? 'Active' : 'Disabled'}.`)
    router.refresh()
  }

  const handleDeleteTier = async (id: string, tierName: string) => {
    if (!confirm(`Are you sure you want to delete VIP Tier "${tierName}"?`)) return
    const supabase = createClient()
    const { error } = await supabase.from('vip_tiers').delete().eq('id', id)
    if (!error) {
      setTiers(prev => prev.filter(t => t.id !== id))
      toast('VIP Tier Deleted', `Removed ${tierName} VIP Tier.`)
      router.refresh()
    }
  }

  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()

    const benefits = benefitsText
      .split('\n')
      .map(b => b.trim())
      .filter(Boolean)

    const payload = {
      name,
      price: parseFloat(price || '0'),
      discount_percent: parseFloat(discountPercent || '0'),
      benefits,
      is_active: true,
    }

    if (editingTier) {
      const { data, error } = await supabase
        .from('vip_tiers')
        .update(payload)
        .eq('id', editingTier.id)
        .select()
        .single()

      if (!error && data) {
        setTiers(prev => prev.map(t => t.id === editingTier.id ? data : t))
        toast('VIP Tier Updated', `Updated ${data.name} VIP Tier successfully.`)
        setShowModal(false)
      } else if (error) {
        toast('Failed to Update VIP Tier', error.message, 'error')
      }
    } else {
      const { data, error } = await supabase
        .from('vip_tiers')
        .insert(payload)
        .select()
        .single()

      if (!error && data) {
        setTiers(prev => [...prev, data])
        toast('VIP Tier Created', `Added ${data.name} VIP Tier successfully.`)
        setShowModal(false)
      } else if (error) {
        toast('Failed to Create VIP Tier', error.message, 'error')
      }
    }

    setSaving(false)
    router.refresh()
  }

  return (
    <PlatformShell admin>
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Membership Management</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">VIP Tiers ({tiers.length})</h1>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary px-5 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} /> Add VIP Tier
        </button>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {tiers.map(t => (
          <div key={t.id} className="border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold">{t.name}</p>
                <span className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${t.is_active ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                  {t.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold">{Number(t.price) === 0 ? 'Free' : `${fmt(Number(t.price))}/mo`}</p>
              {t.discount_percent > 0 && (
                <p className="mt-1 font-mono text-xs font-bold text-primary">{t.discount_percent}% Off Investments & Orders</p>
              )}

              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground border-t border-border pt-4">
                {(Array.isArray(t.benefits) ? t.benefits : []).map((b, i) => (
                  <p key={i} className="flex items-start gap-1.5">
                    <Check size={14} className="text-primary shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2 border-t border-border pt-4">
              <button
                onClick={() => handleOpenEdit(t)}
                className="flex flex-1 items-center justify-center gap-1 border border-border py-2 text-xs font-bold hover:border-primary"
              >
                <Edit2 size={13} /> Edit
              </button>
              <button
                onClick={() => handleToggleActive(t.id, t.is_active)}
                className={`flex flex-1 items-center justify-center gap-1 py-2 text-xs font-bold ${
                  t.is_active ? 'border border-border text-muted-foreground hover:text-foreground' : 'bg-green-600 text-white'
                }`}
              >
                {t.is_active ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => handleDeleteTier(t.id, t.name)}
                className="p-2 border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                title="Delete Tier"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit VIP Tier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveTier} className="w-full max-w-lg border border-border bg-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" />
                <h3 className="text-lg font-bold">{editingTier ? 'Edit VIP Tier' : 'Add New VIP Tier'}</h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-bold">
                Tier Name (e.g. Platinum VIP)
                <input value={name} onChange={e => setName(e.target.value)} required className="h-10 border border-border bg-background px-3" />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold">
                Price Per Month ($ USD)
                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="h-10 border border-border bg-background px-3" />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold sm:col-span-2">
                Investment / Inventory Discount (%)
                <input type="number" step="0.1" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} required className="h-10 border border-border bg-background px-3" />
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold sm:col-span-2">
                Tier Benefits (One benefit per line)
                <textarea
                  rows={5}
                  value={benefitsText}
                  onChange={e => setBenefitsText(e.target.value)}
                  placeholder="20% Discount on all investments&#10;Priority VIP Support&#10;Zero Fee Stock Swaps"
                  required
                  className="border border-border bg-background p-3 font-sans text-xs outline-none focus:border-primary"
                />
              </label>
            </div>

            <div className="flex gap-2 mt-2">
              <button type="submit" disabled={saving} className="bg-primary px-6 py-3 text-xs font-bold text-primary-foreground flex-1">
                {saving ? 'Saving Tier...' : editingTier ? 'Save Changes' : 'Create VIP Tier'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="border border-border px-4 py-3 text-xs font-bold">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </PlatformShell>
  )
}
