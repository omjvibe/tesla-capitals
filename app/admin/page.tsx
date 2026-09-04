import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, BarChart3, Gift, Package, ShieldCheck, Users, MessageSquare } from 'lucide-react'
import { PlatformShell } from '@/components/platform-shell'

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(n) }

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // KPIs
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { count: pendingKyc } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending')
  const { count: openTickets } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress'])
  const { count: vipMembers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('vip_tier', 'standard')
  const { count: activeInvestments } = await supabase.from('investments').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { count: activeGiveaways } = await supabase.from('giveaways').select('*', { count: 'exact', head: true }).eq('status', 'active')

  // Recent users
  const { data: recentUsers } = await supabase.from('profiles').select('id, email, full_name, role, created_at').order('created_at', { ascending: false }).limit(5)

  // Recent orders
  const { data: recentOrders } = await supabase.from('orders').select('id, order_number, total, status, created_at, product:products(name)').order('created_at', { ascending: false }).limit(5)

  const stats = [
    { label: 'Total users', value: String(totalUsers || 0), icon: Users, href: '/admin/users' },
    { label: 'Active investments', value: String(activeInvestments || 0), icon: BarChart3, href: '/admin/investments' },
    { label: 'Total orders', value: String(totalOrders || 0), icon: Package, href: '/admin/orders' },
    { label: 'Pending KYC', value: String(pendingKyc || 0), icon: ShieldCheck, href: '/admin/kyc' },
    { label: 'Open tickets', value: String(openTickets || 0), icon: MessageSquare, href: '/admin/support' },
    { label: 'VIP members', value: String(vipMembers || 0), icon: Users, href: '/admin/vip' },
  ]

  return (
    <PlatformShell admin>
      <div className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Operations overview</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Command center</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">System status and key performance indicators.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-3 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="group border border-border bg-card p-5 transition-colors hover:border-primary">
            <div className="flex items-center justify-between">
              <s.icon size={20} className="text-muted-foreground group-hover:text-primary" />
              <ArrowUpRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100" />
            </div>
            <p className="mt-6 text-3xl font-bold">{s.value}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Recent Users */}
        <section className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Recent users</p>
            <Link href="/admin/users" className="text-xs font-bold text-primary">View all</Link>
          </div>
          {(recentUsers || []).map((u: any) => (
            <div key={u.id} className="flex items-center justify-between border-b border-border p-5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="grid size-8 place-items-center bg-foreground font-mono text-xs text-background">
                  {(u.full_name || u.email || '?').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold">{u.full_name || 'Unnamed'}</p>
                  <p className="text-[10px] text-muted-foreground">{u.email}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {u.role}
              </span>
            </div>
          ))}
        </section>

        {/* Recent Orders */}
        <section className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Recent orders</p>
            <Link href="/admin/orders" className="text-xs font-bold text-primary">View all</Link>
          </div>
          {(recentOrders || []).length > 0 ? (
            (recentOrders || []).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between border-b border-border p-5 last:border-0">
                <div>
                  <p className="text-sm font-bold">{o.product?.name || o.order_number}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{o.order_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${Number(o.total).toLocaleString()}</p>
                  <span className="text-[10px] capitalize text-muted-foreground">{o.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">No orders yet.</div>
          )}
        </section>
      </div>
    </PlatformShell>
  )
}
