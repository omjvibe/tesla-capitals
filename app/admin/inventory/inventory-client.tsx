'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Edit2, Package } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export function AdminInventoryClient({ products: initial }: { products: Product[] }) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<'vehicles' | 'energy' | 'accessories'>('vehicles')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [stockQty, setStockQty] = useState('10')
  const [loading, setLoading] = useState(false)

  const openCreate = () => {
    setEditingProduct(null)
    setName('')
    setCategory('vehicles')
    setDescription('')
    setPrice('')
    setImageUrl('')
    setStockQty('10')
    setShowForm(true)
  }

  const openEdit = (p: Product) => {
    setEditingProduct(p)
    setName(p.name)
    setCategory(p.category)
    setDescription(p.description || '')
    setPrice(String(p.price))
    setImageUrl(p.image_url || '')
    setStockQty(String(p.stock_qty))
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    if (editingProduct) {
      const { data, error } = await supabase.from('products').update({
        name,
        category,
        description,
        price: parseFloat(price),
        image_url: imageUrl || null,
        stock_qty: parseInt(stockQty),
      }).eq('id', editingProduct.id).select().single()

      if (!error && data) {
        setProducts(prev => prev.map(p => p.id === data.id ? data : p))
        setShowForm(false)
        router.refresh()
      }
    } else {
      const { data, error } = await supabase.from('products').insert({
        name,
        category,
        description,
        price: parseFloat(price),
        image_url: imageUrl || null,
        stock_qty: parseInt(stockQty),
        is_available: true,
      }).select().single()

      if (!error && data) {
        setProducts(prev => [data, ...prev])
        setShowForm(false)
        router.refresh()
      }
    }
    setLoading(false)
  }

  const handleToggleAvailable = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('products').update({ is_available: !current }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: !current } : p))
  }

  return (
    <PlatformShell admin>
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Store management</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Inventory ({products.length})</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 border border-border px-4 py-3 text-xs font-bold hover:border-primary">
          <Plus size={16} /> Add product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-8 border border-border bg-card p-6 flex flex-col gap-4">
          <p className="font-mono text-xs uppercase text-primary">
            {editingProduct ? `Edit product ${editingProduct.name}` : 'Add inventory product'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-bold">
              Product Name
              <input value={name} onChange={e => setName(e.target.value)} required className="h-10 border border-border bg-background px-3" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">
              Category
              <select value={category} onChange={e => setCategory(e.target.value as any)} className="h-10 border border-border bg-background px-3">
                <option value="vehicles">Vehicles</option>
                <option value="energy">Energy</option>
                <option value="accessories">Accessories</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">
              Price ($)
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="h-10 border border-border bg-background px-3" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold">
              Stock Quantity
              <input type="number" value={stockQty} onChange={e => setStockQty(e.target.value)} required className="h-10 border border-border bg-background px-3" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold sm:col-span-2">
              Image URL
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/photo-..." className="h-10 border border-border bg-background px-3" />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs font-bold">
            Description
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="border border-border bg-background p-3" />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="bg-primary px-6 py-3 text-xs font-bold text-primary-foreground">
              {loading ? 'Saving...' : editingProduct ? 'Update product' : 'Add product'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border px-6 py-3 text-xs font-bold">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-3">
        {products.map(p => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 border border-border bg-card p-5">
            <div className="flex items-center gap-4">
              {p.image_url ? (
                <div className="relative size-14 overflow-hidden border border-border bg-background">
                  <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="grid size-14 place-items-center bg-muted text-muted-foreground"><Package size={20} /></div>
              )}
              <div>
                <p className="text-sm font-bold">{p.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground capitalize">{p.category} · Stock: {p.stock_qty} · Price: {fmt(Number(p.price))}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => openEdit(p)}
                className="flex items-center gap-1 border border-border px-3 py-1.5 text-xs font-bold hover:border-primary"
              >
                <Edit2 size={13} /> Edit
              </button>
              <button
                onClick={() => handleToggleAvailable(p.id, p.is_available)}
                className={`px-3 py-1.5 text-xs font-bold ${p.is_available ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'}`}
              >
                {p.is_available ? 'Available' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </PlatformShell>
  )
}
