'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Wallet } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export function ProductDetailClient({ product, userId }: { product: Product; userId: string }) {
  const router = useRouter()
  const [userBalance, setUserBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadBalance() {
      const supabase = createClient()
      const { data } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single()
      if (data) {
        setUserBalance(Number(data.wallet_balance || 0))
      }
    }
    loadBalance()
  }, [userId])

  const handleOrder = async () => {
    setError('')
    if (product.stock_qty <= 0) {
      setError('Product is currently out of stock.')
      return
    }

    const supabase = createClient()
    const { data: prof } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single()
    const currentBalance = Number(prof?.wallet_balance || 0)

    if (currentBalance < Number(product.price)) {
      setError(`Insufficient wallet balance. Available: ${fmt(currentBalance)}, Required: ${fmt(Number(product.price))}. Please deposit funds into your wallet first.`)
      return
    }

    setLoading(true)

    // Deduct balance first
    const newBalance = currentBalance - Number(product.price)
    const { error: balError } = await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId)

    if (balError) {
      setError('Failed to process payment from wallet balance.')
      setLoading(false)
      return
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        product_id: product.id,
        total: product.price,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      // Refund balance if order failed
      await supabase.from('profiles').update({ wallet_balance: currentBalance }).eq('id', userId)
      setError(orderError.message)
      setLoading(false)
      return
    }

    // Insert transaction record
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'order',
      amount: -Number(product.price),
      description: `Order payment for ${product.name}`,
      reference_id: order.id,
    })

    // Reduce stock by 1
    if (product.stock_qty > 0) {
      await supabase.from('products').update({ stock_qty: product.stock_qty - 1 }).eq('id', product.id)
    }

    setUserBalance(newBalance)
    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/orders'), 2000)
  }

  const specs = product.specs && typeof product.specs === 'object' ? Object.entries(product.specs) : []

  return (
    <PlatformShell>
      <Link href="/inventory" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Back to inventory
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex items-start gap-4">
            <div className="grid size-12 place-items-center bg-muted text-primary"><Package size={24} /></div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-primary capitalize">{product.category}</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
            </div>
          </div>

          <p className="mt-6 text-3xl font-bold">{fmt(Number(product.price))}</p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">{product.description}</p>

          {specs.length > 0 && (
            <div className="mt-8 border-t border-border pt-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Specifications</p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {specs.map(([k, v]) => (
                  <div key={k} className="border border-border bg-card p-4">
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">{k.replace('_', ' ')}</p>
                    <p className="mt-1 text-sm font-bold">{String(v)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Purchase Card */}
        <div className="border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Order placement</p>
          <h2 className="mt-2 text-xl font-bold">Reserve {product.name}</h2>

          <div className="mt-6 space-y-3 border-y border-border py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold">{fmt(Number(product.price))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available Wallet Balance</span>
              <span className={`font-bold ${userBalance !== null && userBalance < Number(product.price) ? 'text-primary' : 'text-green-500'}`}>
                {userBalance !== null ? fmt(userBalance) : 'Loading...'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Availability</span>
              <span className="font-bold text-green-600">In stock ({product.stock_qty} left)</span>
            </div>
          </div>

          {userBalance !== null && userBalance < Number(product.price) && (
            <div className="mt-4 border border-primary/30 bg-primary/5 p-4 text-xs">
              <p className="font-bold text-primary flex items-center gap-1.5"><Wallet size={14} /> Insufficient Balance</p>
              <p className="mt-1 text-muted-foreground">You need {fmt(Number(product.price) - userBalance)} more to complete this order.</p>
              <Link href="/wallet" className="mt-3 inline-block font-mono text-[10px] font-bold uppercase tracking-widest text-primary underline">
                Deposit Funds to Wallet &rarr;
              </Link>
            </div>
          )}

          {error && (
            <div className="mt-4 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          {success ? (
            <div className="mt-6 border border-primary/30 bg-primary/5 p-5 text-center">
              <p className="text-lg font-bold text-primary">Order confirmed!</p>
              <p className="mt-2 text-sm text-muted-foreground">Payment deducted from wallet. Redirecting to orders...</p>
            </div>
          ) : (
            <button
              onClick={handleOrder}
              disabled={loading || product.stock_qty <= 0 || (userBalance !== null && userBalance < Number(product.price))}
              className="mt-6 h-12 w-full bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {loading ? 'Processing payment...' : 'Place order with Wallet Balance'}
            </button>
          )}
        </div>
      </div>
    </PlatformShell>
  )
}
