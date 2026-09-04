import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  confirmed: 'bg-blue-500/10 text-blue-600',
  processing: 'bg-blue-500/10 text-blue-600',
  shipped: 'bg-purple-500/10 text-purple-600',
  delivered: 'bg-green-500/10 text-green-600',
  cancelled: 'bg-primary/10 text-primary',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, product:products(name, category)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <PlatformShell>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Activity</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Orders</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Track products, redemptions, and deliveries.</p>
      </div>

      {(orders && orders.length > 0) ? (
        <div className="mt-8 space-y-3">
          {orders.map((o: any) => (
            <div key={o.id} className="border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center bg-muted text-primary"><Package size={20} /></div>
                  <div>
                    <p className="text-sm font-bold">{o.product?.name || 'Order'}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{o.order_number}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase ${statusColors[o.status] || 'bg-muted text-muted-foreground'}`}>
                  {o.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground">TOTAL</p>
                  <p className="mt-1 text-sm font-bold">{fmt(Number(o.total))}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground">ORDERED</p>
                  <p className="mt-1 text-sm font-bold">{new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground">TRACKING</p>
                  <p className="mt-1 text-sm font-bold">{o.tracking_info || '—'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <Package size={40} className="mx-auto text-muted-foreground" />
          <p className="mt-4 text-lg font-bold">No orders yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Your order history will appear here.</p>
          <Link href="/inventory" className="mt-6 inline-block bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Browse inventory</Link>
        </div>
      )}
    </PlatformShell>
  )
}
