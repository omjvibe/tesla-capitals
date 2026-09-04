import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Package } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('category')
    .order('price', { ascending: false })

  const vehicles = (products || []).filter(p => p.category === 'vehicles')
  const energy = (products || []).filter(p => p.category === 'energy')
  const accessories = (products || []).filter(p => p.category === 'accessories')

  return (
    <PlatformShell>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Member benefits</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Inventory & Store</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Explore vehicles, energy products, and exclusive accessories.</p>
      </div>

      {(products && products.length > 0) ? (
        <>
          {vehicles.length > 0 && (
            <section className="mt-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Vehicles</p>
              <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {vehicles.map(p => (
                  <Link key={p.id} href={`/inventory/${p.id}`} className="group border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-xl">
                    {p.image_url ? (
                      <div className="relative h-48 w-full overflow-hidden border border-border bg-background mb-4">
                        <Image src={p.image_url} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="flex items-start justify-between mb-4">
                        <div className="grid size-10 place-items-center bg-muted text-primary"><Package size={20} /></div>
                        {p.stock_qty <= 5 && p.stock_qty > 0 && (
                          <span className="bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">LOW STOCK</span>
                        )}
                      </div>
                    )}
                    <p className="text-lg font-bold">{p.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                    <p className="mt-4 text-2xl font-bold">{fmt(Number(p.price))}</p>
                    {p.specs && typeof p.specs === 'object' && (
                      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
                        {Object.entries(p.specs as Record<string, string>).slice(0, 4).map(([k, v]) => (
                          <div key={k}>
                            <p className="font-mono text-[10px] uppercase text-muted-foreground">{k.replace('_', ' ')}</p>
                            <p className="mt-1 text-xs font-bold">{v}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">View details</span>
                      <ArrowUpRight size={16} className="text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {energy.length > 0 && (
            <section className="mt-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Energy</p>
              <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {energy.map(p => (
                  <Link key={p.id} href={`/inventory/${p.id}`} className="group border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-xl">
                    {p.image_url ? (
                      <div className="relative h-48 w-full overflow-hidden border border-border bg-background mb-4">
                        <Image src={p.image_url} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="grid size-10 place-items-center bg-muted text-primary mb-4"><Package size={20} /></div>
                    )}
                    <p className="text-lg font-bold">{p.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                    <p className="mt-4 text-2xl font-bold">{fmt(Number(p.price))}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">View details</span>
                      <ArrowUpRight size={16} className="text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {accessories.length > 0 && (
            <section className="mt-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Accessories</p>
              <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {accessories.map(p => (
                  <Link key={p.id} href={`/inventory/${p.id}`} className="group border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-xl">
                    {p.image_url ? (
                      <div className="relative h-48 w-full overflow-hidden border border-border bg-background mb-4">
                        <Image src={p.image_url} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="grid size-10 place-items-center bg-muted text-primary mb-4"><Package size={20} /></div>
                    )}
                    <p className="text-lg font-bold">{p.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                    <p className="mt-4 text-xl font-bold">{fmt(Number(p.price))}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="py-20 text-center">
          <Package size={40} className="mx-auto text-muted-foreground" />
          <p className="mt-4 text-lg font-bold">No products available</p>
          <p className="mt-2 text-sm text-muted-foreground">New products will appear here when published.</p>
        </div>
      )}
    </PlatformShell>
  )
}
